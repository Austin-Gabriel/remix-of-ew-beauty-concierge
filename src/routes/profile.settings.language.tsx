import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { HomeShell } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel, Row } from "@/profile/profile-ui";
import { LANGUAGES, useProfile } from "@/profile/profile-context";
import { useMemo } from "react";

export const Route = createFileRoute("/profile/settings/language")({
  head: () => ({ meta: [{ title: "Language — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <LanguagePage />
    </RequireAuth>
  ),
});

function LanguagePage() {
  const { data, patch } = useProfile();
  const grouped = useMemo(() => {
    const map = new Map<string, typeof LANGUAGES>();
    for (const l of LANGUAGES) {
      const arr = map.get(l.group) ?? [];
      arr.push(l);
      map.set(l.group, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <HomeShell>
      <PageHeader title="Language" back={{ to: "/profile/account-settings" }} />
      <p className="px-5 pt-3 pb-1" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.5 }}>
        Choose your preferred language. Translations for non-English languages are coming soon.
      </p>

      {grouped.map(([group, langs]) => (
        <div key={group}>
          <SectionLabel>{group}</SectionLabel>
          <RowGroup>
            {langs.map((l) => {
              const selected = data.language === l.code;
              return (
                <Row
                  key={l.code}
                  label={l.native}
                  sub={l.english !== l.native ? l.english : undefined}
                  onClick={() => patch({ language: l.code })}
                  noChevron
                  right={selected ? <Check /> : null}
                />
              );
            })}
          </RowGroup>
        </div>
      ))}
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
