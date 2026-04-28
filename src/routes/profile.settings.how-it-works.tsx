import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/how-it-works")({
  head: () => ({ meta: [{ title: "How Ewà Biz works" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="How Ewà Biz works"
        back="/profile/account-settings"
        description="A quick tour of bookings, payouts, ratings, and what to expect as a Pro on Ewà Biz."
      />
    </RequireAuth>
  ),
});
