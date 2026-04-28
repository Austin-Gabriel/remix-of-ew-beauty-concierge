import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { NotificationsPage } from "@/profile/AppearancePage";

export const Route = createFileRoute("/profile/settings/notifications")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <NotificationsPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
