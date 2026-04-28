import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { StubPage } from "@/profile/account-settings-page";

export const Route = createFileRoute("/profile/socials")({
  head: () => ({ meta: [{ title: "Connect socials — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <StubPage
        title="Connect socials"
        back="/profile"
        description="Link Instagram and TikTok so Clients can see your latest work without leaving Ewà Biz."
      />
    </RequireAuth>
  ),
});
