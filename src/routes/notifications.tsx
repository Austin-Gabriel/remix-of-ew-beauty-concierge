import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Notifications"
        back="/profile"
        description="All your booking, message, and account alerts in one feed."
      />
    </RequireAuth>
  ),
});
