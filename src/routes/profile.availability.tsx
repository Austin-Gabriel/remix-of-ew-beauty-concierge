import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { AvailabilityStubPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/availability")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <AvailabilityStubPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
