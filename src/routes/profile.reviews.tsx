import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { ReviewsStubPage } from "@/profile/StubPages";

export const Route = createFileRoute("/profile/reviews")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <ReviewsStubPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
