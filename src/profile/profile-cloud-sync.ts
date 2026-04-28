import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_PROFILE,
  DEFAULT_NOTIFICATIONS,
  DAY_ORDER,
  type ProfileData,
  type NotificationPrefs,
  type PrivacyPrefs,
  type WeeklyAvailability,
  type DayKey,
  type ServiceItem,
  type ThemeChoice,
  type TextSize,
  type MessagePolicy,
} from "./profile-context";

/**
 * Cloud sync layer for the Pro Profile + Settings system.
 *
 * Reads/writes are scoped to the signed-in Pro (auth.uid). All RLS is enforced
 * server-side via the policies defined in the Phase 2 migration:
 *   - professionals.{tagline, handle, neighborhood, base_address, instagram, tiktok, cover_url, ...}
 *   - profiles.{full_name, avatar_url, city}
 *   - services (one row per ServiceItem)
 *   - portfolio_items
 *   - availability_blocks (one row per open day window)
 *   - blocked_pairs
 *   - pro_preferences (theme, text size, language, notifications, privacy)
 */

// ───────────── helpers ─────────────

function dayIdxFromKey(k: DayKey): number {
  // ISO-style: Mon=1 .. Sun=7
  return DAY_ORDER.indexOf(k) + 1;
}
function dayKeyFromIdx(i: number): DayKey {
  return DAY_ORDER[(i - 1) % 7] ?? "mon";
}
function timeStrToHHMM(t: string | null | undefined): string {
  if (!t) return "10:00";
  // postgres returns "HH:MM:SS" — trim seconds
  return t.slice(0, 5);
}
function summariseAvailability(a: WeeklyAvailability): string {
  const open = DAY_ORDER.filter((d) => !a[d].closed);
  if (open.length === 0) return "Closed all week";
  // Find contiguous span
  const labels: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  const first = open[0];
  const last = open[open.length - 1];
  const span = open.length === 1 ? labels[first] : `${labels[first]}–${labels[last]}`;
  const w = a[first];
  const fmt = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return `${span} · ${fmt(w.start)} – ${fmt(w.end)}`;
}

// ───────────── HYDRATE: cloud → ProfileData ─────────────

export async function hydrateProfileFromCloud(userId: string): Promise<ProfileData> {
  const [profileRes, proRes, prefsRes, servicesRes, portfolioRes, availRes, blockedRes, payoutRes] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url, city").eq("id", userId).maybeSingle(),
    supabase
      .from("professionals")
      .select("bio, tagline, handle, neighborhood, base_address, instagram, tiktok, cover_url, years_experience, service_radius_km, avg_rating, total_bookings")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("pro_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("services").select("id, name, duration_minutes, price_cents").eq("professional_id", userId).eq("is_active", true).order("created_at", { ascending: true }),
    supabase.from("portfolio_items").select("id, image_url, display_order").eq("professional_id", userId).order("display_order", { ascending: true }),
    supabase.from("availability_blocks").select("day_of_week, start_time, end_time").eq("professional_id", userId),
    supabase.from("blocked_pairs").select("id, blocked_user_id").eq("blocker_user_id", userId),
    supabase.from("professional_payouts").select("stripe_account_id, payouts_enabled").eq("professional_id", userId).maybeSingle(),
  ]);

  const data: ProfileData = { ...DEFAULT_PROFILE };

  // Identity
  if (profileRes.data) {
    data.fullName = profileRes.data.full_name ?? data.fullName;
    data.avatarDataUrl = profileRes.data.avatar_url ?? undefined;
    if (profileRes.data.city) data.neighborhood = profileRes.data.city;
  }
  if (proRes.data) {
    data.tagline = proRes.data.tagline ?? proRes.data.bio ?? data.tagline;
    data.handle = proRes.data.handle ?? data.handle;
    data.neighborhood = proRes.data.neighborhood ?? data.neighborhood;
    data.baseAddress = proRes.data.base_address ?? data.baseAddress;
    data.instagram = proRes.data.instagram ?? undefined;
    data.tiktok = proRes.data.tiktok ?? undefined;
    data.coverDataUrl = proRes.data.cover_url ?? undefined;
    data.yearsExperience = proRes.data.years_experience ?? data.yearsExperience;
    data.travelRadiusMi = proRes.data.service_radius_km != null ? Math.round(Number(proRes.data.service_radius_km) * 0.621371) : data.travelRadiusMi;
    data.rating = proRes.data.avg_rating != null ? Number(proRes.data.avg_rating) : data.rating;
    data.reviewCount = proRes.data.total_bookings ?? data.reviewCount;
  }

  // Preferences
  if (prefsRes.data) {
    const p = prefsRes.data;
    data.theme = p.theme as ThemeChoice;
    data.textSize = p.text_size as TextSize;
    data.language = p.language;
    data.muteUntilIso = p.mute_until ?? undefined;
    data.notifications = {
      newRequest: p.notify_new_request,
      bookingConfirmed: p.notify_booking_confirmed,
      bookingReminders: p.notify_booking_reminders,
      bookingCancelled: p.notify_booking_cancelled,
      clientReviews: p.notify_client_reviews,
      newMessages: p.notify_new_messages,
      mentions: p.notify_mentions,
      payoutsProcessed: p.notify_payouts_processed,
      payoutFailed: p.notify_payout_failed,
      marketingTips: p.notify_marketing_tips,
      marketingFeatures: p.notify_marketing_features,
    };
    data.privacy = {
      searchVisible: p.search_visible,
      showOnlineStatus: p.show_online_status,
      showLastActive: p.show_last_active,
      messagePolicy: p.message_policy as MessagePolicy,
    };
  }

  // Service menu
  if (servicesRes.data) {
    data.serviceMenu = servicesRes.data.map((s) => ({
      id: s.id,
      name: s.name,
      durationMin: s.duration_minutes,
      priceUsd: Math.round((s.price_cents ?? 0) / 100),
    }));
    data.services = data.serviceMenu.map((s) => s.name);
  }

  // Portfolio
  if (portfolioRes.data) {
    data.portfolio = portfolioRes.data.map((p) => p.image_url);
  }

  // Availability
  if (availRes.data && availRes.data.length > 0) {
    const fresh: WeeklyAvailability = JSON.parse(JSON.stringify(DEFAULT_PROFILE.availability));
    DAY_ORDER.forEach((d) => (fresh[d].closed = true));
    for (const row of availRes.data) {
      const k = dayKeyFromIdx(row.day_of_week);
      fresh[k] = { closed: false, start: timeStrToHHMM(row.start_time as unknown as string), end: timeStrToHHMM(row.end_time as unknown as string) };
    }
    data.availability = fresh;
    data.availabilitySummary = summariseAvailability(fresh);
  }

  // Blocked
  if (blockedRes.data) {
    data.blocked = blockedRes.data.map((b) => ({ id: b.id, name: `Client ${b.blocked_user_id.slice(0, 6)}` }));
  }

  // Payouts (mock display: bankName/last4 derived from connected stripe acct)
  if (payoutRes.data?.stripe_account_id) {
    data.bankName = "Connected account";
    data.bankLast4 = payoutRes.data.stripe_account_id.slice(-4);
  }

  return data;
}

// ───────────── PERSIST helpers ─────────────

/** Upsert the prefs row. Safe to call on every settings toggle. */
export async function persistPreferences(userId: string, data: ProfileData): Promise<void> {
  const n = data.notifications;
  const p = data.privacy;
  await supabase.from("pro_preferences").upsert({
    user_id: userId,
    theme: data.theme,
    text_size: data.textSize,
    language: data.language,
    mute_until: data.muteUntilIso ?? null,
    notify_new_request: n.newRequest,
    notify_booking_confirmed: n.bookingConfirmed,
    notify_booking_reminders: n.bookingReminders,
    notify_booking_cancelled: n.bookingCancelled,
    notify_client_reviews: n.clientReviews,
    notify_new_messages: n.newMessages,
    notify_mentions: n.mentions,
    notify_payouts_processed: n.payoutsProcessed,
    notify_payout_failed: n.payoutFailed,
    notify_marketing_tips: n.marketingTips,
    notify_marketing_features: n.marketingFeatures,
    search_visible: p.searchVisible,
    show_online_status: p.showOnlineStatus,
    show_last_active: p.showLastActive,
    message_policy: p.messagePolicy,
  }, { onConflict: "user_id" });
}

/** Update profile + professional rows (identity, storefront, socials). */
export async function persistProfile(userId: string, data: ProfileData): Promise<void> {
  await Promise.all([
    supabase.from("profiles").upsert({
      id: userId,
      full_name: data.fullName ?? null,
      avatar_url: data.avatarDataUrl ?? null,
      city: data.neighborhood ?? null,
    }, { onConflict: "id" }),
    supabase.from("professionals").upsert({
      id: userId,
      tagline: data.tagline ?? null,
      handle: data.handle ?? null,
      neighborhood: data.neighborhood ?? null,
      base_address: data.baseAddress ?? null,
      instagram: data.instagram ?? null,
      tiktok: data.tiktok ?? null,
      cover_url: data.coverDataUrl ?? null,
      years_experience: data.yearsExperience,
      service_radius_km: Math.round(data.travelRadiusMi * 1.60934),
      bio: data.tagline ?? null,
    }, { onConflict: "id" }),
  ]);
}

/** Replace the service menu (delete-all-then-insert is safest for small lists). */
export async function persistServices(userId: string, menu: ServiceItem[]): Promise<void> {
  await supabase.from("services").delete().eq("professional_id", userId);
  if (menu.length === 0) return;
  await supabase.from("services").insert(
    menu.map((s) => ({
      professional_id: userId,
      name: s.name,
      duration_minutes: s.durationMin,
      price_cents: Math.round(s.priceUsd * 100),
      is_active: true,
    }))
  );
}

/** Replace weekly availability windows. */
export async function persistAvailability(userId: string, weekly: WeeklyAvailability): Promise<void> {
  await supabase.from("availability_blocks").delete().eq("professional_id", userId);
  const rows = DAY_ORDER.filter((d) => !weekly[d].closed).map((d) => ({
    professional_id: userId,
    day_of_week: dayIdxFromKey(d),
    start_time: weekly[d].start,
    end_time: weekly[d].end,
  }));
  if (rows.length > 0) {
    await supabase.from("availability_blocks").insert(rows);
  }
}

/** Replace portfolio order. Captions kept null; rows reference uploaded URLs. */
export async function persistPortfolio(userId: string, urls: string[]): Promise<void> {
  await supabase.from("portfolio_items").delete().eq("professional_id", userId);
  if (urls.length === 0) return;
  await supabase.from("portfolio_items").insert(
    urls.map((u, i) => ({ professional_id: userId, image_url: u, display_order: i }))
  );
}

// ───────────── STORAGE: avatar + portfolio uploads ─────────────

async function uploadFile(bucket: "avatars" | "portfolio", userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadAvatar = (userId: string, file: File) => uploadFile("avatars", userId, file);
export const uploadPortfolioPhoto = (userId: string, file: File) => uploadFile("portfolio", userId, file);

/** Convert a data URL back into a File for upload (used by existing edit forms). */
export function dataUrlToFile(dataUrl: string, name = "upload.jpg"): File | null {
  if (!dataUrl.startsWith("data:")) return null;
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}
