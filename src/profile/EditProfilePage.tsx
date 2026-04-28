import { useState } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { useProfile } from "@/profile/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/auth-context";

export function EditProfilePage() {
  const profile = useProfile();
  const { userId } = useAuth();
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.neighborhood);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    await supabase.from("profiles").update({ full_name: name, city }).eq("id", userId);
    if (bio) await supabase.from("professionals").update({ bio }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <SubpageShell
      title="Edit profile"
      rightSlot={
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-[14px] font-semibold transition-opacity active:opacity-60 disabled:opacity-40"
          style={{ color: "var(--eb-orange)" }}
        >
          {saving ? "…" : saved ? "Saved" : "Save"}
        </button>
      }
    >
      <SectionLabel>Identity</SectionLabel>
      <SectionCard>
        <Field label="Name" value={name} onChange={setName} placeholder="Aaliyah Carter" />
        <Field label="City / Neighborhood" value={city} onChange={setCity} placeholder="Brooklyn" />
      </SectionCard>

      <SectionLabel>About</SectionLabel>
      <SectionCard>
        <div className="px-4 py-3">
          <label className="block text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell clients what makes your work special…"
            className="mt-2 w-full resize-none bg-transparent text-[15px] outline-none"
            style={{ color: "var(--eb-fg)" }}
          />
        </div>
      </SectionCard>
    </SubpageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <label className="w-1/3 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-right text-[15px] outline-none"
        style={{ color: "var(--eb-fg)" }}
      />
    </div>
  );
}
