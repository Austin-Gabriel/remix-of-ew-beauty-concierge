import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { PrivacyPage } from "@/profile/AppearancePage";

export const Route = createFileRoute("/profile/settings/privacy")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <PrivacyPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
