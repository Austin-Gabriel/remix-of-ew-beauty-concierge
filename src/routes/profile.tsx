import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { SettingsI18nProvider } from "@/profile/i18n/SettingsI18nProvider";

/**
 * /profile layout route — wraps EVERY child route (the index ProfilePage at
 * `/profile` and every nested settings sub-page like `/profile/account-settings`,
 * `/profile/settings/notifications`, etc.) in shared providers and renders the
 * matched child via <Outlet />.
 *
 * GUARD: This file MUST NOT render <ProfilePage /> directly. ProfilePage is the
 * index leaf at `src/routes/profile.index.tsx` and is mounted via the Outlet
 * only when the URL is exactly `/profile`. Rendering it here would cause every
 * nested route to also display the Profile hub above its content — the bug we
 * already fixed once. Keep this layout limited to providers + Outlet.
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
