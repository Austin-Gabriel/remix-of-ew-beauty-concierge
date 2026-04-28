import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { ReviewsPage } from "@/profile/reviews-page";

export const Route = createFileRoute("/profile/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <ReviewsPage />
    </RequireAuth>
  ),
});
