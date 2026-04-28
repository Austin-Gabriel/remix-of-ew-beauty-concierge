import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { BlockedListPage } from "@/profile/blocked-list-page";

export const Route = createFileRoute("/profile/settings/privacy/blocked")({
  head: () => ({ meta: [{ title: "Block list — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <BlockedListPage />
    </RequireAuth>
  ),
});
