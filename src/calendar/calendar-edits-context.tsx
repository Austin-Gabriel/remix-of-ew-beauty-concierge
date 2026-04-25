import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BlockedSlot } from "@/calendar/calendar-data";

/**
 * Live, in-memory edits the pro has made on the Calendar surface.
 * Lifted out of CalendarPage so any sheet (BlockTime, Buffer) can mutate
 * state and the grid re-renders immediately — no refresh, no roundtrip.
 *
 * Persistence is intentionally session-scoped for now. A future Lovable
 * Cloud migration writes through to `availability_blocks` / a new
 * `blocked_time` table; the API surface here is shaped to match.
 *
 * Block edits are stored as a flat list keyed by id. Buffer extensions
 * are stored as a `bookingId → extraMinutes` map (the buffer's id is
 * the bookingId of the next booking — see calendar-data.ts).
 */

export type BlockEdit = BlockedSlot;

interface CalendarEditsCtx {
  blocks: BlockEdit[];
  /** Append a new block. */
  addBlock: (b: BlockEdit) => void;
  /** Replace an existing block by id. */
  updateBlock: (id: string, next: Partial<BlockEdit>) => void;
  /** Remove a block by id. */
  removeBlock: (id: string) => void;

  /** Map of bookingId → minutes added on top of the auto-calculated buffer. */
  bufferExtensions: Record<string, number>;
  /** Set the absolute extra minutes on a given buffer. */
  setBufferExtension: (bufferId: string, extraMin: number) => void;
}

const Ctx = createContext<CalendarEditsCtx | null>(null);

export function CalendarEditsProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<BlockEdit[]>([]);
  const [bufferExtensions, setBufferExt] = useState<Record<string, number>>({});

  const addBlock = useCallback((b: BlockEdit) => {
    setBlocks((prev) => [...prev, b]);
  }, []);

  const updateBlock = useCallback((id: string, next: Partial<BlockEdit>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...next } : b)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const setBufferExtension = useCallback((bufferId: string, extraMin: number) => {
    setBufferExt((prev) => ({ ...prev, [bufferId]: Math.max(0, extraMin) }));
  }, []);

  const value = useMemo<CalendarEditsCtx>(
    () => ({
      blocks,
      addBlock,
      updateBlock,
      removeBlock,
      bufferExtensions,
      setBufferExtension,
    }),
    [blocks, addBlock, updateBlock, removeBlock, bufferExtensions, setBufferExtension],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalendarEdits(): CalendarEditsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Graceful fallback when used outside provider — keeps individual
    // components testable and avoids crashing if someone renders a sheet
    // outside the Calendar tree.
    return {
      blocks: [],
      addBlock: () => {},
      updateBlock: () => {},
      removeBlock: () => {},
      bufferExtensions: {},
      setBufferExtension: () => {},
    };
  }
  return ctx;
}
