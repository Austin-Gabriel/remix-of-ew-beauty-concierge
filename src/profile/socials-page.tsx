import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel } from "./profile-ui";
import { useProfile } from "./profile-context";

export function SocialsPage() {
  const { data, patch } = useProfile();
  const navigate = useNavigate();
  const [ig, setIg] = useState(data.instagram ?? "");
  const [tt, setTt] = useState(data.tiktok ?? "");

  const sanitize = (s: string) => s.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\//i, "").replace(/\/$/, "");

  const save = () => {
    patch({ instagram: sanitize(ig) || undefined, tiktok: sanitize(tt) || undefined });
    toast("Socials updated.");
    navigate({ to: "/profile" });
  };

  return (
    <HomeShell>
      <PageHeader
        title="Connect socials"
        back={{ to: "/profile" }}
        right={
          <button type="button" onClick={save} style={{ color: "#FF823F", fontSize: 15, fontWeight: 600 }}>
            Save
          </button>
        }
      />
      <p className="px-5 pt-3 pb-1" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.5, fontFamily: HOME_SANS }}>
        Link your handles so Clients can see your latest work. We never post on your behalf.
      </p>

      <SectionLabel>Instagram</SectionLabel>
      <RowGroup>
        <SocialField placeholder="yourhandle" value={ig} onChange={setIg} prefix="@" />
      </RowGroup>

      <SectionLabel>TikTok</SectionLabel>
      <RowGroup>
        <SocialField placeholder="yourhandle" value={tt} onChange={setTt} prefix="@" />
      </RowGroup>

      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function SocialField({ value, onChange, placeholder, prefix }: { value: string; onChange: (v: string) => void; placeholder: string; prefix: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3" style={{ fontFamily: HOME_SANS }}>
      <span style={{ fontSize: 15, color: "#061C27", opacity: 0.5 }}>{prefix}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none"
        style={{ fontSize: 15, color: "#061C27" }}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  );
}
