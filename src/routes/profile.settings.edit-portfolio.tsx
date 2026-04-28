import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/settings/edit-portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Portfolio"
        back="/profile/account-settings"
        description="Upload up to 24 photos, reorder, and tap to preview. Minimum 3 to be bookable."
      />
    </RequireAuth>
  ),
});
