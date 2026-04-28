import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";
import { EditProfilePage } from "@/profile/EditProfilePage";

export const Route = createFileRoute("/profile/settings/edit-profile")({
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <EditProfilePage />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
