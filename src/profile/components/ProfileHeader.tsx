import { Bell, Settings as Gear } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useT } from "@/profile/i18n/SettingsI18nProvider";

interface Props {
  hasUnread?: boolean;
}

const NAVY = "#061C27";
const ORANGE = "#FF823F";

/**
 * Page header — matches the Bookings / Earnings header style.
 * 22px page title left, two icon buttons right.
 */
export function ProfileHeader({ hasUnread }: Props) {
  const { t } = useT();
  return (
    <header
      className="flex items-center justify-between px-4 pt-2"
      style={{ height: 48 }}
    >
      <h1
        className="font-semibold tracking-tight"
        style={{
          color: "var(--eb-fg)",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {t("profilePage.title", { defaultValue: "Profile" })}
      </h1>
      <div className="flex items-center gap-1.5">
        <Link
          to="/profile/settings/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{
            color: "var(--eb-fg)",
            border: "1px solid var(--eb-hairline)",
          }}
        >
          <Bell size={18} strokeWidth={1.8} />
          {hasUnread ? (
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: ORANGE, boxShadow: `0 0 0 2px var(--eb-bg)` }}
            />
          ) : null}
        </Link>
        <Link
          to="/profile/account-settings"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{
            color: "var(--eb-fg)",
            border: "1px solid var(--eb-hairline)",
          }}
        >
          <Gear size={18} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}

// Suppress unused-var lint warnings for theme constants kept for future tweaks.
void NAVY;
