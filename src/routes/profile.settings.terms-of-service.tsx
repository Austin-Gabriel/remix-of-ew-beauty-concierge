import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { TermsPage } from "@/profile/terms-page";

export const Route = createFileRoute("/profile/settings/terms-of-service")({
  head: () => ({ meta: [{ title: "Terms of service" }] }),
  component: () => (
    <RequireAuth>
      <TermsPage />
    </RequireAuth>
  ),
});
