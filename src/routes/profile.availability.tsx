import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { AvailabilityPage } from "@/profile/availability-page";

export const Route = createFileRoute("/profile/availability")({
  head: () => ({ meta: [{ title: "Availability — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <AvailabilityPage />
    </RequireAuth>
  ),
});
