import { Bell, Settings as Gear } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useT } from "@/profile/i18n/SettingsI18nProvider";

interface Props {
  hasUnread?: boolean;
}

export function ProfileHeader({ hasUnread }: Props) {
  const { t } = useT();
  return (
    <header className="flex items-center justify-between px-5 pt-3 pb-4">
      <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: "var(--eb-fg)" }}>
        {t("profilePage.title", { defaultValue: "Profile" })}
      </h1>
      <div className="flex items-center gap-1">
        <Link
          to="/profile/settings/notifications"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-[var(--eb-surface-2)]"
          style={{ color: "var(--eb-fg)" }}
        >
          <Bell size={20} strokeWidth={1.8} />
          {hasUnread ? (
            <span
              aria-hidden
              className="absolute top-2 right-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--eb-orange)" }}
            />
          ) : null}
        </Link>
        <Link
          to="/profile/account-settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-[var(--eb-surface-2)]"
          style={{ color: "var(--eb-fg)" }}
        >
          <Gear size={20} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
