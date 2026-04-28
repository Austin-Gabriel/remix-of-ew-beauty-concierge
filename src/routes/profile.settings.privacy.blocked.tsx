import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/privacy/blocked")({
  head: () => ({ meta: [{ title: "Block list — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Block list"
        back="/profile/settings/privacy"
        description="Clients you've blocked can't message or book you. We'll list them here once you block someone."
      />
    </RequireAuth>
  ),
});
