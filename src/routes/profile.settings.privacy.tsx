import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { HomeShell } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel, Row, Switch } from "@/profile/profile-ui";
import { useProfile, type MessagePolicy, type PrivacyPrefs } from "@/profile/profile-context";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/settings/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <PrivacyPage />
    </RequireAuth>
  ),
});

function PrivacyPage() {
  const { data, patchPrivacy } = useProfile();
  const p = data.privacy;
  const set = (k: keyof PrivacyPrefs, v: boolean | MessagePolicy) =>
    patchPrivacy({ [k]: v } as Partial<PrivacyPrefs>);

  const [policyOpen, setPolicyOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const policyLabel: Record<MessagePolicy, string> = {
    anyone: "Anyone",
    confirmed: "Only Clients with confirmed bookings",
    past: "Only past Clients",
  };

  return (
    <HomeShell>
      <PageHeader title="Privacy" back={{ to: "/profile/account-settings" }} />
      <p className="px-5 pt-3 pb-1" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.5 }}>
        Control who sees you and what data Ewà Biz keeps.
      </p>

      <SectionLabel>Visibility</SectionLabel>
      <RowGroup>
        <Row
          label="Show profile in search"
          sub="When off, Clients can only book you with a direct link"
          right={<Switch checked={p.searchVisible} onChange={(v) => set("searchVisible", v)} />}
          noChevron
        />
        <Row label="Show online status to Clients" right={<Switch checked={p.showOnlineStatus} onChange={(v) => set("showOnlineStatus", v)} />} noChevron />
        <Row label="Show last active time" right={<Switch checked={p.showLastActive} onChange={(v) => set("showLastActive", v)} />} noChevron />
      </RowGroup>

      <SectionLabel>Communication</SectionLabel>
      <RowGroup>
        <Row label="Who can message me first" sub={policyLabel[p.messagePolicy]} onClick={() => setPolicyOpen(true)} />
        <Row label="Block list" sub={`${data.blocked.length} blocked`} to="/profile/settings/privacy/blocked" />
      </RowGroup>

      <SectionLabel>Data & account</SectionLabel>
      <RowGroup>
        <Row label="Download my data" onClick={() => setDownloadOpen(true)} />
        <Row label="Request data deletion" onClick={() => setDeleteOpen(true)} destructive />
      </RowGroup>

      <div style={{ height: 32 }} />

      {policyOpen ? (
        <Sheet onClose={() => setPolicyOpen(false)} title="Who can message me first">
          {(["anyone", "confirmed", "past"] as MessagePolicy[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                set("messagePolicy", opt);
                setPolicyOpen(false);
              }}
              className="flex w-full items-center justify-between border-b py-3.5"
              style={{ borderColor: "rgba(6,28,39,0.06)", color: "#061C27", fontSize: 15 }}
            >
              <span>{policyLabel[opt]}</span>
              {p.messagePolicy === opt ? <span style={{ color: "#FF823F", fontWeight: 700 }}>✓</span> : null}
            </button>
          ))}
        </Sheet>
      ) : null}

      {downloadOpen ? (
        <Sheet
          onClose={() => setDownloadOpen(false)}
          title="Download your data"
          body="We'll prepare a copy of your profile, bookings, reviews, and messages and email it to you within 48 hours."
          confirmLabel="Request export"
          onConfirm={() => {
            setDownloadOpen(false);
            toast("Data export requested. Check your email within 48 hours.");
          }}
        />
      ) : null}

      {deleteOpen ? (
        <Sheet
          onClose={() => setDeleteOpen(false)}
          title="Request data deletion"
          body="This is different from deleting your account. A deletion request removes your historical data but keeps your account active. Bookings already in progress will be honored."
          confirmLabel="Submit request"
          destructive
          onConfirm={() => {
            setDeleteOpen(false);
            toast("Deletion request submitted. We'll email you to confirm.");
          }}
        />
      ) : null}
    </HomeShell>
  );
}

function Sheet({
  onClose,
  title,
  body,
  confirmLabel,
  onConfirm,
  destructive,
  children,
}: {
  onClose: () => void;
  title: string;
  body?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl p-5"
        style={{ backgroundColor: "#FFFFFF", color: "#061C27", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
        <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
        {body ? <p className="mt-2" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>{body}</p> : null}
        {children ? <div className="mt-3">{children}</div> : null}
        {onConfirm ? (
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 w-full rounded-2xl font-semibold"
              style={{ backgroundColor: destructive ? "#DC2626" : "#FF823F", color: "#FFFFFF" }}
            >
              {confirmLabel ?? "Confirm"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 w-full rounded-2xl font-semibold"
              style={{ backgroundColor: "transparent", color: "#061C27", border: "1px solid rgba(6,28,39,0.15)" }}
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
