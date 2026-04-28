import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { SettingsPage } from "@/profile/SettingsPage";

export const Route = createFileRoute("/profile/account-settings")({
  head: () => ({ meta: [{ title: "Settings — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <SettingsPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
