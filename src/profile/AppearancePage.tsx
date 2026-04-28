import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useT } from "@/profile/i18n/SettingsI18nProvider";
import { useDevState } from "@/dev-state/dev-state-context";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Monitor } from "lucide-react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";

/* ------------------------------------------------------------------ */
/* AppearancePage                                                     */
/* ------------------------------------------------------------------ */
export function AppearancePage() {
  const { state, setTheme } = useDevState();
  const [textScale, setTextScale] = useState<"sm" | "md" | "lg">(() => {
    if (typeof window === "undefined") return "md";
    return (window.localStorage.getItem("ewa.textScale") as "sm" | "md" | "lg") || "md";
  });

  const setScale = (s: "sm" | "md" | "lg") => {
    setTextScale(s);
    if (typeof window !== "undefined") window.localStorage.setItem("ewa.textScale", s);
  };

  return (
    <SubpageShell title="Appearance">
      <SectionLabel>Theme</SectionLabel>
      <SectionCard>
        <ThemeRow
          icon={<Sun size={14} strokeWidth={1.8} />}
          label="Light"
          active={state.theme === "light"}
          onClick={() => setTheme("light")}
        />
        <ThemeRow
          icon={<Moon size={14} strokeWidth={1.8} />}
          label="Dark"
          active={state.theme === "dark"}
          onClick={() => setTheme("dark")}
        />
        <ThemeRow
          icon={<Monitor size={14} strokeWidth={1.8} />}
          label="System"
          active={state.theme === "system"}
          onClick={() => setTheme("system")}
        />
      </SectionCard>

      <SectionLabel>Text size</SectionLabel>
      <SectionCard>
        {(["sm", "md", "lg"] as const).map((s) => (
          <ThemeRow
            key={s}
            icon={<span className="text-[12px] font-semibold">A</span>}
            label={s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
            active={textScale === s}
            onClick={() => setScale(s)}
          />
        ))}
      </SectionCard>
    </SubpageShell>
  );
}

function ThemeRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      hideChevron
      onClick={onClick}
      right={
        active ? (
          <span style={{ color: "var(--eb-orange)", fontSize: 18, fontWeight: 600 }}>✓</span>
        ) : undefined
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* LanguagePage                                                       */
/* ------------------------------------------------------------------ */
const LOCALES: { code: string; en: string; native: string }[] = [
  { code: "en", en: "English", native: "English" },
  { code: "es", en: "Spanish", native: "Español" },
  { code: "fr", en: "French", native: "Français" },
  { code: "pt", en: "Portuguese", native: "Português" },
  { code: "de", en: "German", native: "Deutsch" },
  { code: "it", en: "Italian", native: "Italiano" },
  { code: "yo", en: "Yoruba", native: "Yorùbá" },
  { code: "sw", en: "Swahili", native: "Kiswahili" },
  { code: "ha", en: "Hausa", native: "Hausa" },
  { code: "ig", en: "Igbo", native: "Igbo" },
  { code: "ar", en: "Arabic", native: "العربية" },
  { code: "zh", en: "Chinese", native: "中文" },
  { code: "ja", en: "Japanese", native: "日本語" },
  { code: "ko", en: "Korean", native: "한국어" },
  { code: "hi", en: "Hindi", native: "हिन्दी" },
  { code: "vi", en: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", en: "Thai", native: "ไทย" },
  { code: "tr", en: "Turkish", native: "Türkçe" },
  { code: "pl", en: "Polish", native: "Polski" },
  { code: "ru", en: "Russian", native: "Русский" },
];

export function LanguagePage() {
  const { locale, setLocale } = useT();
  return (
    <SubpageShell title="Language">
      <SectionCard>
        {LOCALES.map((l) => (
          <SettingsRow
            key={l.code}
            icon={
              <span
                className="text-[11px] font-medium uppercase"
                style={{ color: "var(--eb-fg-muted)" }}
              >
                {l.code}
              </span>
            }
            label={l.en}
            sublabel={l.native}
            hideChevron
            onClick={() => setLocale(l.code)}
            right={
              locale === l.code ? (
                <span style={{ color: "var(--eb-orange)", fontSize: 18, fontWeight: 600 }}>
                  ✓
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: '"Fraunces", Times, serif',
                    color: "var(--eb-fg-muted)",
                    fontSize: 14,
                  }}
                >
                  {l.native}
                </span>
              )
            }
          />
        ))}
      </SectionCard>
    </SubpageShell>
  );
}

/* ------------------------------------------------------------------ */
/* NotificationsPage                                                  */
/* ------------------------------------------------------------------ */
const NOTIF_PREFS_KEY = "ewa.notifPrefs";
const DEFAULT_NOTIF_PREFS = {
  pushNewBooking: true,
  pushReminders: true,
  pushMessages: true,
  pushReviews: false,
  emailWeekly: true,
  emailPromotions: false,
  smsUrgent: true,
};
type NotifPrefs = typeof DEFAULT_NOTIF_PREFS;

function loadNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS;
  try {
    const raw = window.localStorage.getItem(NOTIF_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIF_PREFS;
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

const NOTIF_LABELS: Record<keyof NotifPrefs, string> = {
  pushNewBooking: "New booking requests",
  pushReminders: "Appointment reminders",
  pushMessages: "Messages",
  pushReviews: "New reviews",
  emailWeekly: "Weekly summary",
  emailPromotions: "Promotions & tips",
  smsUrgent: "Urgent alerts only",
};

export function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadNotifPrefs());
    setHydrated(true);
  }, []);

  const set = (k: keyof NotifPrefs) => (v: boolean) => {
    // Optimistic UI: flip state immediately, persist + toast in same tick.
    setPrefs((p) => {
      const next = { ...p, [k]: v };
      try {
        window.localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable in private mode */
      }
      return next;
    });
    toast.success(`${NOTIF_LABELS[k]} ${v ? "on" : "off"}`);
  };

  return (
    <SubpageShell title="Notifications">
      <SectionLabel>Push</SectionLabel>
      <SectionCard>
        <ToggleRow label={NOTIF_LABELS.pushNewBooking} value={prefs.pushNewBooking} onChange={set("pushNewBooking")} disabled={!hydrated} />
        <ToggleRow label={NOTIF_LABELS.pushReminders} value={prefs.pushReminders} onChange={set("pushReminders")} disabled={!hydrated} />
        <ToggleRow label={NOTIF_LABELS.pushMessages} value={prefs.pushMessages} onChange={set("pushMessages")} disabled={!hydrated} />
        <ToggleRow label={NOTIF_LABELS.pushReviews} value={prefs.pushReviews} onChange={set("pushReviews")} disabled={!hydrated} />
      </SectionCard>

      <SectionLabel>Email</SectionLabel>
      <SectionCard>
        <ToggleRow label={NOTIF_LABELS.emailWeekly} value={prefs.emailWeekly} onChange={set("emailWeekly")} disabled={!hydrated} />
        <ToggleRow label={NOTIF_LABELS.emailPromotions} value={prefs.emailPromotions} onChange={set("emailPromotions")} disabled={!hydrated} />
      </SectionCard>

      <SectionLabel>SMS</SectionLabel>
      <SectionCard>
        <ToggleRow label={NOTIF_LABELS.smsUrgent} value={prefs.smsUrgent} onChange={set("smsUrgent")} disabled={!hydrated} />
      </SectionCard>
    </SubpageShell>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SettingsRow
      icon={<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--eb-fg-muted)" }} />}
      label={label}
      hideChevron
      asStatic
      right={<Switch checked={value} onCheckedChange={onChange} disabled={disabled} />}
    />
  );
}

/* ------------------------------------------------------------------ */
/* PrivacyPage                                                        */
/* ------------------------------------------------------------------ */
const PRIVACY_KEY = "ewa.privacyPrefs";
const DEFAULT_PRIVACY = { showLocation: true, showContact: false };
type PrivacyPrefs = typeof DEFAULT_PRIVACY;

function loadPrivacy(): PrivacyPrefs {
  if (typeof window === "undefined") return DEFAULT_PRIVACY;
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (!raw) return DEFAULT_PRIVACY;
    return { ...DEFAULT_PRIVACY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVACY;
  }
}

export function PrivacyPage() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT_PRIVACY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadPrivacy());
    setHydrated(true);
  }, []);

  const update = (k: keyof PrivacyPrefs, label: string) => (v: boolean) => {
    setPrefs((p) => {
      const next = { ...p, [k]: v };
      try {
        window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
    toast.success(`${label} ${v ? "on" : "off"}`);
  };

  return (
    <SubpageShell title="Privacy">
      <SectionLabel>Profile visibility</SectionLabel>
      <SectionCard>
        <ToggleRow
          label="Show neighborhood publicly"
          value={prefs.showLocation}
          onChange={update("showLocation", "Show neighborhood publicly")}
          disabled={!hydrated}
        />
        <ToggleRow
          label="Show direct contact"
          value={prefs.showContact}
          onChange={update("showContact", "Show direct contact")}
          disabled={!hydrated}
        />
      </SectionCard>

      <SectionLabel>People</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<span className="text-[14px]">⛔</span>}
          label="Block list"
          sublabel="Manage blocked clients"
          onClick={() => {
            if (typeof window !== "undefined") window.location.assign("/profile/settings/privacy");
          }}
        />
      </SectionCard>

      <SectionLabel>Data</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<span className="text-[14px]">📥</span>}
          label="Download my data"
        />
        <SettingsRow
          icon={<span className="text-[14px]">🗑️</span>}
          label="Delete account"
          destructive
        />
      </SectionCard>
    </SubpageShell>
  );
}
