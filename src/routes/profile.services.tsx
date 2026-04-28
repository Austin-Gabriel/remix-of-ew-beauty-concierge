import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { ServicesStubPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/services")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <ServicesStubPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
