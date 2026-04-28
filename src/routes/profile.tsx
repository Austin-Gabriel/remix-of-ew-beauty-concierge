import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";

/**
 * /profile layout route. Wraps every child route (index + sub-pages like
 * /profile/account-settings) in auth + i18n providers and renders the
 * matched child via <Outlet />. Without this the dot-separated child
 * routes (e.g. profile.account-settings.tsx) would have no parent and
 * fall through to the 404 boundary.
 */
export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <SettingsI18nProvider>
        <Outlet />
      </SettingsI18nProvider>
    </RequireAuth>
  ),
});
