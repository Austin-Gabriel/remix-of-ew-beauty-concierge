/**
 * Calendar-specific data layer. Reads canonical bookings from
 * /src/data/mock-bookings.ts and synthesizes additional density / blocks /
 * availability from the dev-state toggle. NEVER modifies the canonical source.
 */

import {
  ALL_BOOKINGS,
  HISTORY_BOOKINGS,
  CANONICAL_SERVICES,
  type Booking,
  type CanonicalService,
} from "@/data/mock-bookings";
import type {
  DevWeekDensity,
  DevBlockedTime,
  DevAvailability,
} from "@/dev-state/dev-state-context";

/* ---------- Week math (Sun = 0 … Sat = 6) ---------- */

export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/* ---------- Format ---------- */

export function fmtTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const suf = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  if (m === 0) return `${h}:00 ${suf}`;
  return `${h}:${String(m).padStart(2, "0")} ${suf}`;
}

export function fmtHourLabel(hour24: number): string {
  if (hour24 === 0) return "12 AM";
  if (hour24 === 12) return "12 PM";
  if (hour24 < 12) return `${hour24} AM`;
  return `${hour24 - 12} PM`;
}

/* ---------- Travel buffer model ---------- */

export interface TravelBuffer {
  /** Stable key — bookingId of the *next* booking. */
  id: string;
  startsAt: Date;
  endsAt: Date;
  /** Auto-calculated minimum minutes (travel + min prep). */
  minMinutes: number;
  /** Currently-applied minutes (>= min). */
  minutes: number;
  /** Distance miles. */
  miles: number;
}

/* ---------- Blocked time model ---------- */

export interface BlockedSlot {
  id: string;
  startsAt: Date;
  endsAt: Date;
  reason?: string;
}

/* ---------- Availability model ---------- */

export interface AvailabilityRange {
  /** Minutes from midnight, inclusive start. */
  startMin: number;
  /** Minutes from midnight, exclusive end. */
  endMin: number;
}

/** dayOfWeek 0=Sun … 6=Sat → ranges */
export type AvailabilityWeek = Record<number, AvailabilityRange[]>;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const FULL_DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function dayShort(idx: number): string {
  return DAY_LABELS[idx] ?? "";
}

const range = (h1: number, h2: number): AvailabilityRange => ({
  startMin: h1 * 60,
  endMin: h2 * 60,
});

export function availabilityFor(preset: DevAvailability): AvailabilityWeek {
  // Defaults: Mon–Fri 10–6
  switch (preset) {
    case "split-days":
      return {
        0: [],
        1: [range(10, 14), range(16, 20)],
        2: [range(10, 14), range(16, 20)],
        3: [range(10, 14), range(16, 20)],
        4: [range(10, 14), range(16, 20)],
        5: [range(10, 14), range(16, 20)],
        6: [],
      };
    case "weekend-warrior":
      return {
        0: [range(10, 18)],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [range(15, 21)],
        6: [range(9, 19)],
      };
    case "limited":
      return {
        0: [],
        1: [range(11, 17)],
        2: [],
        3: [range(11, 17)],
        4: [],
        5: [range(11, 17)],
        6: [],
      };
    case "auto":
    case "standard":
    default:
      return {
        0: [],
        1: [range(10, 18)],
        2: [range(10, 18)],
        3: [range(10, 18)],
        4: [range(10, 18)],
        5: [range(10, 18)],
        6: [],
      };
  }
}

export function todayHoursLabel(av: AvailabilityWeek, today: Date): string {
  const ranges = av[today.getDay()] ?? [];
  if (ranges.length === 0) return "Today · No work";
  const fmt = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return fmtTime(d);
  };
  const parts = ranges.map((r) => `${fmt(r.startMin)} – ${fmt(r.endMin)}`);
  return `Today · ${parts.join(", ")}`;
}

/* ---------- Density seeding ---------- */

const FIRST_NAMES = [
  "Maya",
  "Tasha",
  "Renée",
  "Simone",
  "Jordan",
  "Devon",
  "Aaliyah",
  "Imani",
  "Zara",
  "Nia",
  "Asha",
  "Kemi",
  "Ife",
  "Omari",
  "Sade",
];
const NEIGHBORHOODS = [
  "Fort Greene, Brooklyn",
  "Bed-Stuy, Brooklyn",
  "Crown Heights, Brooklyn",
  "Park Slope, Brooklyn",
  "Clinton Hill, Brooklyn",
  "Harlem, Manhattan",
  "Williamsburg, Brooklyn",
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

interface Synth {
  id: string;
  clientFirst: string;
  service: CanonicalService;
  startsAt: Date;
  durationMin: number;
  neighborhood: string;
  isOnDemand: boolean;
}

export function bookingsForWeek(
  weekStart: Date,
  density: DevWeekDensity,
): Synth[] {
  // Always include real bookings that fall in this week.
  const weekEnd = addDays(weekStart, 7);
  const real: Synth[] = [...ALL_BOOKINGS, ...HISTORY_BOOKINGS]
    .filter((b) => b.startsAt >= weekStart && b.startsAt < weekEnd)
    .map((b) => ({
      id: b.id,
      clientFirst: b.clientName.split(" ")[0],
      service: b.service,
      startsAt: b.startsAt,
      durationMin: b.durationMin,
      neighborhood: b.neighborhood,
      isOnDemand: b.status === "pending" ? false : false,
    }));

  if (density === "auto" || density === "empty") {
    return density === "empty" ? [] : real;
  }

  const perDay =
    density === "light" ? [1, 2] : density === "typical" ? [3, 4] : [5, 6];
  const r = rng(weekStart.getTime() / 86400000);
  const synthesized: Synth[] = [];
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const day = addDays(weekStart, dayIdx);
    // Skip Sundays for non-packed presets to feel realistic.
    if (dayIdx === 0 && density !== "packed") continue;
    const count = Math.floor(r() * (perDay[1] - perDay[0] + 1)) + perDay[0];
    let cursorMin = 9 * 60 + Math.floor(r() * 60); // start ~9-10am
    for (let i = 0; i < count; i++) {
      const dur = [60, 75, 90, 120, 180, 240][Math.floor(r() * 6)];
      if (cursorMin + dur > 21 * 60) break;
      const startsAt = new Date(day);
      startsAt.setHours(0, Math.round(cursorMin / 5) * 5, 0, 0);
      const isOnDemand = r() < 0.18;
      synthesized.push({
        id: `synth-${dayIdx}-${i}-${weekStart.getTime()}`,
        clientFirst: FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)],
        service:
          CANONICAL_SERVICES[Math.floor(r() * CANONICAL_SERVICES.length)],
        startsAt,
        durationMin: dur,
        neighborhood:
          NEIGHBORHOODS[Math.floor(r() * NEIGHBORHOODS.length)],
        isOnDemand,
      });
      const travelGap = 25 + Math.floor(r() * 30);
      cursorMin += dur + travelGap;
    }
  }
  return [...real, ...synthesized].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
}

/* ---------- Compute travel buffers between consecutive bookings same day ---------- */

export function travelBuffersFor(items: Synth[]): TravelBuffer[] {
  const out: TravelBuffer[] = [];
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];
    if (!isSameDay(prev.startsAt, curr.startsAt)) continue;
    const prevEnd = new Date(prev.startsAt.getTime() + prev.durationMin * 60_000);
    const gap = (curr.startsAt.getTime() - prevEnd.getTime()) / 60_000;
    if (gap < 10 || gap > 120) continue;
    out.push({
      id: curr.id,
      startsAt: prevEnd,
      endsAt: curr.startsAt,
      minMinutes: 18,
      minutes: Math.min(gap, Math.max(22, Math.round(gap * 0.7))),
      miles: Number((1.5 + ((i * 1.7) % 4)).toFixed(1)),
    });
  }
  return out;
}

/* ---------- Blocked time seeding ---------- */

export function seedBlocks(
  weekStart: Date,
  preset: DevBlockedTime,
): BlockedSlot[] {
  if (preset === "auto" || preset === "none") return [];
  const today = new Date();
  if (preset === "one-today") {
    const start = new Date(today);
    start.setHours(15, 0, 0, 0);
    const end = new Date(today);
    end.setHours(16, 30, 0, 0);
    return [{ id: "blk-1", startsAt: start, endsAt: end, reason: "Personal" }];
  }
  if (preset === "multiple-week") {
    return [
      block(addDays(weekStart, 1), 12, 0, 13, 30, "Lunch"),
      block(addDays(weekStart, 3), 9, 0, 10, 0, "School run"),
      block(addDays(weekStart, 5), 16, 0, 18, 0, "Studio time"),
    ];
  }
  // vacation
  return Array.from({ length: 7 }, (_, i) =>
    block(addDays(weekStart, i), 0, 0, 23, 59, "Vacation"),
  );
}

function block(
  day: Date,
  h1: number,
  m1: number,
  h2: number,
  m2: number,
  reason: string,
): BlockedSlot {
  const s = new Date(day);
  s.setHours(h1, m1, 0, 0);
  const e = new Date(day);
  e.setHours(h2, m2, 0, 0);
  return { id: `blk-${day.getTime()}-${h1}`, startsAt: s, endsAt: e, reason };
}

/* ---------- Re-export the shape consumers use ---------- */

export type { Synth as CalendarBooking };

/** Find the canonical Booking by id so we can route to /bookings/$id. */
export function isRealBookingId(id: string): boolean {
  if (id.startsWith("synth-") || id.startsWith("blk-")) return false;
  return Boolean(
    ALL_BOOKINGS.find((b) => b.id === id) ??
      HISTORY_BOOKINGS.find((b) => b.id === id),
  );
}

export type { Booking };
