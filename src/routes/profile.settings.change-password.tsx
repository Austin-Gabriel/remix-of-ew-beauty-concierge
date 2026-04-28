import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { ChangePasswordPage } from "@/profile/ChangePasswordPage";

export const Route = createFileRoute("/profile/settings/change-password")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <ChangePasswordPage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
