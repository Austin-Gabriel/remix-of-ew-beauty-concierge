import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Reviews"
        back="/profile"
        description="Every Client review with your replies. Filter by rating, search by Service."
      />
    </RequireAuth>
  ),
});
