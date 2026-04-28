import { useState } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { supabase } from "@/integrations/supabase/client";

export function ChangePasswordPage() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async () => {
    setMsg(null);
    if (pw.length < 8) {
      setMsg({ kind: "err", text: "Use at least 8 characters." });
      return;
    }
    if (pw !== confirm) {
      setMsg({ kind: "err", text: "Passwords don’t match." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setMsg({ kind: "err", text: error.message });
    } else {
      setMsg({ kind: "ok", text: "Password updated." });
      setPw("");
      setConfirm("");
    }
  };

  return (
    <SubpageShell title="Change password">
      <SectionLabel>New password</SectionLabel>
      <SectionCard>
        <PwField label="New" value={pw} onChange={setPw} />
        <PwField label="Confirm" value={confirm} onChange={setConfirm} />
      </SectionCard>

      {msg ? (
        <div
          className="mx-4 mt-4 rounded-xl px-4 py-3 text-[13px]"
          style={{
            backgroundColor: msg.kind === "ok" ? "var(--eb-surface)" : "color-mix(in oklab, var(--eb-danger) 12%, transparent)",
            color: msg.kind === "ok" ? "var(--eb-success)" : "var(--eb-danger)",
            border: "1px solid var(--eb-hairline)",
          }}
        >
          {msg.text}
        </div>
      ) : null}

      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </SubpageShell>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <label className="w-1/3 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="flex-1 bg-transparent text-right text-[15px] outline-none"
        style={{ color: "var(--eb-fg)" }}
      />
    </div>
  );
}
