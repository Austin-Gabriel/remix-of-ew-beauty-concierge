import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { HomeShell } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel, Row } from "@/profile/profile-ui";
import { useProfile, type ThemeChoice, type TextSize } from "@/profile/profile-context";

export const Route = createFileRoute("/profile/settings/appearance")({
  head: () => ({ meta: [{ title: "Appearance — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <AppearancePage />
    </RequireAuth>
  ),
});

function AppearancePage() {
  const { data, patch } = useProfile();
  const themes: { key: ThemeChoice; label: string; sub?: string }[] = [
    { key: "system", label: "System default", sub: "Match your device setting" },
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
  ];
  const sizes: { key: TextSize; label: string }[] = [
    { key: "small", label: "Small" },
    { key: "default", label: "Default" },
    { key: "large", label: "Large" },
    { key: "xlarge", label: "Extra large" },
  ];

  return (
    <HomeShell>
      <PageHeader title="Appearance" back={{ to: "/profile/account-settings" }} />

      <SectionLabel>Theme</SectionLabel>
      <RowGroup>
        {themes.map((t) => (
          <Row
            key={t.key}
            label={t.label}
            sub={t.sub}
            onClick={() => patch({ theme: t.key })}
            noChevron
            right={data.theme === t.key ? <Check /> : null}
          />
        ))}
      </RowGroup>

      <SectionLabel>Text size</SectionLabel>
      <div className="mx-4 rounded-2xl p-1.5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
        <div className="grid grid-cols-4 gap-1">
          {sizes.map((s) => {
            const active = data.textSize === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => patch({ textSize: s.key })}
                className="rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
                style={{
                  backgroundColor: active ? "#FF823F" : "transparent",
                  color: active ? "#FFFFFF" : "#061C27",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="px-5 pt-3" style={{ fontSize: 12.5, opacity: 0.6, lineHeight: 1.5 }}>
        Changes apply immediately and persist across sessions.
      </p>
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF823F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
