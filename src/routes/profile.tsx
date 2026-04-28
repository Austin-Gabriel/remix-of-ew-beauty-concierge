import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { ProfilePage } from "@/profile/ProfilePage";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <ProfilePage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
