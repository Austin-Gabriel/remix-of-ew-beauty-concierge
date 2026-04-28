import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { SocialsStubPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/socials")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <SocialsStubPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
