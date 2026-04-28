import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/availability")({
  head: () => ({ meta: [{ title: "Availability — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Availability"
        back="/profile"
        description="Set your weekly working hours. Clients can only book inside these windows."
      />
    </RequireAuth>
  ),
});
