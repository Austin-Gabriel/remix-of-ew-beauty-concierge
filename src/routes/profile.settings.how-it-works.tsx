import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { HowItWorksPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/settings/how-it-works")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <HowItWorksPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
