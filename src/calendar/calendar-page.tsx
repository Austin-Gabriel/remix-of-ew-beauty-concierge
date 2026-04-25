import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Clock,
  CalendarOff,
  Activity,
  Settings as SettingsIcon,
  Check,
} from "lucide-react";
import { HomeShell, useHomeTheme, HOME_SANS } from "@/home/home-shell";
import { BottomTabs, type TabKey } from "@/home/bottom-tabs";
import { ActiveBookingStrip } from "@/components/active-booking-strip";
import { useDevState } from "@/dev-state/dev-state-context";
import {
  addDays,
  availabilityFor,
  bookingsForWeek,
  dayInitial,
  fmtHourLabel,
  fmtTime,
  fmtTimeShort,
  fmtUsd,
  freeSlotsFor,
  FULL_DAY_LABELS,
  isRealBookingId,
  isSameDay,
  seedBlocks,
  startOfDay,
  startOfWeek,
  statsForDay,
  statsForRange,
  travelBuffersFor,
  weekDays,
  type AvailabilityWeek,
  type AvailabilityRange,
  type BlockedSlot,
  type CalendarBooking,
  type FreeSlot,
  type TravelBuffer,
} from "@/calendar/calendar-data";

/**
 * Calendar — the working surface that shows the SHAPE of a pro's time.
 *   Week (default, hero) · Month
 * Reads bookings from /src/data/mock-bookings.ts. Tapping any booking routes
 * to /bookings/$id. Plugs into the existing dev-state toggle.
 *
 * Day view is no longer a top-level option. Tapping a day in Month jumps
 * to Week with that day highlighted as the hero column.
 */

const UI = `Inter, ${HOME_SANS}`;
const ORANGE = "#FF823F";
const CREAM = "#F0EBD8";
const MIDNIGHT = "#061C27";
const NAVY_PANEL = "#0B2330";

type View = "week" | "month";

/* Grid geometry */
const HOUR_HEIGHT_DAY = 64;
const HOUR_HEIGHT_WEEK = 52;
const GUTTER_W = 44;
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 22;
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR;

/* =====================================================================
   ROOT
===================================================================== */

export function CalendarPage() {
  const { state: dev } = useDevState();
  const navigate = useNavigate();

  // Calendar always lands on Week. Per spec: "every time the pro enters the
  // Calendar tab, they land on Week, regardless of what view they were on
  // previously." No persistence.
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  // The "hero" day inside Week view. Defaults to today; tapping a Week day
  // header changes it without navigating away. Tapping a Month cell sets
  // this AND switches to Week.
  const [heroDay, setHeroDay] = useState<Date>(() => new Date());
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Sheets
  const [blockSheet, setBlockSheet] = useState<{ start: Date } | null>(null);
  const [bufferSheet, setBufferSheet] = useState<TravelBuffer | null>(null);
  const [availabilitySheetOpen, setAvailabilitySheetOpen] = useState(false);

  const av = useMemo(() => availabilityFor(dev.availability), [dev.availability]);

  // Subtitle string per view.
  const subtitle = useViewSubtitle(view, anchor, dev.weekDensity, av);

  return (
    <HomeShell>
      <ActiveBookingStrip />
      <Header
        subtitle={subtitle}
        onOverflow={() => setOverflowOpen(true)}
      />

      <div className="flex flex-1 flex-col">
        {view === "week" ? (
          <WeekView
            anchor={anchor}
            onAnchorChange={(d) => {
              setAnchor(d);
              // Keep the hero inside the visible week. If the user paged to
              // a new week, default the hero to that week's "today" (or the
              // first day if today isn't in range).
              const wkStart = startOfWeek(d);
              const today = new Date();
              const todayInWeek =
                today >= wkStart && today < addDays(wkStart, 7);
              setHeroDay(todayInWeek ? today : wkStart);
            }}
            availability={av}
            blockedPreset={dev.blockedTime}
            density={dev.weekDensity}
            view={view}
            onViewChange={setView}
            heroDay={heroDay}
            onHeroDayChange={setHeroDay}
            onOpenBooking={(id) => {
              if (isRealBookingId(id)) {
                navigate({ to: "/bookings/$id", params: { id } });
              }
            }}
            onTapEmpty={(start) => setBlockSheet({ start })}
            onTapBuffer={(b) => setBufferSheet(b)}
          />
        ) : null}

        {view === "month" ? (
          <MonthView
            anchor={anchor}
            onAnchorChange={setAnchor}
            density={dev.weekDensity}
            availability={av}
            view={view}
            onViewChange={setView}
            onTapDay={(d) => {
              // Tapping a Month day: set as hero, jump to Week.
              setAnchor(d);
              setHeroDay(d);
              setView("week");
            }}
          />
        ) : null}
      </div>

      <BottomTabs
        active="calendar"
        onSelect={(k: TabKey) => {
          if (k === "home") navigate({ to: "/home" });
          if (k === "bookings") navigate({ to: "/bookings" });
          if (k === "calendar") return;
        }}
      />

      {overflowOpen ? (
        <OverflowSheet
          onClose={() => setOverflowOpen(false)}
          onAvailability={() => {
            setOverflowOpen(false);
            setAvailabilitySheetOpen(true);
          }}
          onBlock={() => {
            setOverflowOpen(false);
            const start = new Date();
            start.setMinutes(0, 0, 0);
            setBlockSheet({ start });
          }}
        />
      ) : null}

      {blockSheet ? (
        <BlockTimeSheet
          start={blockSheet.start}
          density={dev.weekDensity}
          onClose={() => setBlockSheet(null)}
        />
      ) : null}

      {bufferSheet ? (
        <BufferSheet buffer={bufferSheet} onClose={() => setBufferSheet(null)} />
      ) : null}

      {availabilitySheetOpen ? (
        <AvailabilitySheet
          availability={av}
          onClose={() => setAvailabilitySheetOpen(false)}
        />
      ) : null}
    </HomeShell>
  );
}

/* =====================================================================
   SUBTITLE (auto-derived per view)
===================================================================== */

function useViewSubtitle(
  view: View,
  anchor: Date,
  density: ReturnType<typeof useDevState>["state"]["weekDensity"],
  availability: AvailabilityWeek,
): string {
  return useMemo(() => {
    if (view === "week") {
      const wkStart = startOfWeek(anchor);
      const items = bookingsForWeek(wkStart, density);
      const earned = items.reduce((s, b) => s + b.priceUsd, 0);
      const rangeLabel = formatWeekRange(wkStart, addDays(wkStart, 6));
      const n = items.length;
      return `${rangeLabel} · ${n} booking${n === 1 ? "" : "s"} · ${fmtUsd(earned)}`;
    }
    // month
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    let count = 0;
    let earned = 0;
    let cursor = startOfWeek(monthStart);
    while (cursor < monthEnd) {
      const items = bookingsForWeek(cursor, density);
      items.forEach((b) => {
        if (b.startsAt >= monthStart && b.startsAt < monthEnd) {
          count += 1;
          earned += b.priceUsd;
        }
      });
      cursor = addDays(cursor, 7);
    }
    void availability;
    return `${monthStart.toLocaleDateString(undefined, { month: "long" })} · ${count} bookings · ${fmtUsd(earned)}`;
  }, [view, anchor, density, availability]);
}

function formatWeekRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sm = start.toLocaleDateString(undefined, { month: "short" });
  const em = end.toLocaleDateString(undefined, { month: "short" });
  return sameMonth
    ? `${sm} ${start.getDate()} – ${end.getDate()}`
    : `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

/* =====================================================================
   HEADER (shared)
===================================================================== */

function Header({
  subtitle,
  onOverflow,
}: {
  subtitle: string;
  onOverflow: () => void;
}) {
  const { text, borderCol, bg } = useHomeTheme();
  return (
    <div className="px-4 pt-2">
      <div className="flex items-center justify-between" style={{ height: 44 }}>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "rgba(240,235,216,0.04)",
            border: `1px solid ${borderCol}`,
            color: text,
          }}
        >
          <Bell size={16} strokeWidth={1.75} />
          <span
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              backgroundColor: ORANGE,
              color: MIDNIGHT,
              fontFamily: UI,
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
              border: `2px solid ${bg}`,
            }}
          >
            2
          </span>
        </button>
        <button
          type="button"
          aria-label="More"
          onClick={onOverflow}
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "rgba(240,235,216,0.04)",
            border: `1px solid ${borderCol}`,
            color: text,
          }}
        >
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="pb-3 pt-1">
        <h1
          style={{
            fontFamily: UI,
            fontSize: 30,
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Calendar
        </h1>
        <div
          style={{
            fontFamily: UI,
            fontSize: 13,
            color: text,
            opacity: 0.55,
            marginTop: 6,
            letterSpacing: "-0.005em",
          }}
        >
          {subtitle.split(" · ")[0]}
          <span style={{ opacity: 0.6 }}> · {subtitle.split(" · ").slice(1).join(" · ")}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * View dropdown — replaces the segmented Day/Week/Month pill.
 * The active date-range label gets a small chevron next to it; tapping the
 * label or chevron drops a menu with Week / Month. No big control eating
 * header space.
 */
function ViewDropdown({
  view,
  onChange,
  label,
}: {
  view: View;
  onChange: (v: View) => void;
  label: string;
}) {
  const { text, borderCol } = useHomeTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside tap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const opts: { value: View; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-opacity active:opacity-70"
        style={{
          fontFamily: UI,
          fontSize: 16,
          fontWeight: 700,
          color: text,
          letterSpacing: "-0.01em",
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            opacity: 0.6,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-1/2 z-30 mt-1 -translate-x-1/2 rounded-xl py-1"
          style={{
            top: "100%",
            minWidth: 132,
            backgroundColor: NAVY_PANEL,
            border: `1px solid ${borderCol}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {opts.map((o) => {
            const active = o.value === view;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors"
                style={{
                  fontFamily: UI,
                  fontSize: 14,
                  fontWeight: 500,
                  color: text,
                  backgroundColor: "transparent",
                  border: "none",
                }}
              >
                <span>{o.label}</span>
                {active ? (
                  <Check size={14} strokeWidth={2.25} style={{ color: ORANGE }} />
                ) : (
                  <span style={{ width: 14 }} />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* =====================================================================
   STAT STRIPS
===================================================================== */

function DateNavRow({
  label,
  onPrev,
  onNext,
  view,
  onViewChange,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  /**
   * When provided, the centre date label becomes a chevron-dropdown that
   * lets the pro switch between Week and Month. Per spec this replaces the
   * old segmented control.
   */
  view?: View;
  onViewChange?: (v: View) => void;
}) {
  const { text, borderCol } = useHomeTheme();
  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
        style={{
          width: 32,
          height: 32,
          color: text,
          backgroundColor: "rgba(240,235,216,0.04)",
          border: `1px solid ${borderCol}`,
        }}
      >
        <ChevronLeft size={16} />
      </button>
      {view && onViewChange ? (
        <ViewDropdown view={view} onChange={onViewChange} label={label} />
      ) : (
        <div
          style={{
            fontFamily: UI,
            fontSize: 16,
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
        style={{
          width: 32,
          height: 32,
          color: text,
          backgroundColor: "rgba(240,235,216,0.04)",
          border: `1px solid ${borderCol}`,
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function StatStrip({
  cols,
}: {
  cols: { value: string; label: string; valueAccent?: boolean }[];
}) {
  const { text, borderCol } = useHomeTheme();
  return (
    <div
      className="mx-4 mb-3 flex items-stretch rounded-2xl"
      style={{
        backgroundColor: "rgba(240,235,216,0.035)",
        border: `1px solid ${borderCol}`,
        padding: "14px 8px",
      }}
    >
      {cols.map((c, i) => (
        <div
          key={i}
          className="flex flex-1 flex-col items-center justify-center"
          style={{
            borderLeft: i === 0 ? "none" : "1px solid rgba(240,235,216,0.08)",
            padding: "0 4px",
          }}
        >
          <div
            style={{
              fontFamily: UI,
              fontSize: 20,
              fontWeight: 700,
              color: c.valueAccent ? ORANGE : text,
              letterSpacing: "-0.015em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.05,
            }}
          >
            {c.value}
          </div>
          <div
            style={{
              fontFamily: UI,
              fontSize: 9.5,
              fontWeight: 600,
              color: text,
              opacity: 0.5,
              marginTop: 5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   GRID PRIMITIVES
===================================================================== */

function HourGutter({ hourHeight }: { hourHeight: number }) {
  const { text } = useHomeTheme();
  const hours: number[] = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) hours.push(h);
  return (
    <div
      className="relative"
      style={{
        width: GUTTER_W,
        flexShrink: 0,
        borderRight: "1px solid rgba(240,235,216,0.06)",
      }}
    >
      {hours.map((h) => {
        const top = (h - GRID_START_HOUR) * hourHeight;
        return (
          <span
            key={h}
            className="absolute"
            style={{
              top: top - 6,
              right: 6,
              fontFamily: UI,
              fontSize: 10,
              fontWeight: 500,
              color: text,
              opacity: 0.5,
              textAlign: "right",
              letterSpacing: "0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtHourLabel(h)}
          </span>
        );
      })}
    </div>
  );
}

function HourLinesBg({ hourHeight }: { hourHeight: number }) {
  const hours: number[] = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) hours.push(h);
  return (
    <div className="pointer-events-none absolute inset-0">
      {hours.map((h, i) => {
        const top = (h - GRID_START_HOUR) * hourHeight;
        return (
          <div key={h}>
            <div
              className="absolute left-0 right-0"
              style={{
                top,
                height: 1,
                backgroundColor: "rgba(240,235,216,0.08)",
              }}
            />
            {i < hours.length - 1 ? (
              <div
                className="absolute left-0 right-0"
                style={{
                  top: top + hourHeight / 2,
                  height: 1,
                  backgroundColor: "rgba(240,235,216,0.035)",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function minutesIntoGrid(d: Date): number {
  const m = (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, m);
}

function pxFor(min: number, hourHeight: number): number {
  return (min / 60) * hourHeight;
}

/* =====================================================================
   DAY VIEW (per screenshot 1)
===================================================================== */

function DayView({
  anchor,
  onAnchorChange,
  availability,
  blockedPreset,
  density,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
}: {
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  availability: AvailabilityWeek;
  blockedPreset: ReturnType<typeof useDevState>["state"]["blockedTime"];
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
}) {
  const wkStart = startOfWeek(anchor);
  const today = new Date();
  const items = useMemo(
    () => bookingsForWeek(wkStart, density).filter((b) => isSameDay(b.startsAt, anchor)),
    [wkStart, density, anchor],
  );
  const buffers = useMemo(() => travelBuffersFor(items), [items]);
  const blocks = useMemo(
    () => seedBlocks(wkStart, blockedPreset).filter((b) => isSameDay(b.startsAt, anchor)),
    [wkStart, blockedPreset, anchor],
  );
  const dayAv = availability[anchor.getDay()] ?? [];
  const free = useMemo(
    () => freeSlotsFor(anchor, items, buffers, blocks, dayAv),
    [anchor, items, buffers, blocks, dayAv],
  );
  const stats = statsForDay(items, today);
  const isToday = isSameDay(anchor, today);
  const isPast = anchor < startOfDay(today);
  const dateLabel = anchor.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Active "NOW" booking — only on today, only if time falls inside it.
  const nowBookingId = isToday
    ? items.find(
        (b) =>
          today >= b.startsAt &&
          today < new Date(b.startsAt.getTime() + b.durationMin * 60_000),
      )?.id ?? null
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <DateNavRow
        label={dateLabel}
        onPrev={() => onAnchorChange(addDays(anchor, -1))}
        onNext={() => onAnchorChange(addDays(anchor, 1))}
      />
      <StatStrip
        cols={[
          {
            value: stats.nextUpAt ? fmtTimeShort(stats.nextUpAt) : "—",
            label: "Next up",
            valueAccent: true,
          },
          { value: String(stats.count), label: "Bookings" },
          { value: fmtUsd(stats.earnedUsd), label: "Expected" },
        ]}
      />

      <div
        className="relative flex-1 overflow-y-auto"
        style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
      >
        <div
          className="relative flex"
          style={{ height: GRID_HOURS * HOUR_HEIGHT_DAY }}
        >
          <HourGutter hourHeight={HOUR_HEIGHT_DAY} />
          <div className="relative flex-1" style={{ paddingRight: 8 }}>
            <HourLinesBg hourHeight={HOUR_HEIGHT_DAY} />
            <DayColumnInner
              day={anchor}
              isToday={isToday}
              isPast={isPast}
              availability={dayAv}
              items={items}
              buffers={buffers}
              blocks={blocks}
              freeSlots={free}
              hourHeight={HOUR_HEIGHT_DAY}
              compact={false}
              nowBookingId={nowBookingId}
              onOpenBooking={onOpenBooking}
              onTapEmpty={onTapEmpty}
              onTapBuffer={onTapBuffer}
              showInlineLabels
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   WEEK VIEW (hero — same language scaled across 7 cols)
===================================================================== */

function WeekView({
  anchor,
  onAnchorChange,
  availability,
  blockedPreset,
  density,
  view,
  onViewChange,
  heroDay,
  onHeroDayChange,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
}: {
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  availability: AvailabilityWeek;
  blockedPreset: ReturnType<typeof useDevState>["state"]["blockedTime"];
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  view: View;
  onViewChange: (v: View) => void;
  heroDay: Date;
  onHeroDayChange: (d: Date) => void;
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
}) {
  const wkStart = startOfWeek(anchor);
  const days = weekDays(wkStart);
  const today = new Date();
  const items = useMemo(() => bookingsForWeek(wkStart, density), [wkStart, density]);
  const buffers = useMemo(() => travelBuffersFor(items), [items]);
  const blocks = useMemo(() => seedBlocks(wkStart, blockedPreset), [wkStart, blockedPreset]);
  const stats = statsForRange(items, wkStart, addDays(wkStart, 7), availability);

  const rangeLabel = formatWeekRange(wkStart, addDays(wkStart, 6));

  return (
    <div className="flex flex-1 flex-col">
      <DateNavRow
        label={rangeLabel}
        onPrev={() => onAnchorChange(addDays(anchor, -7))}
        onNext={() => onAnchorChange(addDays(anchor, 7))}
        view={view}
        onViewChange={onViewChange}
      />
      <StatStrip
        cols={[
          { value: String(stats.count), label: "Bookings" },
          { value: fmtUsd(stats.earnedUsd), label: "Earned" },
          { value: `${stats.bookedPct}%`, label: "Booked", valueAccent: true },
        ]}
      />

      <WeekGrid
        days={days}
        today={today}
        items={items}
        buffers={buffers}
        blocks={blocks}
        availability={availability}
        heroDay={heroDay}
        onOpenBooking={onOpenBooking}
        onTapEmpty={onTapEmpty}
        onTapBuffer={onTapBuffer}
        onTapDay={onHeroDayChange}
      />
    </div>
  );
}

/* Single locked CSS-grid: gutter + 7 day columns share one column system,
   so the day-header row and time grid below are perfectly aligned. */
function WeekGrid({
  days,
  today,
  items,
  buffers,
  blocks,
  availability,
  heroDay,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
  onTapDay,
}: {
  days: Date[];
  today: Date;
  items: CalendarBooking[];
  buffers: TravelBuffer[];
  blocks: BlockedSlot[];
  availability: AvailabilityWeek;
  /** Highlighted day inside the week. Phase 1: prop wired only; Phase 2 will
   *  drive density/content per spec ("hero through information density, not
   *  column width"). */
  heroDay: Date;
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
  onTapDay: (d: Date) => void;
}) {
  // Active "NOW" booking — only on today, only if time falls inside it.
  const nowBookingId =
    items.find(
      (b) =>
        isSameDay(b.startsAt, today) &&
        today >= b.startsAt &&
        today < new Date(b.startsAt.getTime() + b.durationMin * 60_000),
    )?.id ?? null;

  const gridTemplate = `${GUTTER_W}px repeat(7, minmax(0, 1fr))`;
  const todayInWeek = days.some((d) => isSameDay(d, today));

  return (
    <div
      className="relative flex-1 overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
    >
      {/* Sticky day-header row — same column system as the body grid below. */}
      <div
        className="sticky top-0 z-20 grid"
        style={{
          gridTemplateColumns: gridTemplate,
          backgroundColor: NAVY_PANEL,
          borderBottom: "1px solid rgba(240,235,216,0.10)",
        }}
      >
        <div />
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          const isHero = isSameDay(d, heroDay);
          // Today wins the filled-orange treatment. A non-today hero day
          // gets a "bagel" ring (orange outline, transparent fill) to mark
          // it as the focus column without competing with today's signal.
          const circleBg = isToday ? ORANGE : "transparent";
          const circleBorder = isHero && !isToday ? `1.5px solid ${ORANGE}` : "none";
          const circleFg = isToday ? MIDNIGHT : CREAM;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTapDay(d)}
              className="flex min-w-0 flex-col items-center justify-center py-2 transition-opacity active:opacity-70"
              style={{ border: "none", background: "transparent" }}
            >
              <span
                style={{
                  fontFamily: UI,
                  fontSize: 9,
                  fontWeight: 600,
                  color: CREAM,
                  opacity: isHero ? 0.9 : 0.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {dayInitial(i)}
              </span>
              <span
                className="mt-1 flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  fontFamily: UI,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: circleFg,
                  backgroundColor: circleBg,
                  border: circleBorder,
                  letterSpacing: "-0.01em",
                }}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body — same grid template, so columns line up exactly under headers. */}
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: gridTemplate,
          height: GRID_HOURS * HOUR_HEIGHT_WEEK,
        }}
      >
        <HourGutter hourHeight={HOUR_HEIGHT_WEEK} />
        {/* Hour lines span the 7 day columns only (not the gutter). */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-0"
          style={{ left: GUTTER_W, right: 0 }}
        >
          <HourLinesBg hourHeight={HOUR_HEIGHT_WEEK} />
        </div>
        {days.map((d, i) => {
          const isHero = isSameDay(d, heroDay);
          return (
            <div
              key={i}
              className="relative min-w-0"
              style={{
                borderLeft: "1px solid rgba(240,235,216,0.06)",
                // Subtle wash to lift the hero column without changing its width.
                backgroundColor: isHero ? "rgba(255,130,63,0.025)" : "transparent",
              }}
            >
              <DayColumnInner
                day={d}
                isToday={isSameDay(d, today)}
                isPast={d < startOfDay(today)}
                availability={availability[d.getDay()] ?? []}
                items={items.filter((b) => isSameDay(b.startsAt, d))}
                buffers={buffers.filter((b) => isSameDay(b.startsAt, d))}
                blocks={blocks.filter((b) => isSameDay(b.startsAt, d))}
                freeSlots={[]}
                hourHeight={HOUR_HEIGHT_WEEK}
                compact
                hero={isHero}
                nowBookingId={nowBookingId}
                onOpenBooking={onOpenBooking}
                onTapEmpty={onTapEmpty}
                onTapBuffer={onTapBuffer}
                showInlineLabels={isHero}
              />
            </div>
          );
        })}
        {/* Global NOW line spans all 7 day columns (offset past the gutter). */}
        {todayInWeek ? (
          <div
            className="pointer-events-none absolute z-10"
            style={{ left: GUTTER_W, right: 0, top: 0, bottom: 0 }}
          >
            <GlobalNowLine hourHeight={HOUR_HEIGHT_WEEK} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GlobalNowLine({ hourHeight }: { hourHeight: number }) {
  const top = pxFor(minutesIntoGrid(new Date()), hourHeight);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 z-10"
      style={{ top }}
    >
      <div
        style={{
          height: 1.5,
          backgroundColor: ORANGE,
          boxShadow: "0 0 8px rgba(255,130,63,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: -3,
          width: 8,
          height: 8,
          borderRadius: 9999,
          backgroundColor: ORANGE,
        }}
      />
    </div>
  );
}

/* =====================================================================
   DAY COLUMN INNER (shared between Day & Week)
===================================================================== */

function DayColumnInner({
  day,
  isToday,
  isPast,
  availability,
  items,
  buffers,
  blocks,
  freeSlots,
  hourHeight,
  compact,
  hero = false,
  nowBookingId,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
  showInlineLabels,
}: {
  day: Date;
  isToday: boolean;
  isPast: boolean;
  availability: AvailabilityRange[];
  items: CalendarBooking[];
  buffers: TravelBuffer[];
  blocks: BlockedSlot[];
  freeSlots: FreeSlot[];
  hourHeight: number;
  compact: boolean;
  /** When true (Week view's highlighted day), bookings render with fuller
   *  content even within the compact layout. */
  hero?: boolean;
  nowBookingId: string | null;
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
  showInlineLabels: boolean;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        borderLeft: compact ? "1px solid rgba(240,235,216,0.06)" : "none",
      }}
    >
      {/* Outside-hours base tint (cooler) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
      />
      {/* Inside-hours warmer band */}
      {availability.map((r, i) => {
        const top = pxFor(r.startMin - GRID_START_HOUR * 60, hourHeight);
        const h = pxFor(r.endMin - r.startMin, hourHeight);
        return (
          <div
            key={i}
            aria-hidden
            className="absolute left-0 right-0"
            style={{
              top,
              height: h,
              backgroundColor: "rgba(255,130,63,0.035)",
            }}
          />
        );
      })}

      {/* Tap-to-block under everything */}
      <button
        type="button"
        aria-label="Block time"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const y = e.clientY - rect.top;
          const minutesFromTop =
            Math.round(((y / hourHeight) * 60) / 15) * 15;
          const start = new Date(day);
          start.setHours(GRID_START_HOUR, 0, 0, 0);
          start.setMinutes(start.getMinutes() + minutesFromTop);
          onTapEmpty(start);
        }}
        className="absolute inset-0 cursor-pointer"
        style={{ background: "transparent", border: "none" }}
      />

      {/* Free / Lunch dashed pills (Day view only) */}
      {freeSlots.map((f) => (
        <FreePill key={f.id} slot={f} hourHeight={hourHeight} />
      ))}

      {/* Now line — Day view: under booking ring */}
      {isToday && !nowBookingId ? (
        <NowLineLocal hourHeight={hourHeight} />
      ) : null}

      {/* Blocks */}
      {blocks.map((b) => (
        <BlockBlock key={b.id} block={b} compact={compact} hourHeight={hourHeight} />
      ))}

      {/* Travel buffers */}
      {buffers.map((b) => (
        <BufferBlock
          key={b.id}
          buffer={b}
          onTap={() => onTapBuffer(b)}
          compact={compact}
          hourHeight={hourHeight}
          showInlineLabel={showInlineLabels}
        />
      ))}

      {/* Bookings */}
      {items.map((it) => (
        <BookingBlock
          key={it.id}
          item={it}
          desaturate={isPast}
          isNow={it.id === nowBookingId}
          onTap={() => onOpenBooking(it.id)}
          compact={compact}
          hero={hero}
          hourHeight={hourHeight}
        />
      ))}
    </div>
  );
}

function NowLineLocal({ hourHeight }: { hourHeight: number }) {
  const top = pxFor(minutesIntoGrid(new Date()), hourHeight);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 z-[3]"
      style={{ top }}
    >
      <div
        style={{
          height: 1.5,
          backgroundColor: ORANGE,
          boxShadow: "0 0 8px rgba(255,130,63,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: -3,
          width: 7,
          height: 7,
          borderRadius: 9999,
          backgroundColor: ORANGE,
        }}
      />
    </div>
  );
}

function BookingBlock({
  item,
  desaturate,
  isNow,
  onTap,
  compact,
  hero = false,
  hourHeight,
}: {
  item: CalendarBooking;
  desaturate: boolean;
  isNow: boolean;
  onTap: () => void;
  compact: boolean;
  /** Hero column inside Week view — renders fuller content within compact layout. */
  hero?: boolean;
  hourHeight: number;
}) {
  const top = pxFor(minutesIntoGrid(item.startsAt), hourHeight);
  const h = Math.max(28, pxFor(item.durationMin, hourHeight));
  const tiny = h < 44;
  const initials = (item.clientFirst[0] ?? "").toUpperCase();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className="absolute z-[2] overflow-hidden text-left transition-opacity active:opacity-80"
      style={{
        top,
        height: h,
        left: 2,
        right: 2,
        borderRadius: 10,
        backgroundColor: desaturate ? "rgba(255,255,255,0.55)" : "#FFFFFF",
        color: MIDNIGHT,
        padding: compact ? "5px 6px" : "8px 10px",
        boxShadow: isNow
          ? `0 0 0 2px ${ORANGE}, 0 0 0 4px rgba(255,130,63,0.25)`
          : "0 1px 2px rgba(6,28,39,0.08), 0 4px 12px -8px rgba(6,28,39,0.20)",
        border: isNow ? "none" : "1px solid rgba(6,28,39,0.10)",
        opacity: desaturate ? 0.7 : 1,
      }}
    >
      {/* On-demand zap glyph */}
      {item.isOnDemand && !compact ? (
        <Zap
          size={10}
          strokeWidth={2.5}
          className="absolute"
          style={{ top: 6, right: 6, color: ORANGE }}
        />
      ) : null}
      {item.isOnDemand && compact ? (
        <Zap
          size={8}
          strokeWidth={2.5}
          className="absolute"
          style={{ top: 3, right: 3, color: ORANGE }}
        />
      ) : null}

      {/* NOW pill — notched over the top-right corner. Day view (large) and Week (compact). */}
      {isNow ? (
        <div
          className="absolute"
          style={{
            top: compact ? -6 : -7,
            right: compact ? -4 : -6,
            backgroundColor: ORANGE,
            color: MIDNIGHT,
            fontFamily: UI,
            fontSize: compact ? 8 : 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
            padding: compact ? "2px 5px" : "3px 7px",
            borderRadius: 4,
            zIndex: 3,
            boxShadow: "0 1px 2px rgba(6,28,39,0.25)",
          }}
        >
          NOW
        </div>
      ) : null}

      {!compact ? (
        <div className="flex items-start gap-2">
          {/* Avatar mono */}
          {h >= 44 ? (
            <div
              className="flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                backgroundColor: "rgba(255,130,63,0.22)",
                color: MIDNIGHT,
                fontFamily: UI,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginTop: 1,
              }}
            >
              {initials}
              {item.clientFirst[1]?.toUpperCase() ?? ""}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div
              className="truncate"
              style={{
                fontFamily: UI,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                paddingRight: isNow ? 42 : 14,
              }}
            >
              {item.clientFirst} · {fmtTimeShort(item.startsAt)}
            </div>
            {!tiny ? (
              <div
                className="truncate"
                style={{
                  fontFamily: UI,
                  fontSize: 12,
                  fontWeight: 500,
                  opacity: 0.7,
                  marginTop: 2,
                  lineHeight: 1.2,
                }}
              >
                {item.service} · {item.neighborhood.split(",")[0]}
              </div>
            ) : null}
          </div>
          {/* Duration pill on right */}
          {h >= 44 && !isNow ? (
            <div
              className="shrink-0 rounded-md"
              style={{
                fontFamily: UI,
                fontSize: 10,
                fontWeight: 600,
                color: MIDNIGHT,
                opacity: 0.6,
                backgroundColor: "rgba(6,28,39,0.08)",
                padding: "3px 6px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {durationPill(item.durationMin)}
            </div>
          ) : null}
        </div>
      ) : (
        // Compact (Week). Hero column gets fuller content; non-hero
        // abbreviates to keep the seven columns scannable.
        <>
          <div
            className="truncate"
            style={{
              fontFamily: UI,
              fontSize: hero ? 11.5 : 10.5,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
              paddingRight: item.isOnDemand ? 10 : 0,
            }}
          >
            {hero ? item.clientFirst : (item.clientFirst[0] ?? "") + "."}
          </div>
          {h >= 30 ? (
            <div
              className="truncate"
              style={{
                fontFamily: UI,
                fontSize: hero ? 10 : 9.5,
                fontWeight: 500,
                opacity: hero ? 0.85 : 0.65,
                lineHeight: 1.15,
                marginTop: 1,
              }}
            >
              {hero ? item.service : abbrevService(item.service)}
            </div>
          ) : null}
          {(hero ? h >= 36 : h >= 50) ? (
            <div
              className="truncate"
              style={{
                fontFamily: UI,
                fontSize: hero ? 9.5 : 9,
                opacity: hero ? 0.7 : 0.55,
                marginTop: 2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtTimeShort(item.startsAt)}
            </div>
          ) : null}
        </>
      )}
    </button>
  );
}

function durationPill(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

/** Compact service label for non-hero week columns. Keeps the first word
 *  (or the first 8 chars + ellipsis) so the column still communicates
 *  "what kind of booking" without dominating the block. */
function abbrevService(s: string): string {
  const head = s.split(/[—–·\-,]/)[0]?.trim() ?? s;
  if (head.length <= 10) return head;
  return head.slice(0, 9).trimEnd() + "…";
}

function FreePill({ slot, hourHeight }: { slot: FreeSlot; hourHeight: number }) {
  const top = pxFor(minutesIntoGrid(slot.startsAt), hourHeight);
  const h = Math.max(
    28,
    pxFor((slot.endsAt.getTime() - slot.startsAt.getTime()) / 60_000, hourHeight),
  );
  return (
    <div
      aria-hidden
      className="absolute z-[1] flex items-center justify-center"
      style={{
        top,
        height: h,
        left: 2,
        right: 2,
        borderRadius: 10,
        border: "1.5px dashed rgba(240,235,216,0.18)",
        backgroundColor: "transparent",
        color: CREAM,
        opacity: 0.55,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        pointerEvents: "none",
      }}
    >
      {slot.label}
    </div>
  );
}

function BufferBlock({
  buffer,
  onTap,
  compact,
  hourHeight,
  showInlineLabel,
}: {
  buffer: TravelBuffer;
  onTap: () => void;
  compact: boolean;
  hourHeight: number;
  showInlineLabel: boolean;
}) {
  const top = pxFor(minutesIntoGrid(buffer.startsAt), hourHeight);
  const h = Math.max(compact ? 8 : 14, pxFor(buffer.minutes, hourHeight));
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className="absolute z-[1] flex items-center justify-center overflow-hidden truncate text-left transition-opacity active:opacity-70"
      style={{
        top,
        height: h,
        left: 2,
        right: 2,
        borderRadius: 6,
        // Buffer is committed time. Distinct from "open" (transparent warm
        // band) and from "blocked" (dark hatched). We give it a soft orange
        // wash with a faint diagonal weave so it reads as "occupied, soft"
        // — clearly not bookable, clearly not a hard block.
        backgroundColor: "rgba(255,130,63,0.10)",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,130,63,0.14) 0 3px, transparent 3px 7px)",
        border: "1px dashed rgba(255,130,63,0.35)",
        color: CREAM,
        padding: compact ? "0 4px" : "2px 6px",
        fontFamily: UI,
        fontSize: compact ? 8.5 : 10,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        opacity: 0.95,
      }}
    >
      {showInlineLabel ? (
        <span className="truncate" style={{ opacity: 0.85 }}>
          Travel · {buffer.minutes} min · {buffer.miles} mi
        </span>
      ) : null}
    </button>
  );
}

function BlockBlock({
  block,
  compact,
  hourHeight,
}: {
  block: BlockedSlot;
  compact: boolean;
  hourHeight: number;
}) {
  const top = pxFor(minutesIntoGrid(block.startsAt), hourHeight);
  const h = Math.max(
    18,
    pxFor((block.endsAt.getTime() - block.startsAt.getTime()) / 60_000, hourHeight),
  );
  return (
    <div
      className="absolute z-[2] overflow-hidden"
      style={{
        top,
        height: h,
        left: 2,
        right: 2,
        borderRadius: 8,
        backgroundColor: "rgba(6,28,39,0.55)",
        border: "1px solid rgba(240,235,216,0.18)",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(240,235,216,0.10) 0 4px, transparent 4px 8px)",
        padding: compact ? "3px 4px" : "6px 8px",
        color: CREAM,
      }}
    >
      {block.reason && h >= 24 ? (
        <span
          className="truncate"
          style={{
            display: "block",
            fontFamily: UI,
            fontSize: compact ? 9.5 : 11,
            fontWeight: 600,
            opacity: 0.8,
            letterSpacing: "-0.005em",
          }}
        >
          {block.reason}
        </span>
      ) : null}
    </div>
  );
}

/* =====================================================================
   MONTH VIEW (per screenshot 2 — heat-aware)
===================================================================== */

function MonthView({
  anchor,
  onAnchorChange,
  density,
  availability,
  view,
  onViewChange,
  onTapDay,
}: {
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  availability: AvailabilityWeek;
  view: View;
  onViewChange: (v: View) => void;
  onTapDay: (d: Date) => void;
}) {
  const { text } = useHomeTheme();
  const today = new Date();
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const gridStart = startOfWeek(monthStart);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  // Aggregate booking counts per day across the visible weeks. We also
  // build a parallel "density score" that includes travel-buffer time so a
  // day with five bookings + lots of inter-booking travel reads denser than
  // five back-to-back bookings with no travel between them.
  const { counts, density: densityMap } = useMemo(() => {
    const cMap = new Map<string, number>();
    const dMap = new Map<string, number>();
    const weekStarts = new Set<number>();
    cells.forEach((d) => weekStarts.add(startOfWeek(d).getTime()));
    weekStarts.forEach((ts) => {
      const items = bookingsForWeek(new Date(ts), density);
      const buffers = travelBuffersFor(items);
      items.forEach((b) => {
        const key = startOfDay(b.startsAt).getTime().toString();
        cMap.set(key, (cMap.get(key) ?? 0) + 1);
        // 1 unit per booking baseline.
        dMap.set(key, (dMap.get(key) ?? 0) + 1);
      });
      buffers.forEach((b) => {
        const key = startOfDay(b.startsAt).getTime().toString();
        // Each ~30 min of travel buffer contributes 0.5 to density.
        dMap.set(key, (dMap.get(key) ?? 0) + b.minutes / 60);
      });
    });
    return { counts: cMap, density: dMap };
  }, [cells, density]);

  // Stats for the month proper (not the visible 6 weeks).
  const monthStats = useMemo(() => {
    let allItems: CalendarBooking[] = [];
    let cursor = startOfWeek(monthStart);
    while (cursor < monthEnd) {
      const items = bookingsForWeek(cursor, density);
      allItems = allItems.concat(items);
      cursor = addDays(cursor, 7);
    }
    return statsForRange(allItems, monthStart, monthEnd, availability);
  }, [monthStart, monthEnd, density, availability]);

  const monthLabel = anchor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <DateNavRow
        label={monthLabel}
        onPrev={() =>
          onAnchorChange(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))
        }
        onNext={() =>
          onAnchorChange(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
        }
        view={view}
        onViewChange={onViewChange}
      />

      <div className="grid grid-cols-7 gap-px px-3 pt-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: UI,
              fontSize: 10,
              fontWeight: 600,
              color: text,
              opacity: 0.45,
              textAlign: "center",
              padding: "4px 0",
              letterSpacing: "0.06em",
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 px-3 pb-2">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const isToday = isSameDay(d, today);
          const key = startOfDay(d).getTime().toString();
          const count = counts.get(key) ?? 0;
          const score = densityMap.get(key) ?? 0;
          // Heat tier blends booking count with buffer-time load.
          const tier = score === 0 ? 0 : score < 1.6 ? 1 : score < 3.5 ? 2 : 3;
          const tints = [
            "transparent",
            "rgba(255,130,63,0.15)",
            "rgba(255,130,63,0.40)",
            "rgba(255,130,63,1)",
          ];
          const numColor =
            tier === 3 ? MIDNIGHT : tier === 0 ? `${text}` : text;
          const numOpacity = tier === 0 ? 0.45 : 1;
          const countColor = tier === 3 ? MIDNIGHT : ORANGE;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onTapDay(d)}
              className="relative flex flex-col items-center justify-between rounded-lg transition-opacity active:opacity-70"
              style={{
                aspectRatio: "1",
                backgroundColor: tints[tier],
                border: isToday
                  ? `1.5px solid ${ORANGE}`
                  : "1px solid rgba(240,235,216,0.06)",
                opacity: inMonth ? 1 : 0.3,
                padding: "6px 4px",
              }}
            >
              <span
                style={{
                  fontFamily: UI,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: numColor,
                  opacity: numOpacity,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                {d.getDate()}
              </span>
              {count > 0 ? (
                <span
                  style={{
                    fontFamily: UI,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: countColor,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    marginBottom: 1,
                  }}
                >
                  {count}
                </span>
              ) : (
                <span style={{ height: 10 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Less → More legend */}
      <div className="flex items-center justify-center gap-2 pb-4 pt-1">
        <span
          style={{
            fontFamily: UI,
            fontSize: 10.5,
            color: text,
            opacity: 0.55,
            letterSpacing: "-0.005em",
          }}
        >
          Less
        </span>
        {["transparent", "rgba(255,130,63,0.15)", "rgba(255,130,63,0.40)", "rgba(255,130,63,1)"].map((c, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: c,
              border: "1px solid rgba(240,235,216,0.10)",
            }}
          />
        ))}
        <span
          style={{
            fontFamily: UI,
            fontSize: 10.5,
            color: text,
            opacity: 0.55,
            letterSpacing: "-0.005em",
          }}
        >
          More
        </span>
      </div>

      <StatStrip
        cols={[
          { value: String(monthStats.count), label: "Bookings" },
          { value: fmtUsd(monthStats.earnedUsd), label: "Earned" },
          { value: `${monthStats.bookedPct}%`, label: "Booked", valueAccent: true },
        ]}
      />
    </div>
  );
}

/* =====================================================================
   SHEETS
===================================================================== */

function SheetShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80]" style={{ fontFamily: UI }}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      />
      <div
        role="dialog"
        aria-label={title}
        className="absolute bottom-0 left-0 right-0 flex max-h-[80vh] flex-col overflow-hidden rounded-t-3xl"
        style={{
          backgroundColor: NAVY_PANEL,
          border: "1px solid rgba(240,235,216,0.10)",
          borderBottom: "none",
          color: CREAM,
          animation: "ewa-sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="flex justify-center pt-3">
          <span
            style={{
              width: 36,
              height: 4,
              borderRadius: 4,
              backgroundColor: "rgba(240,235,216,0.18)",
            }}
          />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              backgroundColor: "rgba(240,235,216,0.06)",
              color: CREAM,
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto px-5 pb-6"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes ewa-sheet-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function SheetButton({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl px-4 py-3 text-left transition-opacity active:opacity-70"
      style={{
        backgroundColor:
          variant === "primary" ? ORANGE : "rgba(240,235,216,0.04)",
        color: variant === "primary" ? MIDNIGHT : CREAM,
        border:
          variant === "primary"
            ? "none"
            : "1px solid rgba(240,235,216,0.10)",
        fontFamily: UI,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "-0.005em",
      }}
    >
      {children}
    </button>
  );
}

/* ----- Overflow / More sheet (per screenshot 3) ----- */

interface MoreItem {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  onClick?: () => void;
  soon?: boolean;
}

function MoreRow({ item }: { item: MoreItem }) {
  const disabled = item.soon || !item.onClick;
  return (
    <button
      type="button"
      onClick={item.onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-opacity active:opacity-70"
      style={{
        backgroundColor: "rgba(240,235,216,0.04)",
        border: "1px solid rgba(240,235,216,0.08)",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-xl"
        style={{
          width: 44,
          height: 44,
          backgroundColor: item.iconBg,
          color: item.iconColor,
        }}
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: UI,
              fontSize: 15,
              fontWeight: 700,
              color: CREAM,
              letterSpacing: "-0.01em",
            }}
          >
            {item.label}
          </span>
          {item.soon ? (
            <span
              style={{
                fontFamily: UI,
                fontSize: 9,
                fontWeight: 800,
                color: ORANGE,
                backgroundColor: "rgba(255,130,63,0.14)",
                border: "1px solid rgba(255,130,63,0.35)",
                letterSpacing: "0.1em",
                padding: "2px 6px",
                borderRadius: 4,
                textTransform: "uppercase",
              }}
            >
              Soon
            </span>
          ) : null}
        </div>
        <div
          className="truncate"
          style={{
            fontFamily: UI,
            fontSize: 12.5,
            color: CREAM,
            opacity: 0.55,
            marginTop: 2,
            letterSpacing: "-0.005em",
          }}
        >
          {item.desc}
        </div>
      </div>
      {!item.soon ? (
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          style={{ color: CREAM, opacity: 0.4, flexShrink: 0 }}
        />
      ) : null}
    </button>
  );
}

function OverflowSheet({
  onClose,
  onAvailability,
  onBlock,
}: {
  onClose: () => void;
  onAvailability: () => void;
  onBlock: () => void;
}) {
  const items: MoreItem[] = [
    {
      icon: <Clock size={20} strokeWidth={1.75} />,
      iconBg: "rgba(255,130,63,0.14)",
      iconColor: ORANGE,
      label: "Availability",
      desc: "Set hours for each day of the week",
      onClick: onAvailability,
    },
    {
      icon: <CalendarOff size={20} strokeWidth={1.75} />,
      iconBg: "rgba(120,200,160,0.14)",
      iconColor: "#7ECAA0",
      label: "Block time",
      desc: "Add an appointment, lunch, or day off",
      onClick: onBlock,
    },
    {
      icon: <Activity size={20} strokeWidth={1.75} />,
      iconBg: "rgba(255,130,63,0.14)",
      iconColor: ORANGE,
      label: "Sync external calendar",
      desc: "Connect Google or Apple Calendar",
      soon: true,
    },
    {
      icon: <SettingsIcon size={20} strokeWidth={1.75} />,
      iconBg: "rgba(240,235,216,0.10)",
      iconColor: CREAM,
      label: "Calendar settings",
      desc: "Default prep time, booking window, more",
      soon: true,
    },
  ];
  return (
    <SheetShell title="More" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <MoreRow key={i} item={it} />
        ))}
      </div>
    </SheetShell>
  );
}

/* ----- Block time sheet ----- */

function BlockTimeSheet({
  start,
  density,
  onClose,
}: {
  start: Date;
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"choose" | "custom" | "saved" | "conflict">(
    "choose",
  );
  const [conflictName, setConflictName] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const conflictCheck = (durationMin: number): string | null => {
    const wkStart = startOfWeek(start);
    const items = bookingsForWeek(wkStart, density).filter((b) =>
      isSameDay(b.startsAt, start),
    );
    const end = new Date(start.getTime() + durationMin * 60_000);
    for (const it of items) {
      const ie = new Date(it.startsAt.getTime() + it.durationMin * 60_000);
      if (start < ie && end > it.startsAt) return it.clientFirst;
    }
    return null;
  };

  const tryBlock = (durationMin: number) => {
    const c = conflictCheck(durationMin);
    if (c) {
      setConflictName(c);
      setPhase("conflict");
      return;
    }
    setPhase("saved");
  };

  return (
    <SheetShell
      title={phase === "saved" ? "Time blocked" : "Block time"}
      onClose={onClose}
    >
      <div
        style={{
          fontFamily: UI,
          fontSize: 12,
          color: CREAM,
          opacity: 0.6,
          marginBottom: 12,
          letterSpacing: "-0.005em",
        }}
      >
        Starting {fmtTime(start)} ·{" "}
        {start.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>

      {phase === "choose" ? (
        <div className="flex flex-col gap-2">
          <SheetButton onClick={() => tryBlock(30)}>Block 30 min</SheetButton>
          <SheetButton onClick={() => tryBlock(60)}>Block 1 hour</SheetButton>
          <SheetButton
            onClick={() => {
              const end = new Date(start);
              end.setHours(GRID_END_HOUR, 0, 0, 0);
              tryBlock(Math.max(30, (end.getTime() - start.getTime()) / 60_000));
            }}
          >
            Block until end of day
          </SheetButton>
          <SheetButton onClick={() => setPhase("custom")}>Custom…</SheetButton>
        </div>
      ) : null}

      {phase === "custom" ? (
        <div className="flex flex-col gap-3">
          <label
            style={{
              fontFamily: UI,
              fontSize: 11,
              fontWeight: 600,
              color: CREAM,
              opacity: 0.65,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Duration (minutes)
          </label>
          <div className="flex gap-2">
            {[15, 45, 90, 120, 180].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => tryBlock(m)}
                className="flex-1 rounded-lg py-2 transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "rgba(240,235,216,0.06)",
                  border: "1px solid rgba(240,235,216,0.12)",
                  color: CREAM,
                  fontFamily: UI,
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {m}m
              </button>
            ))}
          </div>
          <label
            style={{
              fontFamily: UI,
              fontSize: 11,
              fontWeight: 600,
              color: CREAM,
              opacity: 0.65,
              marginTop: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Personal, lunch, etc."
            style={{
              backgroundColor: "rgba(240,235,216,0.04)",
              border: "1px solid rgba(240,235,216,0.12)",
              borderRadius: 10,
              color: CREAM,
              fontFamily: UI,
              fontSize: 14,
              padding: "10px 12px",
              outline: "none",
            }}
          />
        </div>
      ) : null}

      {phase === "conflict" ? (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: "rgba(255,130,63,0.10)",
            border: "1px solid rgba(255,130,63,0.40)",
            color: CREAM,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.005em" }}>
            This would overlap with {conflictName}'s booking.
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Pick a shorter block or a different time.
          </div>
          <div className="mt-3 flex gap-2">
            <SheetButton onClick={() => setPhase("choose")}>
              Pick another
            </SheetButton>
          </div>
        </div>
      ) : null}

      {phase === "saved" ? (
        <div
          style={{
            fontFamily: UI,
            fontSize: 13,
            color: CREAM,
            opacity: 0.85,
          }}
        >
          Time blocked. The grid will reflect this on next refresh.
        </div>
      ) : null}
    </SheetShell>
  );
}

function BufferSheet({
  buffer,
  onClose,
}: {
  buffer: TravelBuffer;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"choose" | "saved">("choose");
  const [extraMin, setExtraMin] = useState(0);
  const total = buffer.minutes + extraMin;

  return (
    <SheetShell title="Travel buffer" onClose={onClose}>
      <div
        style={{
          fontFamily: UI,
          fontSize: 12,
          color: CREAM,
          opacity: 0.6,
          marginBottom: 12,
        }}
      >
        Travel · {total} min · {buffer.miles} mi · minimum {buffer.minMinutes} min
      </div>
      {phase === "choose" ? (
        <div className="flex flex-col gap-2">
          <SheetButton
            onClick={() => {
              setExtraMin(15);
              setPhase("saved");
            }}
          >
            Add 15 min
          </SheetButton>
          <SheetButton
            onClick={() => {
              setExtraMin(30);
              setPhase("saved");
            }}
          >
            Add 30 min
          </SheetButton>
          <SheetButton
            onClick={() => {
              setExtraMin(45);
              setPhase("saved");
            }}
          >
            Add 45 min
          </SheetButton>
        </div>
      ) : (
        <div
          style={{
            fontFamily: UI,
            fontSize: 13,
            color: CREAM,
            opacity: 0.85,
          }}
        >
          Buffer extended to {total} min for this gap only.
        </div>
      )}
    </SheetShell>
  );
}

function AvailabilitySheet({
  availability,
  onClose,
}: {
  availability: AvailabilityWeek;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<AvailabilityWeek>(() => ({ ...availability }));
  const toggleDay = (idx: number) => {
    setLocal((prev) => ({
      ...prev,
      [idx]: prev[idx]?.length ? [] : [{ startMin: 10 * 60, endMin: 18 * 60 }],
    }));
  };
  const fmt = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return fmtTime(d);
  };

  return (
    <SheetShell title="Availability" onClose={onClose}>
      <div
        style={{
          fontFamily: UI,
          fontSize: 12,
          color: CREAM,
          opacity: 0.55,
          marginBottom: 10,
        }}
      >
        Tap a day to toggle. Edit individual hours from a day's row.
      </div>
      <div className="flex flex-col gap-2">
        {FULL_DAY_LABELS.map((label, i) => {
          const ranges = local[i] ?? [];
          const on = ranges.length > 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-3 py-3"
              style={{
                backgroundColor: "rgba(240,235,216,0.04)",
                border: "1px solid rgba(240,235,216,0.10)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: UI,
                    fontSize: 14,
                    fontWeight: 600,
                    color: CREAM,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: UI,
                    fontSize: 12,
                    color: CREAM,
                    opacity: 0.55,
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {on
                    ? ranges
                        .map((r) => `${fmt(r.startMin)} – ${fmt(r.endMin)}`)
                        .join(" · ")
                    : "Off"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDay(i)}
                aria-pressed={on}
                className="flex shrink-0 items-center rounded-full"
                style={{
                  width: 38,
                  height: 22,
                  padding: 2,
                  backgroundColor: on ? ORANGE : "rgba(240,235,216,0.18)",
                  border: "none",
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: MIDNIGHT,
                    transform: on ? "translateX(16px)" : "translateX(0)",
                    transition: "transform 200ms ease",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: UI,
          fontSize: 11,
          color: CREAM,
          opacity: 0.5,
          textAlign: "center",
          marginTop: 14,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Saved
      </div>
    </SheetShell>
  );
}
