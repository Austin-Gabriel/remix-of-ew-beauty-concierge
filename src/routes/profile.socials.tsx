import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SocialsPage } from "@/profile/socials-page";

export const Route = createFileRoute("/profile/socials")({
  head: () => ({ meta: [{ title: "Connect socials — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <SocialsPage />
    </RequireAuth>
  ),
});
