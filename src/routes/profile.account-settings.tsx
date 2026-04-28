import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { AccountSettingsPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/account-settings")({
  head: () => ({ meta: [{ title: "Settings — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <AccountSettingsPage />
    </RequireAuth>
  ),
});
