import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { LanguagePage } from "@/profile/AppearancePage";

export const Route = createFileRoute("/profile/settings/language")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <LanguagePage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
