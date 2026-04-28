import { useMemo, useState } from "react";
import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";
import { useProfile } from "./profile-context";

interface MockReview {
  id: string;
  client: string;
  rating: number;
  service: string;
  date: string;
  body: string;
  reply?: string;
}

const MOCK_REVIEWS: MockReview[] = [
  { id: "r1", client: "Tasha M.", rating: 5, service: "Knotless braids", date: "Apr 22", body: "Amara is a perfectionist. Tension was perfect, parts were clean, and she finished on time. Already rebooked.", reply: "Thank you Tasha! See you in 8 weeks 💛" },
  { id: "r2", client: "Joy A.", rating: 5, service: "Silk press", date: "Apr 15", body: "Lasted two full weeks even through a workout class. The blowout was so smooth." },
  { id: "r3", client: "Renée K.", rating: 4, service: "Box braids", date: "Apr 9", body: "Beautiful work but ran about 30 minutes long. Worth it though." },
  { id: "r4", client: "Imani O.", rating: 5, service: "Cornrows", date: "Apr 2", body: "Quick, clean, and the price was honest. Highly recommend." },
  { id: "r5", client: "Dara F.", rating: 5, service: "Knotless braids", date: "Mar 28", body: "She made my daughter feel so comfortable. Loved the experience." },
];

export function ReviewsPage() {
  const { data } = useProfile();
  const [filter, setFilter] = useState<"all" | 5 | 4 | 3>("all");

  const reviews = useMemo(() => {
    if (filter === "all") return MOCK_REVIEWS;
    return MOCK_REVIEWS.filter((r) => r.rating === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const c = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    MOCK_REVIEWS.forEach((r) => (c[r.rating] = (c[r.rating] ?? 0) + 1));
    return c;
  }, []);
  const total = MOCK_REVIEWS.length;
  const avg = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);

  return (
    <HomeShell>
      <PageHeader title="Reviews" back={{ to: "/profile" }} />

      <div className="mx-4 mt-2 rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", fontFamily: HOME_SANS }}>
        <div className="flex items-end gap-4">
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#061C27", letterSpacing: "-0.02em", lineHeight: 1 }}>{avg}</div>
            <div className="mt-1 flex" style={{ color: "#FF823F" }}>
              {[1, 2, 3, 4, 5].map((i) => (<Star key={i} filled={i <= Math.round(Number(avg))} />))}
            </div>
            <div className="mt-1" style={{ fontSize: 12, color: "#061C27", opacity: 0.55 }}>{data.reviewCount ?? total} reviews</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2" style={{ fontSize: 11.5, color: "#061C27" }}>
                <span style={{ width: 8 }}>{n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.08)" }}>
                  <div className="h-full" style={{ width: `${(counts[n] / total) * 100}%`, backgroundColor: "#FF823F" }} />
                </div>
                <span style={{ width: 16, textAlign: "right", opacity: 0.55 }}>{counts[n]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-4" style={{ fontFamily: HOME_SANS }}>
        {([
          { k: "all" as const, l: `All ${total}` },
          { k: 5 as const, l: `5 stars` },
          { k: 4 as const, l: `4 stars` },
          { k: 3 as const, l: `3 stars` },
        ]).map((c) => {
          const active = filter === c.k;
          return (
            <button
              key={String(c.k)}
              type="button"
              onClick={() => setFilter(c.k)}
              className="shrink-0 rounded-full px-3.5 py-1.5"
              style={{
                backgroundColor: active ? "#061C27" : "#FFFFFF",
                color: active ? "#FFFFFF" : "#061C27",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid rgba(6,28,39,0.10)",
              }}
            >
              {c.l}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-2 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", fontFamily: HOME_SANS }}>
            <div className="flex items-center justify-between">
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#061C27" }}>{r.client}</div>
              <div style={{ fontSize: 12, color: "#061C27", opacity: 0.55 }}>{r.date}</div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex" style={{ color: "#FF823F" }}>
                {[1, 2, 3, 4, 5].map((i) => (<Star key={i} filled={i <= r.rating} small />))}
              </div>
              <span style={{ fontSize: 12, color: "#061C27", opacity: 0.55 }}>· {r.service}</span>
            </div>
            <p className="mt-2.5" style={{ fontSize: 14, color: "#061C27", lineHeight: 1.55 }}>{r.body}</p>
            {r.reply ? (
              <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: "#F1ECE6" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#061C27", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em" }}>You replied</div>
                <p className="mt-1" style={{ fontSize: 13.5, color: "#061C27", lineHeight: 1.5 }}>{r.reply}</p>
              </div>
            ) : (
              <button type="button" className="mt-3" style={{ fontSize: 13, fontWeight: 600, color: "#FF823F" }}>
                Reply
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function Star({ filled, small }: { filled: boolean; small?: boolean }) {
  const size = small ? 12 : 14;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </svg>
  );
}
