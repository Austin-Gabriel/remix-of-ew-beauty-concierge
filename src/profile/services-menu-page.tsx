import { useState } from "react";
import { toast } from "sonner";
import { HomeShell, HOME_SANS, useHomeTheme } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel } from "./profile-ui";
import { useProfile, VALID_SERVICES, type ServiceItem } from "./profile-context";

const DURATION_PRESETS = [30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480];

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function newId() {
  return `svc-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * /profile/services — manage service menu. Pick from the 10 valid Services,
 * set duration and price for each. Mock-first: writes to local profile context.
 */
export function ServicesMenuPage() {
  const { data, patch } = useProfile();
  const { text } = useHomeTheme();
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [picking, setPicking] = useState(false);

  const items = data.serviceMenu;
  const usedNames = new Set(items.map((s) => s.name));
  const available = VALID_SERVICES.filter((n) => !usedNames.has(n));

  const updateMenu = (next: ServiceItem[]) => {
    patch({ serviceMenu: next, services: next.map((s) => s.name) });
  };

  const onAddName = (name: string) => {
    setPicking(false);
    const draft: ServiceItem = { id: newId(), name, durationMin: 60, priceUsd: 80 };
    setEditing(draft);
  };

  const onSaveItem = (item: ServiceItem) => {
    const exists = items.some((s) => s.id === item.id);
    const next = exists ? items.map((s) => (s.id === item.id ? item : s)) : [...items, item];
    updateMenu(next);
    setEditing(null);
    toast(exists ? "Service updated" : "Service added");
  };

  const onDeleteItem = (id: string) => {
    updateMenu(items.filter((s) => s.id !== id));
    setEditing(null);
    toast("Service removed");
  };

  return (
    <HomeShell>
      <PageHeader
        title="Services & pricing"
        back={{ to: "/profile" }}
        right={
          available.length > 0 ? (
            <button
              type="button"
              onClick={() => setPicking(true)}
              style={{ color: "#FF823F", fontSize: 15, fontWeight: 600, fontFamily: HOME_SANS }}
            >
              Add
            </button>
          ) : null
        }
      />

      <p className="mx-4 mt-1" style={{ color: text, opacity: 0.55, fontSize: 12.5, fontFamily: HOME_SANS }}>
        Set duration and price per service. Clients book within these.
      </p>

      {items.length === 0 ? (
        <div className="mx-4 mt-6 rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", color: "#061C27", fontFamily: HOME_SANS }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No services yet</div>
          <p className="mt-1.5" style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>
            Add at least one service so clients can book you.
          </p>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="mt-4 h-11 rounded-xl px-5 font-semibold"
            style={{ backgroundColor: "#FF823F", color: "#FFFFFF" }}
          >
            Add a service
          </button>
        </div>
      ) : (
        <>
          <SectionLabel>{items.length} services</SectionLabel>
          <RowGroup>
            {items.map((s) => (
              <ServiceRow key={s.id} item={s} onClick={() => setEditing(s)} />
            ))}
          </RowGroup>
        </>
      )}

      <div style={{ height: 32 }} />

      {picking ? (
        <PickServiceSheet
          available={available as readonly string[] as string[]}
          onPick={onAddName}
          onClose={() => setPicking(false)}
        />
      ) : null}

      {editing ? (
        <EditServiceSheet
          item={editing}
          isNew={!items.some((s) => s.id === editing.id)}
          onSave={onSaveItem}
          onDelete={() => onDeleteItem(editing.id)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </HomeShell>
  );
}

function ServiceRow({ item, onClick }: { item: ServiceItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left transition-colors active:bg-black/[0.04] [&:not(:last-child)]:border-b"
      style={{ borderColor: "rgba(6,28,39,0.06)", fontFamily: HOME_SANS }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <span style={{ color: "#061C27", fontSize: 15, fontWeight: 500 }}>{item.name}</span>
          <span style={{ color: "#061C27", opacity: 0.55, fontSize: 12.5, marginTop: 2 }}>
            {formatDuration(item.durationMin)} · ${item.priceUsd}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#061C27", opacity: 0.35 }}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </button>
  );
}

function PickServiceSheet({ available, onPick, onClose }: { available: string[]; onPick: (n: string) => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} title="Add a service">
      {available.length === 0 ? (
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.6 }}>You've added all available services.</p>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {available.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onPick(name)}
              className="rounded-xl px-3 py-3 text-left transition-colors active:bg-black/[0.04]"
              style={{ backgroundColor: "rgba(6,28,39,0.04)", color: "#061C27", fontSize: 14, fontWeight: 500 }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function EditServiceSheet({
  item,
  isNew,
  onSave,
  onDelete,
  onClose,
}: {
  item: ServiceItem;
  isNew: boolean;
  onSave: (i: ServiceItem) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [duration, setDuration] = useState(item.durationMin);
  const [price, setPrice] = useState(String(item.priceUsd));

  const save = () => {
    const p = Math.max(0, Math.round(Number(price) || 0));
    onSave({ ...item, durationMin: duration, priceUsd: p });
  };

  return (
    <Sheet onClose={onClose} title={item.name}>
      <div className="mt-3 flex flex-col gap-4">
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55 }}>
            Duration
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DURATION_PRESETS.map((min) => {
              const active = duration === min;
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDuration(min)}
                  className="rounded-full px-3 py-1.5 transition-colors"
                  style={{
                    backgroundColor: active ? "#FF823F" : "rgba(6,28,39,0.06)",
                    color: active ? "#FFFFFF" : "#061C27",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {formatDuration(min)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55 }}>
            Price (USD)
          </div>
          <div className="mt-2 flex items-center rounded-xl px-3 py-3" style={{ backgroundColor: "rgba(6,28,39,0.04)" }}>
            <span style={{ color: "#061C27", opacity: 0.5, fontSize: 17, marginRight: 4 }}>$</span>
            <input
              value={price}
              inputMode="numeric"
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
              className="w-full bg-transparent outline-none"
              style={{ color: "#061C27", fontSize: 22, fontWeight: 600 }}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={save}
            className="h-12 w-full rounded-2xl font-semibold"
            style={{ backgroundColor: "#FF823F", color: "#FFFFFF" }}
          >
            {isNew ? "Add service" : "Save changes"}
          </button>
          {!isNew ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-12 w-full rounded-2xl font-semibold"
              style={{ backgroundColor: "transparent", color: "#DC2626" }}
            >
              Remove from menu
            </button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}

function Sheet({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl p-5"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#061C27",
          fontFamily: HOME_SANS,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.05)" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
