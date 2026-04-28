import { useState } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";
import { useAuth } from "@/auth/auth-context";
import { useProfile } from "@/profile/hooks/useProfile";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  User as UserIcon,
  Lock,
  CreditCard,
  Sun,
  Languages,
  Bell,
  Shield,
  HelpCircle,
  BookOpen,
  FileText,
} from "lucide-react";

export function SettingsPage() {
  const { reset, email } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    if (!confirm("Sign out of Ewà Biz?")) return;
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

  return (
    <SubpageShell title="Settings">
      <div className="px-5 pt-3 pb-1">
        {profile.loading ? (
          <>
            <SkeletonBar w={140} h={16} />
            <SkeletonBar w={200} h={12} mt={6} />
          </>
        ) : (
          <>
            <div className="text-[15px] font-semibold">{profile.name || "Your studio"}</div>
            <div className="text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
              {email ?? "Not signed in"}
            </div>
          </>
        )}
      </div>

      <SectionLabel>Account</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<UserIcon size={17} strokeWidth={2} />}
          label="Edit profile"
          sublabel={profile.loading ? "Loading…" : "Name, neighborhood, bio"}
          onClick={() => navigate({ to: "/profile/settings/edit-profile" })}
        />
        <SettingsRow
          icon={<Lock size={17} strokeWidth={2} />}
          label="Change password"
          onClick={() => navigate({ to: "/profile/settings/change-password" })}
        />
        <SettingsRow
          icon={<CreditCard size={17} strokeWidth={2} />}
          label="Payouts & banking"
          sublabel={
            profile.loading
              ? "Loading…"
              : profile.payout.method ?? "No bank account connected"
          }
          onClick={() => navigate({ to: "/profile/payouts-and-banking" })}
        />
      </SectionCard>

      <SectionLabel>Preferences</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Sun size={17} strokeWidth={2} />}
          label="Appearance"
          onClick={() => navigate({ to: "/profile/settings/appearance" })}
        />
        <SettingsRow
          icon={<Languages size={17} strokeWidth={2} />}
          label="Language"
          onClick={() => navigate({ to: "/profile/settings/language" })}
        />
        <SettingsRow
          icon={<Bell size={17} strokeWidth={2} />}
          label="Notifications"
          onClick={() => navigate({ to: "/profile/settings/notifications" })}
        />
        <SettingsRow
          icon={<Shield size={17} strokeWidth={2} />}
          label="Privacy"
          onClick={() => navigate({ to: "/profile/settings/privacy" })}
        />
      </SectionCard>

      <SectionLabel>Support</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<HelpCircle size={17} strokeWidth={2} />}
          label="Help & support"
          onClick={() => navigate({ to: "/profile/help-and-support" })}
        />
        <SettingsRow
          icon={<BookOpen size={17} strokeWidth={2} />}
          label="How it works"
          onClick={() => navigate({ to: "/profile/settings/how-it-works" })}
        />
        <SettingsRow
          icon={<FileText size={17} strokeWidth={2} />}
          label="Terms of service"
          onClick={() => navigate({ to: "/profile/settings/terms-of-service" })}
        />
      </SectionCard>

      <div className="mt-6 px-4">
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{
            backgroundColor: "var(--eb-surface)",
            border: "1px solid var(--eb-hairline)",
            color: "var(--eb-danger)",
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </SubpageShell>
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
