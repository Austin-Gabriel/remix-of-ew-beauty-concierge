import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Star } from "lucide-react";
import type { ProfileSnapshot } from "@/profile/hooks/useProfile";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileSnapshot;
}

/**
 * Read-only public preview — what a client sees on the salon profile page.
 * Bottom sheet, ~85vh.
 */
export function CustomerViewModal({ open, onOpenChange, profile }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-y-auto rounded-t-3xl border-0 p-0"
        style={{ backgroundColor: "var(--eb-bg)", color: "var(--eb-fg)" }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Customer view</SheetTitle>
        </SheetHeader>

        <div
          aria-hidden
          className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full"
          style={{ backgroundColor: "var(--eb-fg-muted)", opacity: 0.4 }}
        />

        <div className="px-5 pt-3 pb-2">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
            style={{
              backgroundColor: "var(--eb-orange-soft)",
              color: "var(--eb-orange)",
              letterSpacing: "0.08em",
            }}
          >
            Preview
          </span>
        </div>

        <div className="flex flex-col items-center px-5 pb-6 text-center">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover"
              style={{ border: "1px solid var(--eb-hairline)" }}
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-[28px] font-semibold"
              style={{ backgroundColor: "var(--eb-surface-2)" }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="mt-3 text-[22px] font-semibold">{profile.name}</h2>
          {profile.role || profile.neighborhood ? (
            <p className="mt-1 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
              {[profile.role, profile.neighborhood].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {profile.rating != null && (profile.reviewCount ?? 0) > 0 ? (
            <div className="mt-2 flex items-center gap-1.5">
              <Star size={14} fill="currentColor" style={{ color: "var(--eb-orange)" }} />
              <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {profile.rating!.toFixed(1)}
              </span>
              <span className="text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
                ({profile.reviewCount})
              </span>
            </div>
          ) : null}
        </div>

        <Section title="Services">
          {profile.services.length === 0 ? (
            <Empty text="No services yet" />
          ) : (
            <div className="space-y-px">
              {profile.services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    backgroundColor: "var(--eb-surface)",
                    borderTop: "1px solid var(--eb-hairline)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[15px]">{s.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--eb-fg-muted)" }}>
                      {s.durationMinutes} min
                    </div>
                  </div>
                  <div className="text-[15px] font-medium">${s.priceUsd}</div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Portfolio">
          {profile.portfolio.length === 0 ? (
            <Empty text="No photos yet" />
          ) : (
            <div className="grid grid-cols-3 gap-1 px-2">
              {profile.portfolio.slice(0, 9).map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.imageUrl}
                  alt={p.caption ?? ""}
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Reviews">
          {profile.recentReviews.length === 0 ? (
            <Empty text="No reviews yet" />
          ) : (
            <div className="space-y-2 px-4">
              {profile.recentReviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: "var(--eb-surface)",
                    border: "1px solid var(--eb-hairline)",
                  }}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill="currentColor"
                        style={{ color: "var(--eb-orange)" }}
                      />
                    ))}
                  </div>
                  {r.body ? (
                    <p className="mt-1 text-[14px]" style={{ color: "var(--eb-fg)" }}>
                      {r.body}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="h-12" />
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3
        className="px-5 pb-2 text-[11px] font-medium uppercase"
        style={{ color: "var(--eb-fg-muted)", letterSpacing: "0.06em" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      className="mx-4 rounded-xl px-4 py-6 text-center text-[13px]"
      style={{ backgroundColor: "var(--eb-surface)", color: "var(--eb-fg-muted)" }}
    >
      {text}
    </div>
  );
}
