import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { TermsOfServicePage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/settings/terms-of-service")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <TermsOfServicePage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
