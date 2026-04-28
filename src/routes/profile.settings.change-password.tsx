import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { ChangePasswordPage } from "@/profile/change-password-page";

export const Route = createFileRoute("/profile/settings/change-password")({
  head: () => ({ meta: [{ title: "Change password — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <ChangePasswordPage />
    </RequireAuth>
  ),
});
