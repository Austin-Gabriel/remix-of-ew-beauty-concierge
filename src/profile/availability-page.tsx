import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell, HOME_SANS, useHomeTheme } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";
import { Switch } from "./profile-ui";
import {
  DAY_LABEL,
  DAY_ORDER,
  useProfile,
  type DayKey,
  type DayWindow,
  type WeeklyAvailability,
} from "./profile-context";

const TIME_OPTIONS = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  out.push("24:00");
  return out;
})();

function formatTime(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  if (hh === 24) return "12:00 AM";
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

function summarize(av: WeeklyAvailability): string {
  const open = DAY_ORDER.filter((d) => !av[d].closed);
  if (open.length === 0) return "Closed all week";
  // Try to detect a single window applied to a contiguous range.
  const first = av[open[0]];
  const sameWindow = open.every((d) => av[d].start === first.start && av[d].end === first.end);
  const labels = open.map((d) => DAY_LABEL[d].slice(0, 3));
  const range = sameWindow && open.length > 1 ? `${labels[0]}–${labels[labels.length - 1]}` : labels.join(", ");
  return sameWindow ? `${range} · ${formatTime(first.start)} – ${formatTime(first.end)}` : `${labels.join(", ")} · custom`;
}

/**
 * /profile/availability — weekly schedule. One open/closed toggle per day,
 * with start and end pickers. Mock-first: writes to local profile context.
 */
export function AvailabilityPage() {
  const { data, patch } = useProfile();
  const navigate = useNavigate();
  const { text } = useHomeTheme();

  const [draft, setDraft] = useState<WeeklyAvailability>(data.availability);
  const [editing, setEditing] = useState<{ day: DayKey; field: "start" | "end" } | null>(null);

  const dirty = useMemo(
    () => DAY_ORDER.some((d) => {
      const a = draft[d];
      const b = data.availability[d];
      return a.closed !== b.closed || a.start !== b.start || a.end !== b.end;
    }),
    [draft, data.availability],
  );

  const setDay = (day: DayKey, next: Partial<DayWindow>) => {
    setDraft((prev) => ({ ...prev, [day]: { ...prev[day], ...next } }));
  };

  const onSave = () => {
    // Validate: end > start for any open day.
    for (const d of DAY_ORDER) {
      const w = draft[d];
      if (!w.closed && w.end <= w.start) {
        toast(`${DAY_LABEL[d]}: end time must be after start`);
        return;
      }
    }
    patch({ availability: draft, availabilitySummary: summarize(draft) });
    toast("Availability updated");
    navigate({ to: "/profile" });
  };

  return (
    <HomeShell>
      <PageHeader
        title="Availability"
        back={{ to: "/profile" }}
        right={
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            style={{
              fontFamily: HOME_SANS,
              color: dirty ? "#FF823F" : text,
              opacity: dirty ? 1 : 0.4,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        }
      />

      <p className="mx-4 mt-1" style={{ color: text, opacity: 0.55, fontSize: 12.5, fontFamily: HOME_SANS }}>
        Clients can only book inside these windows.
      </p>

      <div className="mx-4 mt-3 overflow-hidden rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
        {DAY_ORDER.map((day) => (
          <DayRow
            key={day}
            day={day}
            window={draft[day]}
            onToggle={(open) => setDay(day, { closed: !open })}
            onEditStart={() => setEditing({ day, field: "start" })}
            onEditEnd={() => setEditing({ day, field: "end" })}
          />
        ))}
      </div>

      <div className="mx-4 mt-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(255,130,63,0.08)", border: "1px solid rgba(255,130,63,0.25)", color: "#061C27", fontFamily: HOME_SANS }}>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Summary</div>
        <div className="mt-1" style={{ fontSize: 13.5 }}>{summarize(draft)}</div>
      </div>

      <div style={{ height: 32 }} />

      {editing ? (
        <TimePickerSheet
          title={`${DAY_LABEL[editing.day]} · ${editing.field === "start" ? "opens" : "closes"}`}
          value={draft[editing.day][editing.field]}
          onPick={(t) => {
            setDay(editing.day, { [editing.field]: t });
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </HomeShell>
  );
}

function DayRow({
  day,
  window: w,
  onToggle,
  onEditStart,
  onEditEnd,
}: {
  day: DayKey;
  window: DayWindow;
  onToggle: (open: boolean) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 [&:not(:last-child)]:border-b"
      style={{ borderColor: "rgba(6,28,39,0.06)", fontFamily: HOME_SANS }}
    >
      <div className="flex w-20 shrink-0 flex-col">
        <span style={{ color: "#061C27", fontSize: 15, fontWeight: 500 }}>{DAY_LABEL[day].slice(0, 3)}</span>
        <span style={{ color: "#061C27", opacity: 0.5, fontSize: 11.5, marginTop: 1 }}>
          {w.closed ? "Closed" : "Open"}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        {w.closed ? (
          <span style={{ color: "#061C27", opacity: 0.4, fontSize: 13 }}>—</span>
        ) : (
          <>
            <TimeChip label={formatTime(w.start)} onClick={onEditStart} />
            <span style={{ color: "#061C27", opacity: 0.4 }}>–</span>
            <TimeChip label={formatTime(w.end)} onClick={onEditEnd} />
          </>
        )}
      </div>

      <Switch checked={!w.closed} onChange={onToggle} label={`${DAY_LABEL[day]} open`} />
    </div>
  );
}

function TimeChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-2.5 py-1.5 transition-colors active:bg-black/[0.04]"
      style={{ backgroundColor: "rgba(6,28,39,0.05)", color: "#061C27", fontSize: 13, fontWeight: 600, fontFamily: HOME_SANS }}
    >
      {label}
    </button>
  );
}

function TimePickerSheet({
  title,
  value,
  onPick,
  onClose,
}: {
  title: string;
  value: string;
  onPick: (t: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl p-5"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#061C27",
          fontFamily: HOME_SANS,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.05)" }}>
            ✕
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {TIME_OPTIONS.map((t) => {
            const active = t === value;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onPick(t)}
                className="rounded-lg py-2.5 transition-colors"
                style={{
                  backgroundColor: active ? "#FF823F" : "rgba(6,28,39,0.04)",
                  color: active ? "#FFFFFF" : "#061C27",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {formatTime(t)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
