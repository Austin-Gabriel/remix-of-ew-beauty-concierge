import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, MoreHorizontal, ChevronLeft, ChevronRight, X, Zap } from "lucide-react";
import { HomeShell, useHomeTheme, HOME_SANS } from "@/home/home-shell";
import { BottomTabs, type TabKey } from "@/home/bottom-tabs";
import { ActiveBookingStrip } from "@/components/active-booking-strip";
import { useDevState } from "@/dev-state/dev-state-context";
import {
  addDays,
  availabilityFor,
  bookingsForWeek,
  dayShort,
  fmtHourLabel,
  fmtTime,
  FULL_DAY_LABELS,
  isRealBookingId,
  isSameDay,
  seedBlocks,
  startOfWeek,
  todayHoursLabel,
  travelBuffersFor,
  weekDays,
  type AvailabilityWeek,
  type AvailabilityRange,
  type BlockedSlot,
  type CalendarBooking,
  type TravelBuffer,
} from "@/calendar/calendar-data";

/**
 * Calendar — working surface showing the SHAPE of a pro's time.
 *
 *   Week (hero) · Day · Month
 *
 * Reads bookings from /src/data/mock-bookings.ts. Tapping a booking routes to
 * /bookings/$id. Plugs into the existing dev-state toggle; never duplicates
 * the lifecycle, detail, or settings surfaces.
 */

const UI = `Inter, ${HOME_SANS}`;
const ORANGE = "#FF823F";
const CREAM = "#F0EBD8";
const MIDNIGHT = "#061C27";

type View = "day" | "week" | "month";

const HOUR_HEIGHT = 56; // px per hour in week/day grid
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

  const initialView: View =
    dev.calendarView === "auto" ? "week" : dev.calendarView;
  const [view, setView] = useState<View>(initialView);
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Sheets
  const [blockSheet, setBlockSheet] = useState<{ start: Date } | null>(null);
  const [bufferSheet, setBufferSheet] = useState<TravelBuffer | null>(null);
  const [availabilitySheetOpen, setAvailabilitySheetOpen] = useState(false);

  const av = useMemo(() => availabilityFor(dev.availability), [dev.availability]);
  const today = new Date();

  return (
    <HomeShell>
      <ActiveBookingStrip />
      <Header
        availability={av}
        today={today}
        view={view}
        onViewChange={setView}
        onOverflow={() => setOverflowOpen(true)}
      />

      <div className="flex flex-1 flex-col">
        {view === "week" ? (
          <WeekView
            anchor={anchor}
            onAnchorChange={setAnchor}
            availability={av}
            blockedPreset={dev.blockedTime}
            density={dev.weekDensity}
            onOpenBooking={(id) => {
              if (isRealBookingId(id)) {
                navigate({ to: "/bookings/$id", params: { id } });
              }
            }}
            onTapEmpty={(start) => setBlockSheet({ start })}
            onTapBuffer={(b) => setBufferSheet(b)}
            onTapDay={(d) => {
              setAnchor(d);
              setView("day");
            }}
          />
        ) : null}

        {view === "day" ? (
          <DayView
            anchor={anchor}
            onAnchorChange={setAnchor}
            availability={av}
            blockedPreset={dev.blockedTime}
            density={dev.weekDensity}
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
            onTapDay={(d) => {
              setAnchor(d);
              setView("day");
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
   HEADER
===================================================================== */

function Header({
  availability,
  today,
  view,
  onViewChange,
  onOverflow,
}: {
  availability: AvailabilityWeek;
  today: Date;
  view: View;
  onViewChange: (v: View) => void;
  onOverflow: () => void;
}) {
  const { text, borderCol, bg } = useHomeTheme();
  const hours = todayHoursLabel(availability, today);
  return (
    <div className="px-4 pt-2" style={{ borderBottom: `1px solid ${borderCol}` }}>
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
            fontSize: 22,
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Calendar
        </h1>
        <div
          style={{
            fontFamily: UI,
            fontSize: 12.5,
            color: text,
            opacity: 0.6,
            marginTop: 3,
            letterSpacing: "-0.005em",
          }}
        >
          {hours}
        </div>
      </div>

      <ViewSwitcher view={view} onChange={onViewChange} />
    </div>
  );
}

function ViewSwitcher({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  const { text, borderCol } = useHomeTheme();
  const opts: View[] = ["day", "week", "month"];
  return (
    <div
      className="mb-3 flex w-full rounded-full p-1"
      style={{
        backgroundColor: "rgba(240,235,216,0.04)",
        border: `1px solid ${borderCol}`,
      }}
      role="tablist"
    >
      {opts.map((o) => {
        const active = o === view;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className="flex-1 rounded-full py-1.5 text-center transition-colors"
            style={{
              fontFamily: UI,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "-0.005em",
              backgroundColor: active ? ORANGE : "transparent",
              color: active ? MIDNIGHT : text,
              opacity: active ? 1 : 0.65,
              textTransform: "capitalize",
              border: "none",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* =====================================================================
   WEEK VIEW (hero)
===================================================================== */

function WeekView({
  anchor,
  onAnchorChange,
  availability,
  blockedPreset,
  density,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
  onTapDay,
}: {
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  availability: AvailabilityWeek;
  blockedPreset: ReturnType<typeof useDevState>["state"]["blockedTime"];
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
  onTapDay: (d: Date) => void;
}) {
  const wkStart = startOfWeek(anchor);
  const days = weekDays(wkStart);
  const today = new Date();
  const items = useMemo(() => bookingsForWeek(wkStart, density), [wkStart, density]);
  const buffers = useMemo(() => travelBuffersFor(items), [items]);
  const blocks = useMemo(() => seedBlocks(wkStart, blockedPreset), [wkStart, blockedPreset]);
  const { text } = useHomeTheme();

  return (
    <div className="flex flex-1 flex-col">
      {/* Week strip */}
      <WeekStrip
        days={days}
        today={today}
        items={items}
        anchor={anchor}
        onPrev={() => onAnchorChange(addDays(anchor, -7))}
        onNext={() => onAnchorChange(addDays(anchor, 7))}
        onTapDay={onTapDay}
      />

      <div
        className="relative flex-1 overflow-y-auto"
        style={{
          backgroundColor: "rgba(0,0,0,0.18)",
        }}
      >
        <div
          className="relative"
          style={{
            height: GRID_HOURS * HOUR_HEIGHT,
            paddingLeft: GUTTER_W,
          }}
        >
          {/* Hour gutter + lines */}
          <HourLines />

          {/* 7 day columns */}
          <div
            className="absolute inset-0"
            style={{ left: GUTTER_W, display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            {days.map((d, i) => (
              <DayColumn
                key={i}
                day={d}
                isToday={isSameDay(d, today)}
                isPast={d < new Date(today.toDateString())}
                availability={availability[d.getDay()] ?? []}
                items={items.filter((b) => isSameDay(b.startsAt, d))}
                buffers={buffers.filter((b) => isSameDay(b.startsAt, d))}
                blocks={blocks.filter((b) => isSameDay(b.startsAt, d))}
                onOpenBooking={onOpenBooking}
                onTapEmpty={onTapEmpty}
                onTapBuffer={onTapBuffer}
                compact
              />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: UI,
          fontSize: 10.5,
          color: text,
          opacity: 0.45,
          textAlign: "center",
          padding: "8px 0 4px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Tap empty space to block · tap travel to extend
      </div>
    </div>
  );
}

function WeekStrip({
  days,
  today,
  items,
  anchor,
  onPrev,
  onNext,
  onTapDay,
}: {
  days: Date[];
  today: Date;
  items: CalendarBooking[];
  anchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onTapDay: (d: Date) => void;
}) {
  const { text, borderCol } = useHomeTheme();
  const monthLabel = days[0].toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="px-4 pb-2 pt-3" style={{ borderBottom: `1px solid ${borderCol}` }}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous week"
          onClick={onPrev}
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          style={{
            fontFamily: UI,
            fontSize: 13,
            fontWeight: 600,
            color: text,
            opacity: 0.85,
            letterSpacing: "-0.005em",
          }}
        >
          {monthLabel}
        </div>
        <button
          type="button"
          aria-label="Next week"
          onClick={onNext}
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          const isAnchor = isSameDay(d, anchor);
          const count = items.filter((b) => isSameDay(b.startsAt, d)).length;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTapDay(d)}
              className="relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-opacity active:opacity-70"
              style={{
                backgroundColor:
                  isAnchor && !isToday ? "rgba(255,130,63,0.08)" : "transparent",
                border: "1px solid transparent",
              }}
            >
              <span
                style={{
                  fontFamily: UI,
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: text,
                  opacity: 0.55,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {dayShort(i)}
              </span>
              <span
                className="mt-1 flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  fontFamily: UI,
                  fontSize: 14,
                  fontWeight: 700,
                  color: isToday ? MIDNIGHT : text,
                  backgroundColor: isToday ? ORANGE : "transparent",
                  border: isToday ? "none" : "1px solid transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                {d.getDate()}
              </span>
              {count > 0 ? (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    bottom: 3,
                    width: 4,
                    height: 4,
                    borderRadius: 9999,
                    backgroundColor: isToday ? MIDNIGHT : ORANGE,
                    opacity: isToday ? 0.7 : 0.85,
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   GRID PRIMITIVES
===================================================================== */

function HourLines() {
  const { text } = useHomeTheme();
  const hours: number[] = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) hours.push(h);
  return (
    <div className="absolute inset-0">
      {hours.map((h, i) => {
        const top = (h - GRID_START_HOUR) * HOUR_HEIGHT;
        return (
          <div key={h}>
            <div
              className="absolute"
              style={{
                top,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "rgba(240,235,216,0.08)",
              }}
            />
            {/* 30-min divider */}
            {i < hours.length - 1 ? (
              <div
                className="absolute"
                style={{
                  top: top + HOUR_HEIGHT / 2,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: "rgba(240,235,216,0.04)",
                }}
              />
            ) : null}
            <span
              className="absolute"
              style={{
                top: top - 6,
                left: -GUTTER_W,
                width: GUTTER_W - 6,
                fontFamily: UI,
                fontSize: 10,
                fontWeight: 500,
                color: text,
                opacity: 0.45,
                textAlign: "right",
                letterSpacing: "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtHourLabel(h)}
            </span>
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

function pxFor(min: number): number {
  return (min / 60) * HOUR_HEIGHT;
}

function DayColumn({
  day,
  isToday,
  isPast,
  availability,
  items,
  buffers,
  blocks,
  onOpenBooking,
  onTapEmpty,
  onTapBuffer,
  compact,
}: {
  day: Date;
  isToday: boolean;
  isPast: boolean;
  availability: AvailabilityRange[];
  items: CalendarBooking[];
  buffers: TravelBuffer[];
  blocks: BlockedSlot[];
  onOpenBooking: (id: string) => void;
  onTapEmpty: (start: Date) => void;
  onTapBuffer: (b: TravelBuffer) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="relative"
      style={{
        borderLeft: "1px solid rgba(240,235,216,0.06)",
      }}
    >
      {/* Outside-hours base tint (cooler) — actually the column bg */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(240,235,216,0.015)" }}
      />
      {/* Inside-hours warmer band(s) */}
      {availability.map((r, i) => {
        const top = pxFor(r.startMin - GRID_START_HOUR * 60);
        const h = pxFor(r.endMin - r.startMin);
        return (
          <div
            key={i}
            aria-hidden
            className="absolute left-0 right-0"
            style={{
              top,
              height: h,
              backgroundColor: "rgba(255,130,63,0.045)",
              borderTop: "1px dashed rgba(255,130,63,0.10)",
              borderBottom: "1px dashed rgba(255,130,63,0.10)",
            }}
          />
        );
      })}

      {/* Tap-to-block layer (under blocks/items so they capture taps first). */}
      <button
        type="button"
        aria-label="Block time"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const y = e.clientY - rect.top;
          const minutesFromTop =
            Math.round(((y / HOUR_HEIGHT) * 60) / 15) * 15;
          const start = new Date(day);
          start.setHours(GRID_START_HOUR, 0, 0, 0);
          start.setMinutes(start.getMinutes() + minutesFromTop);
          onTapEmpty(start);
        }}
        className="absolute inset-0 cursor-pointer"
        style={{ background: "transparent", border: "none" }}
      />

      {/* Now-line */}
      {isToday ? <NowLine /> : null}

      {/* Blocks (under bookings so a real booking visually wins) */}
      {blocks.map((b) => (
        <BlockBlock key={b.id} block={b} compact={compact} />
      ))}

      {/* Travel buffers */}
      {buffers.map((b) => (
        <BufferBlock
          key={b.id}
          buffer={b}
          onTap={() => onTapBuffer(b)}
          compact={compact}
        />
      ))}

      {/* Bookings */}
      {items.map((it) => (
        <BookingBlock
          key={it.id}
          item={it}
          desaturate={isPast}
          onTap={() => onOpenBooking(it.id)}
          compact={compact}
        />
      ))}
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const top = pxFor(minutesIntoGrid(now));
  return (
    <div
      aria-hidden
      className="absolute left-0 right-0 z-10"
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
  onTap,
  compact,
}: {
  item: CalendarBooking;
  desaturate: boolean;
  onTap: () => void;
  compact?: boolean;
}) {
  const top = pxFor(minutesIntoGrid(item.startsAt));
  const h = Math.max(28, pxFor(item.durationMin));
  const tiny = h < 44;
  const time = `${fmtTime(item.startsAt)} – ${fmtTime(
    new Date(item.startsAt.getTime() + item.durationMin * 60_000),
  )}`;
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
        borderRadius: 6,
        backgroundColor: desaturate ? "rgba(240,235,216,0.55)" : CREAM,
        color: MIDNIGHT,
        padding: compact ? "4px 5px" : "6px 8px",
        boxShadow: "0 1px 0 rgba(0,0,0,0.15)",
        border: "1px solid rgba(6,28,39,0.18)",
        opacity: desaturate ? 0.7 : 1,
      }}
    >
      {item.isOnDemand ? (
        <Zap
          size={9}
          strokeWidth={2.5}
          className="absolute"
          style={{ top: 3, right: 3, color: ORANGE }}
        />
      ) : null}
      <div
        className="truncate"
        style={{
          fontFamily: UI,
          fontSize: compact ? 10.5 : 12,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {item.clientFirst}
      </div>
      {!tiny ? (
        <div
          className="truncate"
          style={{
            fontFamily: UI,
            fontSize: compact ? 9.5 : 11,
            fontWeight: 500,
            opacity: 0.75,
            marginTop: 1,
            lineHeight: 1.15,
          }}
        >
          {item.service}
        </div>
      ) : null}
      {h >= 60 ? (
        <div
          className="truncate"
          style={{
            fontFamily: UI,
            fontSize: compact ? 9 : 10.5,
            opacity: 0.6,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {time}
        </div>
      ) : null}
      {h >= 88 && !compact ? (
        <div
          className="truncate"
          style={{
            fontFamily: UI,
            fontSize: 10,
            opacity: 0.55,
            marginTop: 2,
          }}
        >
          {item.neighborhood.split(",")[0]}
        </div>
      ) : null}
    </button>
  );
}

function BufferBlock({
  buffer,
  onTap,
  compact,
}: {
  buffer: TravelBuffer;
  onTap: () => void;
  compact?: boolean;
}) {
  const top = pxFor(minutesIntoGrid(buffer.startsAt));
  const h = Math.max(14, pxFor(buffer.minutes));
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
        borderRadius: 4,
        backgroundColor: "rgba(240,235,216,0.08)",
        border: "1px solid rgba(240,235,216,0.12)",
        color: CREAM,
        padding: "2px 4px",
        fontFamily: UI,
        fontSize: compact ? 9 : 10,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        opacity: 0.85,
      }}
    >
      <span className="truncate">
        {compact
          ? `${buffer.minutes}m · ${buffer.miles}mi`
          : `Travel · ${buffer.minutes} min · ${buffer.miles} mi`}
      </span>
    </button>
  );
}

function BlockBlock({ block, compact }: { block: BlockedSlot; compact?: boolean }) {
  const top = pxFor(minutesIntoGrid(block.startsAt));
  const h = Math.max(
    18,
    pxFor((block.endsAt.getTime() - block.startsAt.getTime()) / 60_000),
  );
  return (
    <div
      className="absolute z-[2] overflow-hidden"
      style={{
        top,
        height: h,
        left: 2,
        right: 2,
        borderRadius: 5,
        backgroundColor: "rgba(6,28,39,0.55)",
        border: "1px solid rgba(240,235,216,0.18)",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(240,235,216,0.10) 0 4px, transparent 4px 8px)",
        padding: compact ? "3px 4px" : "5px 7px",
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
   DAY VIEW
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
  const { text, borderCol } = useHomeTheme();
  const isToday = isSameDay(anchor, today);
  const isPast = anchor < new Date(today.toDateString());

  const dateLabel = anchor.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${borderCol}` }}
      >
        <button
          type="button"
          onClick={() => onAnchorChange(addDays(anchor, -1))}
          aria-label="Previous day"
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          style={{
            fontFamily: UI,
            fontSize: 14,
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.01em",
          }}
        >
          {isToday ? `Today · ${dateLabel}` : dateLabel}
        </div>
        <button
          type="button"
          onClick={() => onAnchorChange(addDays(anchor, 1))}
          aria-label="Next day"
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div
        className="relative flex-1 overflow-y-auto"
        style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
      >
        <div
          className="relative"
          style={{
            height: GRID_HOURS * HOUR_HEIGHT,
            paddingLeft: GUTTER_W,
          }}
        >
          <HourLines />
          <div className="absolute inset-0" style={{ left: GUTTER_W }}>
            <DayColumn
              day={anchor}
              isToday={isToday}
              isPast={isPast}
              availability={availability[anchor.getDay()] ?? []}
              items={items}
              buffers={buffers}
              blocks={blocks}
              onOpenBooking={onOpenBooking}
              onTapEmpty={onTapEmpty}
              onTapBuffer={onTapBuffer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   MONTH VIEW
===================================================================== */

function MonthView({
  anchor,
  onAnchorChange,
  density,
  onTapDay,
}: {
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  density: ReturnType<typeof useDevState>["state"]["weekDensity"];
  onTapDay: (d: Date) => void;
}) {
  const { text, borderCol } = useHomeTheme();
  const today = new Date();
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  // 6 rows × 7 cols
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  // Aggregate booking counts across the visible weeks.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    const weekStarts = new Set<number>();
    cells.forEach((d) => weekStarts.add(startOfWeek(d).getTime()));
    weekStarts.forEach((ts) => {
      const items = bookingsForWeek(new Date(ts), density);
      items.forEach((b) => {
        const key = new Date(b.startsAt.toDateString()).getTime().toString();
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    });
    return map;
  }, [cells, density]);

  const monthLabel = anchor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${borderCol}` }}
      >
        <button
          type="button"
          onClick={() =>
            onAnchorChange(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))
          }
          aria-label="Previous month"
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          style={{
            fontFamily: UI,
            fontSize: 14,
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.01em",
          }}
        >
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() =>
            onAnchorChange(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
          }
          aria-label="Next month"
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 28, height: 28, color: text }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px px-2 pt-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: UI,
              fontSize: 10,
              fontWeight: 600,
              color: text,
              opacity: 0.5,
              textAlign: "center",
              padding: "6px 0",
              letterSpacing: "0.06em",
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const isToday = isSameDay(d, today);
          const key = new Date(d.toDateString()).getTime().toString();
          const count = counts.get(key) ?? 0;
          const fill = Math.min(1, count / 5);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTapDay(d)}
              className="relative flex flex-col items-center rounded-lg transition-opacity active:opacity-70"
              style={{
                aspectRatio: "1",
                backgroundColor:
                  count > 0
                    ? `rgba(255,130,63,${0.06 + fill * 0.18})`
                    : "rgba(240,235,216,0.025)",
                border: `1px solid ${
                  isToday ? "transparent" : "rgba(240,235,216,0.06)"
                }`,
                opacity: inMonth ? 1 : 0.35,
                padding: 4,
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  fontFamily: UI,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: isToday ? MIDNIGHT : text,
                  backgroundColor: isToday ? ORANGE : "transparent",
                  letterSpacing: "-0.005em",
                  marginTop: 2,
                }}
              >
                {d.getDate()}
              </span>
              {count > 0 ? (
                <div className="mt-auto flex gap-0.5 pb-1">
                  {Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                    <span
                      key={j}
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: 9999,
                        backgroundColor: ORANGE,
                        opacity: isToday ? 0.7 : 0.85,
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
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
          backgroundColor: "#0B2330",
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
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
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

  // Detect conflict against any booking on the same day for the requested span.
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
          marginBottom: 10,
          letterSpacing: "-0.005em",
        }}
      >
        Starting {fmtTime(start)} ·{" "}
        {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
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
            <SheetButton onClick={() => setPhase("choose")}>Pick another</SheetButton>
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

function OverflowSheet({
  onClose,
  onAvailability,
  onBlock,
}: {
  onClose: () => void;
  onAvailability: () => void;
  onBlock: () => void;
}) {
  return (
    <SheetShell title="More" onClose={onClose}>
      <div className="flex flex-col gap-2">
        <SheetButton onClick={onAvailability}>Availability</SheetButton>
        <SheetButton onClick={onBlock}>Block time</SheetButton>
        <SheetButton onClick={onClose}>Calendar settings (soon)</SheetButton>
      </div>
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
