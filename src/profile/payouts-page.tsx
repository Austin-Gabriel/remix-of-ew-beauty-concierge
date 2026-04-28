import { useState } from "react";
import { toast } from "sonner";
import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel, Row } from "./profile-ui";
import { useProfile } from "./profile-context";

type Cadence = "weekly" | "biweekly" | "manual";

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

const HISTORY: Payout[] = [
  { id: "p1", date: "Apr 19", amount: 1240, status: "paid" },
  { id: "p2", date: "Apr 12", amount: 980, status: "paid" },
  { id: "p3", date: "Apr 5", amount: 1530, status: "paid" },
  { id: "p4", date: "Mar 29", amount: 720, status: "paid" },
];

export function PayoutsPage() {
  const { data, patch } = useProfile();
  const [cadence, setCadence] = useState<Cadence>("weekly");
  const [linkOpen, setLinkOpen] = useState(false);
  const linked = Boolean(data.bankName && data.bankLast4);

  const linkBank = () => {
    patch({ bankName: "Chase", bankLast4: "4821" });
    setLinkOpen(false);
    toast("Bank account connected.");
  };

  return (
    <HomeShell>
      <PageHeader title="Payouts & banking" back={{ to: "/profile" }} />

      <div className="mx-4 mt-2 rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", fontFamily: HOME_SANS }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#061C27", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Available balance
        </div>
        <div className="mt-1.5" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#061C27" }}>$842.00</div>
        <div style={{ fontSize: 12.5, color: "#061C27", opacity: 0.55 }}>$320 pending release</div>
        <button
          type="button"
          disabled={!linked}
          onClick={() => toast("Payout requested. Funds arrive in 1–2 business days.")}
          className="mt-4 h-11 w-full rounded-2xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: "#FF823F", color: "#FFFFFF", fontSize: 14.5 }}
        >
          {linked ? "Cash out now" : "Connect a bank to cash out"}
        </button>
      </div>

      <SectionLabel>Bank account</SectionLabel>
      <RowGroup>
        {linked ? (
          <>
            <Row label={data.bankName!} sub={`•••• ${data.bankLast4}`} right={<Verified />} noChevron />
            <Row label="Replace bank" onClick={() => setLinkOpen(true)} />
            <Row label="Disconnect" destructive onClick={() => { patch({ bankName: undefined, bankLast4: undefined }); toast("Bank disconnected."); }} noChevron />
          </>
        ) : (
          <Row label="Connect bank account" sub="Required to receive payouts" onClick={() => setLinkOpen(true)} />
        )}
      </RowGroup>

      <SectionLabel>Schedule</SectionLabel>
      <RowGroup>
        {([
          { k: "weekly" as const, l: "Weekly", s: "Every Friday" },
          { k: "biweekly" as const, l: "Every 2 weeks", s: "Friday, every other week" },
          { k: "manual" as const, l: "Manual", s: "Cash out whenever you want" },
        ]).map((opt) => (
          <Row
            key={opt.k}
            label={opt.l}
            sub={opt.s}
            onClick={() => { setCadence(opt.k); toast(`Payout schedule: ${opt.l}.`); }}
            noChevron
            right={cadence === opt.k ? <Check /> : null}
          />
        ))}
      </RowGroup>

      <SectionLabel>History</SectionLabel>
      <RowGroup>
        {HISTORY.map((p) => (
          <Row
            key={p.id}
            label={`$${p.amount.toLocaleString()}`}
            sub={p.date}
            right={<StatusBadge status={p.status} />}
            noChevron
          />
        ))}
      </RowGroup>

      <p className="px-5 pt-4" style={{ fontSize: 12.5, color: "#061C27", opacity: 0.55, lineHeight: 1.5, fontFamily: HOME_SANS }}>
        Earnings release 24 hours after each Booking is marked complete. Ewà Biz commission is 8%.
      </p>

      <div style={{ height: 32 }} />

      {linkOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal>
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={() => setLinkOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl p-5" style={{ backgroundColor: "#FFFFFF", color: "#061C27", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)", fontFamily: HOME_SANS }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>Connect your bank</div>
            <p className="mt-2" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
              We'll redirect you to our secure banking partner. Connection takes about 30 seconds.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button type="button" onClick={linkBank} className="h-12 rounded-2xl font-semibold" style={{ backgroundColor: "#FF823F", color: "#FFFFFF" }}>
                Continue
              </button>
              <button type="button" onClick={() => setLinkOpen(false)} className="h-12 rounded-2xl font-semibold" style={{ color: "#061C27", border: "1px solid rgba(6,28,39,0.15)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </HomeShell>
  );
}

function StatusBadge({ status }: { status: Payout["status"] }) {
  const map = {
    paid: { bg: "rgba(22,163,74,0.12)", fg: "#16A34A", l: "Paid" },
    pending: { bg: "rgba(245,158,11,0.12)", fg: "#B45309", l: "Pending" },
    failed: { bg: "rgba(220,38,38,0.12)", fg: "#DC2626", l: "Failed" },
  } as const;
  const s = map[status];
  return (
    <span className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600 }}>
      {s.l}
    </span>
  );
}

function Verified() {
  return (
    <span className="flex items-center gap-1" style={{ color: "#16A34A", fontSize: 12, fontWeight: 600 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
      Verified
    </span>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF823F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
