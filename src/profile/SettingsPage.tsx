import { useState } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";
import { useAuth } from "@/auth/auth-context";
import { useProfile } from "@/profile/hooks/useProfile";
import { useNavigate } from "@tanstack/react-router";
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
    await reset();
    navigate({ to: "/login", replace: true });
  };

  return (
    <SubpageShell title="Settings">
      <div className="px-5 pt-3 pb-1">
        <div className="text-[15px] font-semibold">{profile.name}</div>
        <div className="text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
          {email ?? "—"}
        </div>
      </div>

      <SectionLabel>Account</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<UserIcon size={14} strokeWidth={1.8} />}
          label="Edit profile"
          onClick={() => navigate({ to: "/profile/settings/edit-profile" })}
        />
        <SettingsRow
          icon={<Lock size={14} strokeWidth={1.8} />}
          label="Change password"
          onClick={() => navigate({ to: "/profile/settings/change-password" })}
        />
        <SettingsRow
          icon={<CreditCard size={14} strokeWidth={1.8} />}
          label="Payouts & banking"
          onClick={() => navigate({ to: "/profile/payouts-and-banking" })}
        />
      </SectionCard>

      <SectionLabel>Preferences</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Sun size={14} strokeWidth={1.8} />}
          label="Appearance"
          onClick={() => navigate({ to: "/profile/settings/appearance" })}
        />
        <SettingsRow
          icon={<Languages size={14} strokeWidth={1.8} />}
          label="Language"
          onClick={() => navigate({ to: "/profile/settings/language" })}
        />
        <SettingsRow
          icon={<Bell size={14} strokeWidth={1.8} />}
          label="Notifications"
          onClick={() => navigate({ to: "/profile/settings/notifications" })}
        />
        <SettingsRow
          icon={<Shield size={14} strokeWidth={1.8} />}
          label="Privacy"
          onClick={() => navigate({ to: "/profile/settings/privacy" })}
        />
      </SectionCard>

      <SectionLabel>Support</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<HelpCircle size={14} strokeWidth={1.8} />}
          label="Help & support"
          onClick={() => navigate({ to: "/profile/help-and-support" })}
        />
        <SettingsRow
          icon={<BookOpen size={14} strokeWidth={1.8} />}
          label="How it works"
          onClick={() => navigate({ to: "/profile/settings/how-it-works" })}
        />
        <SettingsRow
          icon={<FileText size={14} strokeWidth={1.8} />}
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
