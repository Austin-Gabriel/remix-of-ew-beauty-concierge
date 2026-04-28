import { useState, type ReactNode } from "react";
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
export function NotificationsPage() {
  const [prefs, setPrefs] = useState({
    pushNewBooking: true,
    pushReminders: true,
    pushMessages: true,
    pushReviews: false,
    emailWeekly: true,
    emailPromotions: false,
    smsUrgent: true,
  });
  const set = (k: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <SubpageShell title="Notifications">
      <SectionLabel>Push</SectionLabel>
      <SectionCard>
        <ToggleRow label="New booking requests" value={prefs.pushNewBooking} onChange={set("pushNewBooking")} />
        <ToggleRow label="Appointment reminders" value={prefs.pushReminders} onChange={set("pushReminders")} />
        <ToggleRow label="Messages" value={prefs.pushMessages} onChange={set("pushMessages")} />
        <ToggleRow label="New reviews" value={prefs.pushReviews} onChange={set("pushReviews")} />
      </SectionCard>

      <SectionLabel>Email</SectionLabel>
      <SectionCard>
        <ToggleRow label="Weekly summary" value={prefs.emailWeekly} onChange={set("emailWeekly")} />
        <ToggleRow label="Promotions & tips" value={prefs.emailPromotions} onChange={set("emailPromotions")} />
      </SectionCard>

      <SectionLabel>SMS</SectionLabel>
      <SectionCard>
        <ToggleRow label="Urgent alerts only" value={prefs.smsUrgent} onChange={set("smsUrgent")} />
      </SectionCard>
    </SubpageShell>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <SettingsRow
      icon={<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--eb-fg-muted)" }} />}
      label={label}
      hideChevron
      asStatic
      right={<Switch checked={value} onCheckedChange={onChange} />}
    />
  );
}

/* ------------------------------------------------------------------ */
/* PrivacyPage                                                        */
/* ------------------------------------------------------------------ */
export function PrivacyPage() {
  const [showLocation, setShowLocation] = useState(true);
  const [showContact, setShowContact] = useState(false);

  return (
    <SubpageShell title="Privacy">
      <SectionLabel>Profile visibility</SectionLabel>
      <SectionCard>
        <ToggleRow
          label="Show neighborhood publicly"
          value={showLocation}
          onChange={setShowLocation}
        />
        <ToggleRow
          label="Show direct contact"
          value={showContact}
          onChange={setShowContact}
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
