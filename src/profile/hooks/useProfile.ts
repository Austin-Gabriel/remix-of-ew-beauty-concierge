import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/auth-context";
import { useDevState } from "@/dev-state/dev-state-context";

export interface ProfileService {
  id: string;
  name: string;
  priceUsd: number;
  durationMinutes: number;
}
export interface ProfilePortfolioItem {
  id: string;
  imageUrl: string;
  caption: string | null;
}
export interface ProfileReview {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
}
export interface ProfileSocial {
  platform: "instagram" | "tiktok" | "youtube";
  handle: string;
}
export interface ProfileAvailability {
  /** Display string e.g. "Mon–Sat · 9 AM – 7 PM" */
  summary: string | null;
}
export interface ProfilePayout {
  /** e.g. "Visa ··4242" or null when not connected */
  method: string | null;
}

export interface ProfileSnapshot {
  loading: boolean;
  name: string;
  role: string;
  neighborhood: string;
  avatarUrl: string | null;
  rating: number | null;
  reviewCount: number;
  services: ProfileService[];
  portfolio: ProfilePortfolioItem[];
  recentReviews: ProfileReview[];
  socials: ProfileSocial[];
  availability: ProfileAvailability;
  payout: ProfilePayout;
  hasUnreadNotifications: boolean;
}

const EMPTY: ProfileSnapshot = {
  loading: true,
  name: "Your studio",
  role: "Stylist",
  neighborhood: "",
  avatarUrl: null,
  rating: null,
  reviewCount: 0,
  services: [],
  portfolio: [],
  recentReviews: [],
  socials: [],
  availability: { summary: null },
  payout: { method: null },
  hasUnreadNotifications: false,
};

const SPARSE: ProfileSnapshot = {
  loading: false,
  name: "Aaliyah Bennett",
  role: "Stylist",
  neighborhood: "Brooklyn, NY",
  avatarUrl: null,
  rating: 4.93,
  reviewCount: 128,
  services: [
    { id: "s1", name: "Silk press", priceUsd: 120, durationMinutes: 90 },
    { id: "s2", name: "Wash and go", priceUsd: 85, durationMinutes: 60 },
    { id: "s3", name: "Trim", priceUsd: 95, durationMinutes: 45 },
  ],
  portfolio: [],
  recentReviews: [],
  socials: [],
  availability: { summary: "Mon–Sat · 9 AM – 7 PM" },
  payout: { method: "Chase ··5421" },
  hasUnreadNotifications: false,
};

const RICH: ProfileSnapshot = {
  ...SPARSE,
  rating: 4.9,
  reviewCount: 134,
  services: [
    { id: "s1", name: "Silk press", priceUsd: 120, durationMinutes: 90 },
    { id: "s2", name: "Wash & style", priceUsd: 75, durationMinutes: 60 },
    { id: "s3", name: "Box braids — small", priceUsd: 280, durationMinutes: 360 },
    { id: "s4", name: "Knotless braids", priceUsd: 240, durationMinutes: 300 },
    { id: "s5", name: "Trim & treatment", priceUsd: 65, durationMinutes: 45 },
  ],
  portfolio: Array.from({ length: 9 }).map((_, i) => ({
    id: `p${i}`,
    imageUrl: `https://images.unsplash.com/photo-152233824${(i % 9) + 1}992-e1a54906a8da?w=400`,
    caption: null,
  })),
  recentReviews: [
    { id: "r1", rating: 5, body: "Best silk press in BK.", createdAt: "" },
    { id: "r2", rating: 5, body: "Patient, clean, on time. Booked again.", createdAt: "" },
    { id: "r3", rating: 4, body: "Good vibes, slight wait.", createdAt: "" },
  ],
  socials: [
    { platform: "instagram", handle: "@aaliyahdoeshair" },
    { platform: "tiktok", handle: "@aaliyah.bk" },
  ],
  availability: { summary: "Mon–Sat · 9 AM – 7 PM" },
  payout: { method: "Visa ··4242" },
  hasUnreadNotifications: true,
};

/**
 * useProfile — Reads from Lovable Cloud (profiles + professionals + services
 * + portfolio_items + pro_reviews + professional_payouts) when the user is
 * signed in. Falls back to mocks driven by the dev Data Density toggle so
 * Empty / Sparse / Rich states render gracefully during QA.
 */
export function useProfile(): ProfileSnapshot {
  const { userId, displayName, email } = useAuth();
  const { state: dev } = useDevState();
  const [data, setData] = useState<ProfileSnapshot>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      // No session — fall back to dev density mock. Default to SPARSE so the
      // page looks intentional in design QA without dev-state toggling.
      const mock =
        dev.dataDensity === "rich" ? RICH : dev.dataDensity === "empty" ? EMPTY : SPARSE;
      setData({ ...mock, loading: false });
      return;
    }

    (async () => {
      const [profileRes, proRes, servicesRes, portfolioRes, reviewsRes, payoutRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, city").eq("id", userId).maybeSingle(),
        supabase.from("professionals").select("avg_rating, base_location").eq("id", userId).maybeSingle(),
        supabase
          .from("services")
          .select("id, name, price_cents, duration_minutes")
          .eq("professional_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("portfolio_items")
          .select("id, image_url, caption")
          .eq("professional_id", userId)
          .order("display_order", { ascending: true })
          .limit(12),
        supabase
          .from("pro_reviews")
          .select("id, rating, body, created_at")
          .eq("professional_id", userId)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("professional_payouts")
          .select("payouts_enabled, charges_enabled")
          .eq("professional_id", userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const reviewCount = reviewsRes.data?.length ?? 0;
      const fallbackName = displayName ?? email?.split("@")[0] ?? "Your studio";

      setData({
        loading: false,
        name: profileRes.data?.full_name ?? fallbackName,
        role: "Stylist",
        neighborhood: profileRes.data?.city ?? "",
        avatarUrl: profileRes.data?.avatar_url ?? null,
        rating: proRes.data?.avg_rating != null ? Number(proRes.data.avg_rating) : null,
        reviewCount,
        services:
          servicesRes.data?.map((s) => ({
            id: s.id,
            name: s.name,
            priceUsd: Math.round((s.price_cents ?? 0) / 100),
            durationMinutes: s.duration_minutes ?? 0,
          })) ?? [],
        portfolio:
          portfolioRes.data?.map((p) => ({
            id: p.id,
            imageUrl: p.image_url,
            caption: p.caption,
          })) ?? [],
        recentReviews:
          reviewsRes.data?.map((r) => ({
            id: r.id,
            rating: r.rating,
            body: r.body,
            createdAt: r.created_at,
          })) ?? [],
        socials: [],
        availability: { summary: null },
        payout: {
          method: payoutRes.data?.payouts_enabled ? "Bank account connected" : null,
        },
        hasUnreadNotifications: false,
      });
    })().catch(() => {
      if (cancelled) return;
      setData({ ...EMPTY, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, displayName, email, dev.dataDensity]);

  return data;
}
