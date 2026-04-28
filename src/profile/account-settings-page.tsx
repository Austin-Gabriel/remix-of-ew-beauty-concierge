import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { HomeShell, useHomeTheme, HOME_SANS } from "@/home/home-shell";
import { useProfile } from "./profile-context";
import { PageHeader, RowGroup, SectionLabel, Row, SettingsPage } from "./profile-ui";
import { useAuth } from "@/auth/auth-context";
import { useState } from "react";
import { toast } from "sonner";
import { LANGUAGES } from "./profile-context";

/**
 * /profile/account-settings — app-level preferences and account management.
 * Apple Settings vibe. Sign-out and delete-account at the bottom.
 */
export function AccountSettingsPage() {
  const { data } = useProfile();
  const { reset } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mutedCount = Object.values(data.notifications).filter((v) => v === false).length;
  const themeLabel = data.theme === "system" ? "System" : data.theme === "light" ? "Light" : "Dark";
  const langLabel = LANGUAGES.find((l) => l.code === data.language)?.native ?? "English";

  const signOut = async () => {
    await reset();
    navigate({ to: "/login", replace: true });
  };

  return (
    <HomeShell>
      <PageHeader title="Settings" back={{ to: "/profile" }} />

      <SectionLabel>Account</SectionLabel>
      <RowGroup>
        <Row label="Edit profile" to="/profile/settings/edit-profile" />
        <Row label="Edit portfolio" sub={`${data.portfolio.length} photos`} to="/profile/settings/edit-portfolio" />
        <Row label="Change password" to="/profile/settings/change-password" />
        <Row
          label="Two-factor authentication"
          right={<SoonChip />}
          disabled
          noChevron
        />
      </RowGroup>

      <SectionLabel>Preferences</SectionLabel>
      <RowGroup>
        <Row
          label="Notifications"
          sub={mutedCount === 0 ? "All on" : `${mutedCount} muted`}
          to="/profile/settings/notifications"
        />
        <Row label="Language" sub={langLabel} to="/profile/settings/language" />
        <Row label="Appearance" sub={themeLabel} to="/profile/settings/appearance" />
        <Row label="Privacy" to="/profile/settings/privacy" />
      </RowGroup>

      <SectionLabel>About</SectionLabel>
      <RowGroup>
        <Row label="How Ewà Biz works" to="/profile/settings/how-it-works" />
        <Row label="Terms of service" to="/profile/settings/terms-of-service" />
        <Row label="App version" sub="Ewà Biz 1.0" noChevron />
      </RowGroup>

      <div className="mx-4 mt-8 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={signOut}
          className="h-12 w-full rounded-2xl text-[15px] font-semibold transition-colors active:opacity-80"
          style={{ backgroundColor: "#FFFFFF", color: "#061C27", border: "1px solid rgba(6,28,39,0.12)", fontFamily: HOME_SANS }}
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="h-12 w-full rounded-2xl text-[15px] font-semibold transition-colors active:opacity-80"
          style={{ backgroundColor: "transparent", color: "#DC2626", fontFamily: HOME_SANS }}
        >
          Delete Ewà Biz account
        </button>
      </div>

      <div style={{ height: 32 }} />

      {confirmDelete ? (
        <ConfirmDelete
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            toast("Account deletion requested. We'll email you to confirm.");
          }}
        />
      ) : null}
    </HomeShell>
  );
}

function SoonChip() {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        backgroundColor: "rgba(6,28,39,0.08)",
        color: "#061C27",
        padding: "3px 7px",
        borderRadius: 999,
      }}
    >
      SOON
    </span>
  );
}

function ConfirmDelete({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onCancel} />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl p-5"
        style={{ backgroundColor: "#FFFFFF", color: "#061C27", fontFamily: HOME_SANS, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
        <div style={{ fontSize: 18, fontWeight: 600 }}>Delete your Ewà Biz account?</div>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
          This will permanently remove your profile, services, portfolio, and history. Bookings already in
          progress will be honored. This cannot be undone.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 w-full rounded-2xl font-semibold"
            style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
          >
            Yes, delete my account
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-12 w-full rounded-2xl font-semibold"
            style={{ backgroundColor: "transparent", color: "#061C27", border: "1px solid rgba(6,28,39,0.15)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- Generic stub used for sub-pages we'll detail later -------- */

export function StubPage({
  title,
  back,
  description,
  children,
}: {
  title: string;
  back: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  const { text } = useHomeTheme();
  return (
    <HomeShell>
      <PageHeader title={title} back={{ to: back }} />
      <div className="px-5 pt-6">
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", color: "#061C27" }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55 }}>
            Coming soon
          </div>
          <div className="mt-2" style={{ fontSize: 17, fontWeight: 600 }}>
            {title}
          </div>
          {description ? (
            <p className="mt-2" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
              {description}
            </p>
          ) : null}
          {children}
        </div>
        <p className="mt-4 px-1 text-center" style={{ color: text, opacity: 0.5, fontSize: 12.5, fontFamily: HOME_SANS }}>
          We're building this surface next.
        </p>
      </div>
    </HomeShell>
  );
}
