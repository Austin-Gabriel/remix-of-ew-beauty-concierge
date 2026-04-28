import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/terms-of-service")({
  head: () => ({ meta: [{ title: "Terms of service" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Terms of service"
        back="/profile/account-settings"
        description="The agreement between you and Ewà Biz. Full text rendered here."
      />
    </RequireAuth>
  ),
});
