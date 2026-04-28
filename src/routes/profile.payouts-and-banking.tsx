import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { PayoutsAndBankingPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/payouts-and-banking")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <PayoutsAndBankingPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
