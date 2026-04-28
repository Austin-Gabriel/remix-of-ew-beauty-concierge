import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/change-password")({
  head: () => ({ meta: [{ title: "Change password — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Change password"
        back="/profile/account-settings"
        description="Current, new, and confirm fields with strength meter and requirements checklist."
      />
    </RequireAuth>
  ),
});
