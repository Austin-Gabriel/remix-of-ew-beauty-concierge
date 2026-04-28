import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { EditPortfolioPage } from "@/profile/edit-portfolio-page";

export const Route = createFileRoute("/profile/settings/edit-portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <EditPortfolioPage />
    </RequireAuth>
  ),
});
