import { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { useDevState } from "@/dev-state/dev-state-context";
import { useProfile } from "@/profile/hooks/useProfile";
import { useT } from "@/profile/i18n/SettingsI18nProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export function SettingsPage() {
  const { reset, email } = useAuth();
  const profile = useProfile();
  const { state: devState } = useDevState();
  const { locale } = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [prefSummary, setPrefSummary] = useState({
    notifications: "All on",
    privacy: "Visibility, communication, data",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readPreferences = () => {
      let notifications = "All on";
      let privacy = "Visibility, communication, data";

      try {
        const rawNotif = window.localStorage.getItem("ewa.notifPrefs");
        if (rawNotif) {
          const parsed = JSON.parse(rawNotif) as Record<string, boolean>;
          const values = Object.values(parsed);
          const enabled = values.filter(Boolean).length;
          notifications = enabled >= Math.max(values.length - 1, 1) ? "All on" : `${enabled} on`;
        }
      } catch {
        notifications = "All on";
      }

      try {
        const rawPrivacy = window.localStorage.getItem("ewa.privacyPrefs");
        if (rawPrivacy) {
          const parsed = JSON.parse(rawPrivacy) as {
            showLocation?: boolean;
            showContact?: boolean;
          };
          if (parsed.showLocation && parsed.showContact) privacy = "Location + contact visible";
          else if (parsed.showLocation) privacy = "Location visible";
          else if (parsed.showContact) privacy = "Contact visible";
          else privacy = "More private";
        }
      } catch {
        privacy = "Visibility, communication, data";
      }

      setPrefSummary({ notifications, privacy });
    };

    readPreferences();
    window.addEventListener("storage", readPreferences);
    return () => window.removeEventListener("storage", readPreferences);
  }, []);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/profile" });
    }
  };

  const displayName = profile.name || "Amara Osei";
  const handle =
    displayName.trim().length > 0
      ? `@${displayName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "")}`
      : "@amara.osei";
  const appearanceLabel =
    devState.theme === "system"
      ? "System"
      : devState.theme === "light"
        ? "Light"
        : "Dark";
  const languageLabel =
    locale === "yo"
      ? "Yorùbá"
      : locale === "fr"
        ? "Français"
        : locale === "es"
          ? "Español"
          : "English";
  const payoutsLabel = profile.payout.method ? "Manage" : "Setup";
  const portfolioCount = profile.portfolio.length;

  const signOut = async () => {
    setSigningOut(true);
    try {
      await reset();
      toast.success("Signed out");
      navigate({ to: "/login", replace: true });
    } catch (e) {
      setSigningOut(false);
      toast.error("Couldn't sign out", {
        description: e instanceof Error ? e.message : "Try again in a moment.",
      });
    }
  };

  const requestDelete = () => {
    setDeleteOpen(false);
    toast.success("Deletion request started", {
      description: "We’ll email the next steps to finish closing the account.",
    });
  };

  return (
    <>
      <div
        data-theme="dark"
        className="min-h-screen w-full"
        style={{
          backgroundColor: "var(--eb-bg)",
          color: "var(--eb-fg)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        }}
      >
        <div className="px-5 pt-3 pb-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to Profile"
            className="mb-3 flex items-center gap-2 rounded-md py-1 transition-opacity active:opacity-60"
            style={{ color: "var(--eb-fg)" }}
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
            <span className="text-[21px] font-semibold">Settings</span>
          </button>
          <p className="max-w-[18rem] text-[15px] leading-8" style={{ color: "var(--eb-fg-muted)" }}>
            Manage your account, preferences, and how Ewà Biz works for you.
          </p>
        </div>

        {profile.loading ? (
          <div className="px-5 pb-8">
            <SettingsLoadingBlock />
          </div>
        ) : (
          <>
            <SettingsSection letter="A" title="Account" trailing={handle}>
              <SettingsListRow
                index="01"
                label="Edit profile"
                sublabel="Bio, services, photos"
                actionLabel="Open"
                onClick={() => navigate({ to: "/profile/settings/edit-profile" })}
              />
              <SettingsListRow
                index="02"
                label="Edit portfolio"
                sublabel={`${portfolioCount} of 24 photos`}
                onClick={() => navigate({ to: "/profile/settings/edit-portfolio" })}
              />
              <SettingsListRow
                index="03"
                label="Change password"
                sublabel="Last changed 4 months ago"
                onClick={() => navigate({ to: "/profile/settings/change-password" })}
              />
              <SettingsListRow
                index="04"
                label="Two-factor authentication"
                sublabel="Add an extra layer to your sign-in"
                badge="Soon"
                onClick={() =>
                  toast("Two-factor authentication", {
                    description: "This flow is next up and not live yet.",
                  })
                }
              />
            </SettingsSection>

            <SettingsSection letter="B" title="Preferences">
              <SettingsListRow
                index="05"
                label="Notifications"
                sublabel="Bookings, messages, payments"
                actionLabel={prefSummary.notifications}
                onClick={() => navigate({ to: "/profile/settings/notifications" })}
              />
              <SettingsListRow
                index="06"
                label="Language"
                sublabel="Choose your preferred language"
                actionLabel={languageLabel}
                onClick={() => navigate({ to: "/profile/settings/language" })}
              />
              <SettingsListRow
                index="07"
                label="Appearance"
                sublabel="Theme and text size"
                actionLabel={appearanceLabel}
                onClick={() => navigate({ to: "/profile/settings/appearance" })}
              />
              <SettingsListRow
                index="08"
                label="Privacy"
                sublabel={prefSummary.privacy}
                onClick={() => navigate({ to: "/profile/settings/privacy" })}
              />
            </SettingsSection>

            <SettingsSection letter="C" title="Money">
              <SettingsListRow
                index="09"
                label="Payouts & banking"
                sublabel={profile.payout.method ?? "Connect your account"}
                actionLabel={payoutsLabel}
                actionTone={profile.payout.method ? "default" : "accent"}
                onClick={() => navigate({ to: "/profile/payouts-and-banking" })}
              />
            </SettingsSection>

            <SettingsSection letter="D" title="About">
              <SettingsListRow
                index="10"
                label="How Ewà Biz works"
                sublabel="The Pro's guide to the platform"
                onClick={() => navigate({ to: "/profile/settings/how-it-works" })}
              />
              <SettingsListRow
                index="11"
                label="Terms of service"
                sublabel="Updated 12 March 2026"
                onClick={() => navigate({ to: "/profile/settings/terms-of-service" })}
              />
              <SettingsListRow
                index="12"
                label="Help & support"
                sublabel="FAQs, contact, safety"
                onClick={() => navigate({ to: "/profile/help-and-support" })}
              />
              <div className="flex items-center justify-between px-5 py-8 text-[15px]">
                <span style={{ color: "var(--eb-fg)" }}>App version</span>
                <span style={{ color: "var(--eb-fg-muted)" }}>1.0 · 2026.04</span>
              </div>
            </SettingsSection>

            <div className="px-5 pt-6">
              <button
                type="button"
                onClick={() => setSignOutOpen(true)}
                disabled={signingOut}
                className="w-full rounded-[22px] py-4 text-[16px] font-medium transition-opacity active:opacity-70 disabled:opacity-50"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--eb-hairline)",
                  color: "var(--eb-fg)",
                }}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 w-full rounded-[22px] py-4 text-[16px] font-medium transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid color-mix(in oklab, var(--eb-danger) 55%, var(--eb-hairline))",
                  color: "var(--eb-danger)",
                }}
              >
                Delete Ewà Biz account
              </button>
              <div className="pt-4 text-center text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
                {email ?? "Signed in"}
              </div>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of Ewà Biz?</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll need to sign in again to manage bookings, payouts, and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setSignOutOpen(false);
                void signOut();
              }}
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your Ewà Biz account?</AlertDialogTitle>
            <AlertDialogDescription>
              This starts the account closure flow and removes your access after confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep account</AlertDialogCancel>
            <AlertDialogAction onClick={requestDelete}>Start deletion</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SettingsSection({
  letter,
  title,
  trailing,
  children,
}: {
  letter: string;
  title: string;
  trailing?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ borderTop: "1px solid var(--eb-hairline)" }}>
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-6">
          <span className="text-[18px] font-semibold" style={{ color: "var(--eb-orange)" }}>
            {letter}
          </span>
          <h2 className="text-[18px] font-semibold uppercase tracking-[0.22em]">{title}</h2>
        </div>
        {trailing ? (
          <span className="text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
            {trailing}
          </span>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

function SettingsListRow({
  index,
  label,
  sublabel,
  actionLabel,
  actionTone = "default",
  badge,
  onClick,
}: {
  index: string;
  label: string;
  sublabel: string;
  actionLabel?: string;
  actionTone?: "default" | "accent";
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left transition-colors active:bg-[var(--eb-surface-2)]"
      style={{
        borderBottom: "1px solid var(--eb-hairline)",
      }}
    >
      <span className="pt-1 text-[16px] tabular-nums" style={{ color: "var(--eb-fg-muted)" }}>
        {index}
      </span>
      <span className="min-w-0">
        <span className="block text-[22px] font-medium leading-[1.15]" style={{ color: "var(--eb-fg)" }}>
          {label}
        </span>
        <span className="mt-2 block text-[17px] leading-[1.25]" style={{ color: "var(--eb-fg-muted)" }}>
          {sublabel}
        </span>
      </span>
      <span className="flex items-center gap-3 pl-2">
        {badge ? (
          <span
            className="rounded-[10px] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{
              border: "1px solid var(--eb-hairline)",
              color: "var(--eb-fg-muted)",
            }}
          >
            {badge}
          </span>
        ) : actionLabel ? (
          <span
            className="text-[17px] font-medium"
            style={{
              color: actionTone === "accent" ? "var(--eb-orange)" : "var(--eb-fg-muted)",
            }}
          >
            {actionLabel}
          </span>
        ) : null}
        <ChevronRight size={22} strokeWidth={1.8} style={{ color: "var(--eb-fg-muted)" }} />
      </span>
    </button>
  );
}

function SettingsLoadingBlock() {
  return (
    <div style={{ borderTop: "1px solid var(--eb-hairline)" }}>
      <div className="px-0 pt-10 pb-4">
        <div className="flex items-center gap-6 px-0">
          <SkeletonBar w={14} h={22} />
          <SkeletonBar w={132} h={18} />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 px-0 py-5"
          style={{ borderBottom: "1px solid var(--eb-hairline)" }}
        >
          <SkeletonBar w={24} h={14} />
          <div>
            <SkeletonBar w={160} h={18} />
            <SkeletonBar w={210} h={14} mt={10} />
          </div>
          <SkeletonBar w={54} h={16} />
        </div>
      ))}
    </div>
  );
}

function SkeletonBar({ w, h, mt = 0 }: { w: number; h: number; mt?: number }) {
  return (
    <div
      aria-hidden
      className="animate-pulse rounded"
      style={{
        width: w,
        height: h,
        marginTop: mt,
        backgroundColor: "var(--eb-surface-2)",
      }}
    />
  );
}
