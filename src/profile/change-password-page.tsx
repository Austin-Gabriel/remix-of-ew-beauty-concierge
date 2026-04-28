import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const checks = [
    { label: "At least 10 characters", ok: next.length >= 10 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(next) },
    { label: "One number", ok: /\d/.test(next) },
    { label: "One symbol", ok: /[^A-Za-z0-9]/.test(next) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const matches = next.length > 0 && next === confirm;
  const valid = current.length > 0 && score === 4 && matches;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    toast("Password updated.");
    navigate({ to: "/profile/account-settings" });
  };

  return (
    <HomeShell>
      <PageHeader title="Change password" back={{ to: "/profile/account-settings" }} />
      <form onSubmit={onSubmit} className="px-4 pt-2" style={{ fontFamily: HOME_SANS }}>
        <Field label="Current password" value={current} onChange={setCurrent} type="password" />
        <Field label="New password" value={next} onChange={setNext} type="password" />
        <div className="mx-1 mt-2">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i < score ? (score < 3 ? "#DC2626" : score < 4 ? "#F59E0B" : "#16A34A") : "rgba(6,28,39,0.12)" }} />
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2" style={{ fontSize: 12.5, color: "#061C27", opacity: c.ok ? 1 : 0.55 }}>
                <span style={{ color: c.ok ? "#16A34A" : "rgba(6,28,39,0.35)", fontWeight: 700 }}>{c.ok ? "✓" : "○"}</span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} type="password" />
        {confirm.length > 0 && !matches ? (
          <p className="mx-1 mt-1" style={{ fontSize: 12.5, color: "#DC2626" }}>Passwords don't match.</p>
        ) : null}

        <button
          type="submit"
          disabled={!valid}
          className="mt-6 h-12 w-full rounded-2xl font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#FF823F", color: "#FFFFFF" }}
        >
          Update password
        </button>
      </form>
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="mt-3 block">
      <div className="px-1 pb-1.5" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#061C27", opacity: 0.6 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="h-12 w-full rounded-2xl px-4 outline-none focus:ring-2"
        style={{ backgroundColor: "#FFFFFF", color: "#061C27", border: "1px solid rgba(6,28,39,0.10)", fontSize: 15 }}
      />
    </label>
  );
}
