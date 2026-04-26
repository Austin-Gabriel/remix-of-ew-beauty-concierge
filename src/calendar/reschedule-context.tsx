import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Pending reschedules — the pro has long-pressed a booking, dragged it
 * to a new slot or resized it, and tapped Propose. The booking remains
 * displayed at its proposed position with a "pending" treatment until
 * the client accepts, declines, or the 60-second proposal window expires.
 *
 * Source of truth is in-memory. A future Lovable Cloud migration would
 * write through to a `reschedule_proposals` table and listen on Realtime
 * for the client's response.
 */

export type ProposalStatus = "pending" | "accepted" | "declined" | "expired";

export interface PendingReschedule {
  bookingId: string;
  clientLabel: string;
  originalStart: Date;
  originalDurationMin: number;
  proposedStart: Date;
  proposedDurationMin: number;
  createdAt: Date;
  /** When the proposal auto-expires if the client doesn't respond. */
  expiresAt: Date;
  status: ProposalStatus;
}

/**
 * Default proposal lifetime. Real product copy speaks in hours ("Awaiting
 * Maya · 23h left"), but for dev/demo realism we keep the timer short
 * enough that you can watch it tick. Override with `ttlMs` when calling
 * `propose()` if you want a longer-lived demo proposal.
 */
const PROPOSAL_TTL_MS = 24 * 60 * 60 * 1000; // 24h default

/** Format ms remaining into the compact "23h left" / "45m left" / "30s left" form. */
export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "expired";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s left`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m left`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h left`;
  const days = Math.floor(hr / 24);
  return `${days}d left`;
}

interface RescheduleCtx {
  proposals: PendingReschedule[];
  /** Current proposal for a booking, if any. Returns the most recent. */
  proposalFor: (bookingId: string) => PendingReschedule | null;
  /** Create or replace a proposal. */
  propose: (input: {
    bookingId: string;
    clientLabel: string;
    originalStart: Date;
    originalDurationMin: number;
    proposedStart: Date;
    proposedDurationMin: number;
  }) => void;
  /** Pro-side cancel before client responds. */
  cancel: (bookingId: string) => void;
  /** Dev/simulated client response. */
  simulateAccept: (bookingId: string) => void;
  simulateDecline: (bookingId: string) => void;
  /** Permanent overrides applied after acceptance — keyed by bookingId. */
  overrides: Record<
    string,
    { startsAt: Date; durationMin: number }
  >;
  /** Drives bubble re-render for the countdown. */
  tick: number;
}

const Ctx = createContext<RescheduleCtx | null>(null);

export function RescheduleProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<PendingReschedule[]>([]);
  const [overrides, setOverrides] = useState<
    Record<string, { startsAt: Date; durationMin: number }>
  >({});
  const [tick, setTick] = useState(0);

  // 1Hz tick while any proposal is pending so countdown + auto-expire run.
  useEffect(() => {
    const hasPending = proposals.some((p) => p.status === "pending");
    if (!hasPending) return;
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
      setProposals((cur) => {
        const now = Date.now();
        let changed = false;
        const next = cur.map((p) => {
          if (p.status === "pending" && p.expiresAt.getTime() <= now) {
            changed = true;
            return { ...p, status: "expired" as ProposalStatus };
          }
          return p;
        });
        return changed ? next : cur;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [proposals]);

  const proposalFor = useCallback(
    (bookingId: string): PendingReschedule | null => {
      // Most recent first.
      for (let i = proposals.length - 1; i >= 0; i--) {
        if (proposals[i].bookingId === bookingId) return proposals[i];
      }
      return null;
    },
    [proposals],
  );

  const propose = useCallback<RescheduleCtx["propose"]>((input) => {
    const now = new Date();
    const entry: PendingReschedule = {
      ...input,
      createdAt: now,
      expiresAt: new Date(now.getTime() + PROPOSAL_TTL_MS),
      status: "pending",
    };
    // Replace any prior pending for this booking; keep historical resolved ones.
    setProposals((cur) => [
      ...cur.filter(
        (p) => !(p.bookingId === input.bookingId && p.status === "pending"),
      ),
      entry,
    ]);
  }, []);

  const cancel = useCallback((bookingId: string) => {
    setProposals((cur) =>
      cur.map((p) =>
        p.bookingId === bookingId && p.status === "pending"
          ? { ...p, status: "declined" }
          : p,
      ),
    );
  }, []);

  const simulateAccept = useCallback((bookingId: string) => {
    setProposals((cur) => {
      const idx = [...cur]
        .reverse()
        .findIndex((p) => p.bookingId === bookingId && p.status === "pending");
      if (idx === -1) return cur;
      const realIdx = cur.length - 1 - idx;
      const target = cur[realIdx];
      const next = cur.slice();
      next[realIdx] = { ...target, status: "accepted" };
      // Apply the override.
      setOverrides((o) => ({
        ...o,
        [bookingId]: {
          startsAt: target.proposedStart,
          durationMin: target.proposedDurationMin,
        },
      }));
      return next;
    });
  }, []);

  const simulateDecline = useCallback((bookingId: string) => {
    setProposals((cur) =>
      cur.map((p) =>
        p.bookingId === bookingId && p.status === "pending"
          ? { ...p, status: "declined" }
          : p,
      ),
    );
  }, []);

  const value = useMemo<RescheduleCtx>(
    () => ({
      proposals,
      proposalFor,
      propose,
      cancel,
      simulateAccept,
      simulateDecline,
      overrides,
      tick,
    }),
    [
      proposals,
      proposalFor,
      propose,
      cancel,
      simulateAccept,
      simulateDecline,
      overrides,
      tick,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReschedule(): RescheduleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      proposals: [],
      proposalFor: () => null,
      propose: () => {},
      cancel: () => {},
      simulateAccept: () => {},
      simulateDecline: () => {},
      overrides: {},
      tick: 0,
    };
  }
  return ctx;
}
