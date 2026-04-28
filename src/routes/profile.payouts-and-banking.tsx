import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { PayoutsPage } from "@/profile/payouts-page";

export const Route = createFileRoute("/profile/payouts-and-banking")({
  head: () => ({ meta: [{ title: "Payouts — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <PayoutsPage />
    </RequireAuth>
  ),
});
