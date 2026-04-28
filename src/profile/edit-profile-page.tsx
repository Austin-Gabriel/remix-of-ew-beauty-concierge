import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell, HOME_SANS, useHomeTheme } from "@/home/home-shell";
import { PageHeader, SectionLabel } from "./profile-ui";
import { monogramOf, useProfile } from "./profile-context";

/**
 * /profile/settings/edit-profile — name, tagline, neighborhood, address,
 * travel radius, years of experience, and avatar upload. Mock-first: writes
 * to local profile context.
 */
export function EditProfilePage() {
  const { data, patch } = useProfile();
  const navigate = useNavigate();
  const { text } = useHomeTheme();

  const [fullName, setFullName] = useState(data.fullName ?? "");
  const [tagline, setTagline] = useState(data.tagline ?? "");
  const [handle, setHandle] = useState(data.handle ?? "");
  const [neighborhood, setNeighborhood] = useState(data.neighborhood ?? "");
  const [baseAddress, setBaseAddress] = useState(data.baseAddress ?? "");
  const [travelRadiusMi, setTravelRadiusMi] = useState(String(data.travelRadiusMi ?? 10));
  const [yearsExperience, setYearsExperience] = useState(String(data.yearsExperience ?? 0));
  const [avatarDataUrl, setAvatarDataUrl] = useState(data.avatarDataUrl);

  // Keep local form in sync if context loads after mount (localStorage hydration).
  useEffect(() => {
    setFullName(data.fullName ?? "");
    setTagline(data.tagline ?? "");
    setHandle(data.handle ?? "");
    setNeighborhood(data.neighborhood ?? "");
    setBaseAddress(data.baseAddress ?? "");
    setTravelRadiusMi(String(data.travelRadiusMi ?? 10));
    setYearsExperience(String(data.yearsExperience ?? 0));
    setAvatarDataUrl(data.avatarDataUrl);
  }, [data.fullName, data.tagline, data.handle, data.neighborhood, data.baseAddress, data.travelRadiusMi, data.yearsExperience, data.avatarDataUrl]);

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const dirty =
    fullName !== (data.fullName ?? "") ||
    tagline !== (data.tagline ?? "") ||
    handle !== (data.handle ?? "") ||
    neighborhood !== (data.neighborhood ?? "") ||
    baseAddress !== (data.baseAddress ?? "") ||
    Number(travelRadiusMi) !== data.travelRadiusMi ||
    Number(yearsExperience) !== data.yearsExperience ||
    avatarDataUrl !== data.avatarDataUrl;

  const onSave = () => {
    if (!fullName.trim()) {
      toast("Name is required");
      return;
    }
    patch({
      fullName: fullName.trim(),
      tagline: tagline.trim() || undefined,
      handle: handle.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      baseAddress: baseAddress.trim() || undefined,
      travelRadiusMi: Math.max(0, Math.min(100, Number(travelRadiusMi) || 0)),
      yearsExperience: Math.max(0, Math.min(60, Number(yearsExperience) || 0)),
      avatarDataUrl,
    });
    toast("Profile updated");
    navigate({ to: "/profile/account-settings" });
  };

  const initials = monogramOf(fullName || data.fullName);

  return (
    <HomeShell>
      <PageHeader
        title="Edit profile"
        back={{ to: "/profile/account-settings" }}
        right={
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            style={{
              fontFamily: HOME_SANS,
              color: dirty ? "#FF823F" : text,
              opacity: dirty ? 1 : 0.4,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        }
      />

      {/* Avatar */}
      <div className="mt-2 flex flex-col items-center px-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-24 w-24 overflow-hidden rounded-full transition-opacity active:opacity-70"
          style={{ backgroundColor: "#F0EBD8" }}
          aria-label="Change profile photo"
        >
          {avatarDataUrl ? (
            <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center"
              style={{ color: "#FF823F", fontSize: 32, fontWeight: 600 }}
            >
              {initials}
            </span>
          )}
          <span
            className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: "#FF823F", color: "#FFFFFF", boxShadow: "0 0 0 3px var(--background, #061C27)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickAvatar(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-2 text-sm font-semibold transition-opacity active:opacity-60"
          style={{ color: "#FF823F", fontFamily: HOME_SANS }}
        >
          {avatarDataUrl ? "Change photo" : "Add photo"}
        </button>
      </div>

      <SectionLabel>Identity</SectionLabel>
      <Card>
        <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Your name" />
        <Field label="Handle" value={handle} onChange={setHandle} placeholder="amara.studio" prefix="@" />
        <Field
          label="Tagline"
          value={tagline}
          onChange={setTagline}
          placeholder="One line about your craft"
          textarea
          maxLength={140}
        />
      </Card>

      <SectionLabel>Where you work</SectionLabel>
      <Card>
        <Field label="Neighborhood" value={neighborhood} onChange={setNeighborhood} placeholder="e.g. Bed-Stuy, Brooklyn" />
        <Field label="Base address" value={baseAddress} onChange={setBaseAddress} placeholder="Street, city, state" />
        <Field
          label="Travel radius (mi)"
          value={travelRadiusMi}
          onChange={setTravelRadiusMi}
          placeholder="10"
          inputMode="numeric"
        />
      </Card>

      <SectionLabel>Experience</SectionLabel>
      <Card>
        <Field
          label="Years styling"
          value={yearsExperience}
          onChange={setYearsExperience}
          placeholder="0"
          inputMode="numeric"
        />
      </Card>

      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-4 overflow-hidden rounded-2xl"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  maxLength,
  inputMode,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
  prefix?: string;
}) {
  return (
    <label
      className="flex flex-col gap-1 px-4 py-3 [&:not(:last-child)]:border-b"
      style={{ borderColor: "rgba(6,28,39,0.06)", fontFamily: HOME_SANS }}
    >
      <span style={{ color: "#061C27", opacity: 0.55, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        {prefix ? <span style={{ color: "#061C27", opacity: 0.4, fontSize: 15 }}>{prefix}</span> : null}
        {textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={2}
            className="w-full resize-none bg-transparent outline-none placeholder:text-black/30"
            style={{ color: "#061C27", fontSize: 15, lineHeight: 1.4 }}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            className="w-full bg-transparent outline-none placeholder:text-black/30"
            style={{ color: "#061C27", fontSize: 15 }}
          />
        )}
      </div>
      {maxLength ? (
        <span style={{ color: "#061C27", opacity: 0.35, fontSize: 11, alignSelf: "flex-end" }}>
          {value.length}/{maxLength}
        </span>
      ) : null}
    </label>
  );
}
