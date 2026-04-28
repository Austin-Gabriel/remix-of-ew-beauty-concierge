import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { HelpAndSupportPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/help-and-support")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <HelpAndSupportPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
