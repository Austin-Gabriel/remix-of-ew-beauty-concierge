import { useEffect, useState } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { useProfile } from "@/profile/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/auth-context";
import { toast } from "sonner";

/**
 * EditProfilePage — saves to Lovable Cloud (profiles + professionals.bio).
 * Updates the local form state optimistically and shows a sonner toast.
 * The Profile page re-reads via useProfile() on next mount and reflects
 * the change instantly (the hook's effect re-runs on auth state).
 */
export function EditProfilePage() {
  const profile = useProfile();
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate fields when profile data arrives.
  useEffect(() => {
    if (!profile.loading && !hydrated) {
      setName(profile.name === "Your studio" ? "" : profile.name);
      setCity(profile.neighborhood);
      setHydrated(true);
    }
  }, [profile.loading, profile.name, profile.neighborhood, hydrated]);

  const dirty =
    hydrated &&
    (name !== (profile.name === "Your studio" ? "" : profile.name) ||
      city !== profile.neighborhood ||
      bio.length > 0);

  const save = async () => {
    if (!userId) {
      toast.error("Sign in to save changes");
      return;
    }
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setSaving(true);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ full_name: name.trim(), city: city.trim() })
        .eq("id", userId);
      if (pErr) throw pErr;

      if (bio.trim()) {
        const { error: prErr } = await supabase
          .from("professionals")
          .update({ bio: bio.trim() })
          .eq("id", userId);
        if (prErr) throw prErr;
      }

      toast.success("Profile updated");
    } catch (e) {
      toast.error("Couldn't save profile", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubpageShell
      title="Edit profile"
      rightSlot={
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-md px-3 py-1.5 text-[14px] font-semibold transition-opacity active:opacity-60 disabled:opacity-40"
          style={{ color: "var(--eb-orange)" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      }
    >
      <SectionLabel>Identity</SectionLabel>
      <SectionCard>
        <Field label="Name" value={name} onChange={setName} placeholder="Amara Osei" loading={!hydrated} />
        <Field label="Neighborhood" value={city} onChange={setCity} placeholder="Brooklyn" loading={!hydrated} />
      </SectionCard>

      <SectionLabel>About</SectionLabel>
      <SectionCard>
        <div className="px-4 py-3">
          <label className="block text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
            Bio
          </label>
          {!hydrated ? (
            <div
              className="mt-2 h-20 animate-pulse rounded"
              style={{ backgroundColor: "var(--eb-surface-2)" }}
            />
          ) : (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={400}
              placeholder="Tell clients what makes your work special…"
              className="mt-2 w-full resize-none bg-transparent text-[15px] outline-none"
              style={{ color: "var(--eb-fg)" }}
            />
          )}
        </div>
      </SectionCard>

      {!userId ? (
        <p
          className="mx-4 mt-3 rounded-xl px-4 py-3 text-[13px]"
          style={{
            color: "var(--eb-fg-muted)",
            backgroundColor: "var(--eb-surface)",
            border: "1px solid var(--eb-hairline)",
          }}
        >
          You're viewing demo data. Sign in to save changes to your profile.
        </p>
      ) : null}
    </SubpageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <label className="w-1/3 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
        {label}
      </label>
      {loading ? (
        <div
          className="ml-auto h-4 w-32 animate-pulse rounded"
          style={{ backgroundColor: "var(--eb-surface-2)" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-right text-[15px] outline-none placeholder:opacity-50"
          style={{ color: "var(--eb-fg)" }}
        />
      )}
    </div>
  );
}
