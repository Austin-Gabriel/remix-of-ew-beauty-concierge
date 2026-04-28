import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/edit-profile")({
  head: () => ({ meta: [{ title: "Edit profile — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Edit profile"
        back="/profile/account-settings"
        description="Photos, identity, location, services, and experience. We'll wire the inputs and Save flow next."
      />
    </RequireAuth>
  ),
});
