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
import {
  ChevronLeft,
  UserCircle2,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  Bell,
  Languages,
  SunMoon,
  Lock,
  CreditCard,
  BookOpen,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell } from "@/home/home-shell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";

const NAVY_MUTED = "rgba(6,28,39,0.55)";

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

  const appearanceLabel =
    devState.theme === "system" ? "System" : devState.theme === "light" ? "Light" : "Dark";
  const languageLabel =
    locale === "yo"
      ? "Yorùbá"
      : locale === "fr"
        ? "Français"
        : locale === "es"
          ? "Español"
          : "English";
  const payoutsLabel = profile.payout.method ?? "Connect your account";
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

  const Right = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[14px] font-medium" style={{ color: NAVY_MUTED }}>
      {children}
    </span>
  );

  const RightAccent = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[14px] font-semibold" style={{ color: "#FF823F" }}>
      {children}
    </span>
  );

  return (
    <HomeShell noTabBarSpacing>
      <header
        className="sticky top-0 z-10 flex items-center px-2 py-2"
        style={{
          backgroundColor: "var(--eb-bg)",
          borderBottom: "1px solid var(--eb-hairline)",
        }}
      >
        <button
          type="button"
          onClick={goBack}
          aria-label="Back to Profile"
          className="flex items-center gap-1 rounded-md px-2 py-2 transition-opacity active:opacity-60"
          style={{ color: "var(--eb-fg)" }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
          <span className="text-[15px] font-medium">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">Settings</h1>
      </header>

      {profile.loading ? (
        <div className="px-4 pt-4 pb-8">
          <SettingsLoadingBlock />
        </div>
      ) : (
        <>
          <SectionLabel>Account</SectionLabel>
          <SectionCard>
            <SettingsRow
              icon={<UserCircle2 size={18} strokeWidth={1.8} />}
              label="Edit profile"
              sublabel="Bio, services, photos"
              onClick={() => navigate({ to: "/profile/settings/edit-profile" })}
            />
            <SettingsRow
              icon={<ImageIcon size={18} strokeWidth={1.8} />}
              label="Edit portfolio"
              sublabel={`${portfolioCount} of 24 photos`}
              onClick={() => navigate({ to: "/profile/settings/edit-portfolio" })}
            />
            <SettingsRow
              icon={<KeyRound size={18} strokeWidth={1.8} />}
              label="Change password"
              sublabel="Last changed 4 months ago"
              onClick={() => navigate({ to: "/profile/settings/change-password" })}
            />
            <SettingsRow
              icon={<ShieldCheck size={18} strokeWidth={1.8} />}
              label="Two-factor authentication"
              sublabel="Add an extra layer to your sign-in"
              right={<Right>Soon</Right>}
              onClick={() =>
                toast("Two-factor authentication", {
                  description: "This flow is next up and not live yet.",
                })
              }
            />
          </SectionCard>

          <SectionLabel>Preferences</SectionLabel>
          <SectionCard>
            <SettingsRow
              icon={<Bell size={18} strokeWidth={1.8} />}
              label="Notifications"
              sublabel="Bookings, messages, payments"
              right={<Right>{prefSummary.notifications}</Right>}
              onClick={() => navigate({ to: "/profile/settings/notifications" })}
            />
            <SettingsRow
              icon={<Languages size={18} strokeWidth={1.8} />}
              label="Language"
              sublabel="Choose your preferred language"
              right={<Right>{languageLabel}</Right>}
              onClick={() => navigate({ to: "/profile/settings/language" })}
            />
            <SettingsRow
              icon={<SunMoon size={18} strokeWidth={1.8} />}
              label="Appearance"
              sublabel="Theme and text size"
              right={<Right>{appearanceLabel}</Right>}
              onClick={() => navigate({ to: "/profile/settings/appearance" })}
            />
            <SettingsRow
              icon={<Lock size={18} strokeWidth={1.8} />}
              label="Privacy"
              sublabel={prefSummary.privacy}
              onClick={() => navigate({ to: "/profile/settings/privacy" })}
            />
          </SectionCard>

          <SectionLabel>Money</SectionLabel>
          <SectionCard>
            <SettingsRow
              icon={<CreditCard size={18} strokeWidth={1.8} />}
              label="Payouts & banking"
              sublabel={payoutsLabel}
              right={
                profile.payout.method ? (
                  <Right>Manage</Right>
                ) : (
                  <RightAccent>Setup</RightAccent>
                )
              }
              onClick={() => navigate({ to: "/profile/payouts-and-banking" })}
            />
          </SectionCard>

          <SectionLabel>About</SectionLabel>
          <SectionCard>
            <SettingsRow
              icon={<BookOpen size={18} strokeWidth={1.8} />}
              label="How Ewà Biz works"
              sublabel="The Pro's guide to the platform"
              onClick={() => navigate({ to: "/profile/settings/how-it-works" })}
            />
            <SettingsRow
              icon={<FileText size={18} strokeWidth={1.8} />}
              label="Terms of service"
              sublabel="Updated 12 March 2026"
              onClick={() => navigate({ to: "/profile/settings/terms-of-service" })}
            />
            <SettingsRow
              icon={<LifeBuoy size={18} strokeWidth={1.8} />}
              label="Help & support"
              sublabel="FAQs, contact, safety"
              onClick={() => navigate({ to: "/profile/help-and-support" })}
            />
          </SectionCard>

          <div className="mx-4 mt-3 flex items-center justify-between text-[13px]" style={{ color: "var(--eb-fg)", opacity: 0.55 }}>
            <span>App version</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>1.0 · 2026.04</span>
          </div>

          <div className="px-4 pt-6">
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              disabled={signingOut}
              className="w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
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
              className="mt-3 w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(185,28,28,0.55)",
                color: "#B91C1C",
              }}
            >
              Delete Ewà Biz account
            </button>
            <div className="pt-4 text-center text-[13px]" style={{ color: "var(--eb-fg)", opacity: 0.55 }}>
              {email ?? "Signed in"}
            </div>
          </div>
        </>
      )}

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
    </HomeShell>
  );
}

function SettingsLoadingBlock() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mt-4 rounded-2xl px-4 py-4"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(6,28,39,0.10)",
          }}
        >
          <SkeletonBar w={120} h={14} />
          <SkeletonBar w={210} h={12} mt={8} />
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
        backgroundColor: "rgba(6,28,39,0.08)",
      }}
    />
  );
}
