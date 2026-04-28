import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { HowItWorksPage } from "@/profile/how-it-works-page";

export const Route = createFileRoute("/profile/settings/how-it-works")({
  head: () => ({ meta: [{ title: "How Ewà Biz works" }] }),
  component: () => (
    <RequireAuth>
      <HowItWorksPage />
    </RequireAuth>
  ),
});
