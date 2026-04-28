import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/payouts-and-banking")({
  head: () => ({ meta: [{ title: "Payouts — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Payouts & banking"
        back="/profile"
        description="Connect a bank account and choose how often you get paid."
      />
    </RequireAuth>
  ),
});
