import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { ServicesMenuPage } from "@/profile/services-menu-page";

export const Route = createFileRoute("/profile/services")({
  head: () => ({ meta: [{ title: "Services & pricing — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <ServicesMenuPage />
    </RequireAuth>
  ),
});
