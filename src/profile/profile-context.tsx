import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Profile-domain state — Pro identity, storefront prefs, and app settings.
 * Mock-first: persisted to localStorage so toggles survive reload. In
 * production this syncs to Lovable Cloud (profiles, professionals, services,
 * portfolio_items, settings tables).
 */

export type ThemeChoice = "system" | "light" | "dark";
export type TextSize = "small" | "default" | "large" | "xlarge";
export type MessagePolicy = "anyone" | "confirmed" | "past";

export interface NotificationPrefs {
  newRequest: boolean;
  bookingConfirmed: boolean;
  bookingReminders: boolean;
  bookingCancelled: boolean;
  clientReviews: boolean;
  newMessages: boolean;
  mentions: boolean;
  payoutsProcessed: boolean;
  payoutFailed: boolean;
  marketingTips: boolean;
  marketingFeatures: boolean;
}

export interface PrivacyPrefs {
  searchVisible: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
  messagePolicy: MessagePolicy;
}

/** Structured service item: name (must be from VALID_SERVICES), duration in minutes, price in USD. */
export interface ServiceItem {
  id: string;
  name: string;
  durationMin: number;
  priceUsd: number;
}

/** Weekly availability — one window per day. `closed` = day off. */
export interface DayWindow {
  closed: boolean;
  start: string; // "HH:MM" 24h
  end: string;   // "HH:MM" 24h
}
export type WeeklyAvailability = Record<DayKey, DayWindow>;
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export interface ProfileData {
  // Identity
  fullName?: string;
  tagline?: string;
  handle?: string;
  neighborhood?: string;
  baseAddress?: string;
  travelRadiusMi: number;
  yearsExperience: number;
  avatarDataUrl?: string;
  coverDataUrl?: string;
  // Storefront
  /** Legacy: list of service names (display only). Source of truth is `serviceMenu`. */
  services: string[];
  serviceMenu: ServiceItem[];
  portfolio: string[];         // image data URLs
  // Reviews aggregate (mock)
  rating?: number;
  reviewCount?: number;
  // Availability
  availability: WeeklyAvailability;
  /** Derived/legacy summary string. Kept for backward-compat with existing UI. */
  availabilitySummary?: string;
  // Payouts
  bankName?: string;
  bankLast4?: string;
  // Socials
  instagram?: string;
  tiktok?: string;
  // Settings — preferences
  language: string;            // BCP-47-ish key, e.g. "en", "yo", "fr", "ar"
  theme: ThemeChoice;
  textSize: TextSize;
  notifications: NotificationPrefs;
  muteUntilIso?: string;
  privacy: PrivacyPrefs;
  blocked: { id: string; name: string }[];
}

export const VALID_SERVICES = [
  "Silk press",
  "Trim",
  "Loc retwist",
  "Knotless braids",
  "Box braids",
  "Cornrows",
  "Crochet",
  "Wash and go",
  "Blowout",
  "Color touch-up",
] as const;

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  newRequest: true,
  bookingConfirmed: true,
  bookingReminders: true,
  bookingCancelled: true,
  clientReviews: true,
  newMessages: true,
  mentions: true,
  payoutsProcessed: true,
  payoutFailed: true,
  marketingTips: false,
  marketingFeatures: false,
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  searchVisible: true,
  showOnlineStatus: true,
  showLastActive: true,
  messagePolicy: "anyone",
};

const DEFAULT_AVAILABILITY: WeeklyAvailability = {
  mon: { closed: true, start: "10:00", end: "19:00" },
  tue: { closed: false, start: "10:00", end: "19:00" },
  wed: { closed: false, start: "10:00", end: "19:00" },
  thu: { closed: false, start: "10:00", end: "19:00" },
  fri: { closed: false, start: "10:00", end: "19:00" },
  sat: { closed: false, start: "10:00", end: "19:00" },
  sun: { closed: true, start: "10:00", end: "17:00" },
};

const DEFAULT_SERVICE_MENU: ServiceItem[] = [
  { id: "svc-silk", name: "Silk press", durationMin: 120, priceUsd: 120 },
  { id: "svc-knotless", name: "Knotless braids", durationMin: 360, priceUsd: 280 },
  { id: "svc-box", name: "Box braids", durationMin: 300, priceUsd: 240 },
  { id: "svc-corn", name: "Cornrows", durationMin: 90, priceUsd: 80 },
  { id: "svc-trim", name: "Trim", durationMin: 30, priceUsd: 35 },
];

export const DEFAULT_PROFILE: ProfileData = {
  fullName: "Amara Johnson",
  tagline: "Brooklyn-based stylist focused on textured hair and protective styles.",
  handle: "amara.studio",
  neighborhood: "Bed-Stuy, Brooklyn",
  baseAddress: "123 Putnam Ave, Brooklyn, NY",
  travelRadiusMi: 10,
  yearsExperience: 6,
  services: DEFAULT_SERVICE_MENU.map((s) => s.name),
  serviceMenu: DEFAULT_SERVICE_MENU,
  portfolio: [],
  rating: 4.9,
  reviewCount: 47,
  availability: DEFAULT_AVAILABILITY,
  availabilitySummary: "Tue–Sat · 10 AM – 7 PM",
  bankName: undefined,
  bankLast4: undefined,
  instagram: undefined,
  tiktok: undefined,
  language: "en",
  theme: "system",
  textSize: "default",
  notifications: DEFAULT_NOTIFICATIONS,
  privacy: DEFAULT_PRIVACY,
  blocked: [],
};

export const LANGUAGES: { code: string; native: string; english: string; group: string; rtl?: boolean }[] = [
  // West Africa
  { code: "en", native: "English", english: "English", group: "West Africa" },
  { code: "yo", native: "Yorùbá", english: "Yoruba", group: "West Africa" },
  { code: "pcm", native: "Naijá", english: "Nigerian Pidgin", group: "West Africa" },
  { code: "ig", native: "Igbo", english: "Igbo", group: "West Africa" },
  { code: "ha", native: "Hausa", english: "Hausa", group: "West Africa" },
  { code: "wo", native: "Wolof", english: "Wolof", group: "West Africa" },
  { code: "tw", native: "Twi", english: "Twi", group: "West Africa" },
  // East + Central Africa
  { code: "sw", native: "Kiswahili", english: "Swahili", group: "East + Central Africa" },
  { code: "am", native: "አማርኛ", english: "Amharic", group: "East + Central Africa" },
  { code: "so", native: "Soomaali", english: "Somali", group: "East + Central Africa" },
  { code: "ln", native: "Lingála", english: "Lingala", group: "East + Central Africa" },
  // European
  { code: "fr", native: "Français", english: "French", group: "European" },
  { code: "es", native: "Español", english: "Spanish", group: "European" },
  { code: "pt-BR", native: "Português", english: "Portuguese (Brazil)", group: "European" },
  { code: "ar", native: "العربية", english: "Arabic", group: "European", rtl: true },
  // Asia + Pacific
  { code: "ko", native: "한국어", english: "Korean", group: "Asia + Pacific" },
  { code: "zh", native: "中文", english: "Mandarin", group: "Asia + Pacific" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese", group: "Asia + Pacific" },
  { code: "tl", native: "Tagalog", english: "Tagalog", group: "Asia + Pacific" },
  // Caribbean
  { code: "ht", native: "Kreyòl Ayisyen", english: "Haitian Creole", group: "Caribbean" },
];

interface Ctx {
  data: ProfileData;
  patch: (next: Partial<ProfileData>) => void;
  patchNotifications: (next: Partial<NotificationPrefs>) => void;
  patchPrivacy: (next: Partial<PrivacyPrefs>) => void;
  reset: () => void;
}

const STORAGE_KEY = "ewa.profile.v1";
const Ctx_ = createContext<Ctx | null>(null);

function read(): ProfileData {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as ProfileData) };
  } catch {
    return DEFAULT_PROFILE;
  }
}
function write(d: ProfileData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProfileData>(DEFAULT_PROFILE);

  useEffect(() => {
    setData(read());
  }, []);

  // Apply theme + text size to documentElement so it sticks across pages.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const sysDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const dark = data.theme === "dark" || (data.theme === "system" && sysDark);
    root.classList.toggle("dark", dark);
    const scale = data.textSize === "small" ? 0.92 : data.textSize === "large" ? 1.1 : data.textSize === "xlarge" ? 1.22 : 1;
    root.style.setProperty("--ewa-text-scale", String(scale));
    const lang = LANGUAGES.find((l) => l.code === data.language);
    root.setAttribute("lang", data.language);
    root.setAttribute("dir", lang?.rtl ? "rtl" : "ltr");
  }, [data.theme, data.textSize, data.language]);

  const patch = useCallback((next: Partial<ProfileData>) => {
    setData((prev) => {
      const merged = { ...prev, ...next };
      write(merged);
      return merged;
    });
  }, []);

  const patchNotifications = useCallback((next: Partial<NotificationPrefs>) => {
    setData((prev) => {
      const merged = { ...prev, notifications: { ...prev.notifications, ...next } };
      write(merged);
      return merged;
    });
  }, []);

  const patchPrivacy = useCallback((next: Partial<PrivacyPrefs>) => {
    setData((prev) => {
      const merged = { ...prev, privacy: { ...prev.privacy, ...next } };
      write(merged);
      return merged;
    });
  }, []);

  const reset = useCallback(() => {
    write(DEFAULT_PROFILE);
    setData(DEFAULT_PROFILE);
  }, []);

  return <Ctx_.Provider value={{ data, patch, patchNotifications, patchPrivacy, reset }}>{children}</Ctx_.Provider>;
}

export function useProfile(): Ctx {
  const ctx = useContext(Ctx_);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}

/** Two-letter monogram from a full name, per mem://design memory rule. */
export function monogramOf(name?: string): string {
  if (!name) return "EW";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EW";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
