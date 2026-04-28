import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/services")({
  head: () => ({ meta: [{ title: "Services & pricing — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Services & pricing"
        back="/profile"
        description="Manage your service menu — pick from the 10 valid Services, set duration and price for each."
      />
    </RequireAuth>
  ),
});
