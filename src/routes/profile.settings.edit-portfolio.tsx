import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { EditPortfolioPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/settings/edit-portfolio")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <EditPortfolioPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
