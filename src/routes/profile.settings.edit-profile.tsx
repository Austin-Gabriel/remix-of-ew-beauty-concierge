import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { EditProfilePage } from "@/profile/edit-profile-page";

export const Route = createFileRoute("/profile/settings/edit-profile")({
  head: () => ({ meta: [{ title: "Edit profile — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <EditProfilePage />
    </RequireAuth>
  ),
});
