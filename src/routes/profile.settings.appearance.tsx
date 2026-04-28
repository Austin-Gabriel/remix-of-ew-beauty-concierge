import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { AppearancePage } from "@/profile/AppearancePage";

export const Route = createFileRoute("/profile/settings/appearance")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <AppearancePage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
