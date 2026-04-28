import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";
import { useProfile, type ProfileService, type ProfilePortfolioItem } from "@/profile/hooks/useProfile";
import {
  Star,
  Calendar,
  CreditCard,
  Link2,
  HelpCircle,
  FileText,
  MessageCircle,
  Flag,
  Users,
  Plus,
  Share2,
  Trash2,
  Camera,
  Banknote,
  Download,
} from "lucide-react";

/* ------- Demo seed data (matches Ewà web app sample) ------- */
const DEMO_SERVICES: ProfileService[] = [
  { id: "s1", name: "Silk press", priceUsd: 120, durationMinutes: 90 },
  { id: "s2", name: "Wash & style", priceUsd: 75, durationMinutes: 60 },
  { id: "s3", name: "Box braids — small", priceUsd: 280, durationMinutes: 360 },
  { id: "s4", name: "Knotless braids", priceUsd: 240, durationMinutes: 300 },
  { id: "s5", name: "Trim & treatment", priceUsd: 65, durationMinutes: 45 },
];

const DEMO_PORTFOLIO: ProfilePortfolioItem[] = [
  { id: "p1", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", caption: null },
  { id: "p2", imageUrl: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400", caption: null },
  { id: "p3", imageUrl: "https://images.unsplash.com/photo-1552642986-ccb41e7059e7?w=400", caption: null },
  { id: "p4", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400", caption: null },
  { id: "p5", imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400", caption: null },
  { id: "p6", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400", caption: null },
];

const DEMO_REVIEWS = [
  { id: "r1", rating: 5, body: "Best silk press in BK. Booked again." },
  { id: "r2", rating: 5, body: "Patient, clean, on time." },
  { id: "r3", rating: 4, body: "Good vibes, slight wait." },
  { id: "r4", rating: 5, body: "She’s the truth — left with bounce for days." },
];

/* ------- ServicesStubPage ------- */
export function ServicesStubPage() {
  const profile = useProfile();
  const [services, setServices] = useState<ProfileService[]>(
    profile.services.length ? profile.services : DEMO_SERVICES,
  );

  const addService = () => {
    const newService: ProfileService = {
      id: `s${Date.now()}`,
      name: "New service",
      priceUsd: 80,
      durationMinutes: 60,
    };
    setServices((prev) => [newService, ...prev]);
    toast.success("Service added", { description: "Tap to edit name and price" });
  };

  const removeService = (id: string, name: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Removed “${name}”`);
  };

  return (
    <SubpageShell title="Services & pricing">
      <SectionLabel>Active</SectionLabel>
      {services.length === 0 ? (
        <Empty
          title="No services yet"
          body="Add the services you offer with prices and durations so clients can book."
          cta="Add a service"
          onCta={addService}
        />
      ) : (
        <SectionCard>
          {services.map((s) => (
            <SettingsRow
              key={s.id}
              icon={<span className="text-[14px]">✂︎</span>}
              label={s.name}
              sublabel={`${s.durationMinutes} min`}
              onClick={() => toast.info(s.name, { description: `$${s.priceUsd} · ${s.durationMinutes} min` })}
              right={
                <span className="flex items-center gap-3">
                  <span className="text-[15px] font-medium">${s.priceUsd}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeService(s.id, s.name);
                    }}
                    className="rounded-full p-1.5 transition-opacity active:opacity-60"
                    style={{ color: "var(--eb-fg-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              }
            />
          ))}
        </SectionCard>
      )}

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={addService}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70"
          style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
        >
          <Plus size={16} strokeWidth={2.5} /> Add a service
        </button>
      </div>
    </SubpageShell>
  );
}

/* ------- ReviewsStubPage ------- */
export function ReviewsStubPage() {
  const profile = useProfile();
  const reviews = profile.recentReviews.length ? profile.recentReviews : DEMO_REVIEWS;
  const rating = profile.rating ?? 4.9;
  const reviewCount = profile.reviewCount || reviews.length * 34;

  const share = async () => {
    const shareData = {
      title: `${profile.name || "My profile"} on Ewà`,
      text: `Book me on Ewà — ${rating.toFixed(1)}★ (${reviewCount} reviews)`,
      url: typeof window !== "undefined" ? window.location.origin + "/p/me" : "",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Profile link copied");
      } else {
        toast.info("Sharing not supported here");
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <SubpageShell title="Reviews">
      <div className="flex items-center justify-center gap-2 px-5 py-6">
        <Star size={20} fill="currentColor" style={{ color: "var(--eb-orange)" }} />
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "var(--eb-fg)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {rating.toFixed(1)}
        </span>
        <span className="ml-1 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
          ({reviewCount})
        </span>
      </div>
      <SectionCard>
        {reviews.map((r) => (
          <div key={r.id} className="px-4 py-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" style={{ color: "var(--eb-orange)" }} />
              ))}
            </div>
            {r.body ? (
              <p className="mt-1.5 text-[14px]" style={{ color: "var(--eb-fg)" }}>
                {r.body}
              </p>
            ) : null}
          </div>
        ))}
      </SectionCard>

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={share}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70"
          style={{ backgroundColor: "var(--eb-surface)", border: "1px solid var(--eb-hairline)", color: "var(--eb-fg)" }}
        >
          <Share2 size={16} /> Share your profile
        </button>
      </div>
    </SubpageShell>
  );
}

/* ------- AvailabilityStubPage ------- */
export function AvailabilityStubPage() {
  const profile = useProfile();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const defaultHours = profile.availability.summary?.split("·").pop()?.trim() ?? "9:00 AM – 7:00 PM";
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set(["Sun"]));
  const [buffer, setBuffer] = useState(20);

  const toggleDay = (d: string) => {
    setClosedDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) {
        next.delete(d);
        toast.success(`${d} open`);
      } else {
        next.add(d);
        toast.success(`${d} closed`);
      }
      return next;
    });
  };

  const cycleBuffer = () => {
    const opts = [10, 15, 20, 30, 45];
    const next = opts[(opts.indexOf(buffer) + 1) % opts.length];
    setBuffer(next);
    toast.success(`Buffer set to ${next} min`);
  };

  return (
    <SubpageShell title="Availability">
      <SectionLabel>Weekly schedule</SectionLabel>
      <SectionCard>
        {days.map((d) => {
          const closed = closedDays.has(d);
          return (
            <SettingsRow
              key={d}
              icon={
                <span className="text-[11px] font-semibold" style={{ color: "var(--eb-fg)" }}>
                  {d.slice(0, 1)}
                </span>
              }
              label={d}
              sublabel={closed ? "Closed" : defaultHours}
              onClick={() => toggleDay(d)}
              right={
                <span
                  className="text-[13px] font-medium"
                  style={{ color: closed ? "var(--eb-fg-muted)" : "var(--eb-orange)" }}
                >
                  {closed ? "Open" : "Close"}
                </span>
              }
            />
          );
        })}
      </SectionCard>
      <SectionLabel>Buffer between appointments</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Calendar size={14} strokeWidth={1.8} />}
          label={`${buffer} minutes`}
          onClick={cycleBuffer}
          right={<span className="text-[13px] font-medium" style={{ color: "var(--eb-orange)" }}>Change</span>}
        />
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- SocialsStubPage ------- */
export function SocialsStubPage() {
  type Platform = "instagram" | "tiktok" | "youtube";
  const [connected, setConnected] = useState<Record<Platform, string | null>>({
    instagram: null,
    tiktok: null,
    youtube: null,
  });

  const toggle = (p: Platform, sample: string) => {
    setConnected((prev) => {
      const next = { ...prev };
      if (next[p]) {
        next[p] = null;
        toast.success(`${p[0].toUpperCase() + p.slice(1)} disconnected`);
      } else {
        next[p] = sample;
        toast.success(`${p[0].toUpperCase() + p.slice(1)} connected`, { description: sample });
      }
      return next;
    });
  };

  const row = (p: Platform, label: string, sub: string, sample: string) => (
    <SettingsRow
      icon={<Link2 size={14} strokeWidth={1.8} />}
      label={label}
      sublabel={connected[p] ?? sub}
      onClick={() => toggle(p, sample)}
      right={
        <span
          className="rounded-full px-3 py-1 text-[12px] font-semibold"
          style={
            connected[p]
              ? { backgroundColor: "var(--eb-surface-2)", color: "var(--eb-fg-muted)" }
              : { backgroundColor: "var(--eb-orange)", color: "white" }
          }
        >
          {connected[p] ? "Disconnect" : "Connect"}
        </span>
      }
    />
  );

  return (
    <SubpageShell title="Connect socials">
      <SectionLabel>Platforms</SectionLabel>
      <SectionCard>
        {row("instagram", "Instagram", "Show your latest 6 posts on your profile", "@aaliyahdoeshair")}
        {row("tiktok", "TikTok", "Show your top videos", "@aaliyah.bk")}
        {row("youtube", "YouTube", "Embed a featured video", "@aaliyahdoeshair")}
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- PayoutsAndBankingPage ------- */
export function PayoutsAndBankingPage() {
  const profile = useProfile();
  const [method, setMethod] = useState<string | null>(profile.payout.method ?? "Chase ··4242");

  const change = () => {
    if (method) {
      setMethod(null);
      toast.success("Bank account removed");
    } else {
      setMethod("Chase ··4242");
      toast.success("Bank account connected", { description: "Payouts will start within 24 hours" });
    }
  };

  const downloadDoc = (name: string) => {
    toast.success(`${name} ready`, { description: "Sent to your email" });
  };

  return (
    <SubpageShell title="Payouts & banking">
      <SectionLabel>Method</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<CreditCard size={14} strokeWidth={1.8} />}
          label={method ?? "No method connected"}
          sublabel={method ? "Receives daily payouts" : "Add a bank account to get paid"}
          onClick={change}
          right={
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold"
              style={
                method
                  ? { backgroundColor: "var(--eb-surface-2)", color: "var(--eb-fg-muted)" }
                  : { backgroundColor: "var(--eb-orange)", color: "white" }
              }
            >
              {method ? "Change" : "Add"}
            </span>
          }
        />
        <SettingsRow
          icon={<Banknote size={14} strokeWidth={1.8} />}
          label="Payout schedule"
          sublabel="Daily — next payout tomorrow 9 AM"
          onClick={() => toast.info("Payouts run every weekday morning")}
        />
      </SectionCard>
      <SectionLabel>Tax</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<FileText size={14} strokeWidth={1.8} />}
          label="W-9 on file"
          sublabel="Submitted Jan 2026"
          right={<Download size={16} style={{ color: "var(--eb-fg-muted)" }} />}
          onClick={() => downloadDoc("W-9")}
        />
        <SettingsRow
          icon={<FileText size={14} strokeWidth={1.8} />}
          label="2025 year-end summary"
          sublabel="$48,210 gross · $42,180 net"
          right={<Download size={16} style={{ color: "var(--eb-fg-muted)" }} />}
          onClick={() => downloadDoc("2025 summary")}
        />
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- HelpAndSupportPage ------- */
export function HelpAndSupportPage() {
  const contact = () => {
    if (typeof window !== "undefined") {
      window.location.href = "mailto:support@ewa.app?subject=Ewà%20Biz%20support";
    }
    toast.success("Opening email", { description: "We reply within 4 hours" });
  };

  return (
    <SubpageShell title="Help & support">
      <SectionLabel>Get help</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<MessageCircle size={14} strokeWidth={1.8} />}
          label="Contact support"
          sublabel="We reply within 4 hours"
          onClick={contact}
        />
        <SettingsRow
          icon={<Flag size={14} strokeWidth={1.8} />}
          label="Report a problem"
          onClick={() => toast.success("Report submitted", { description: "Our team will follow up soon" })}
        />
        <SettingsRow
          icon={<HelpCircle size={14} strokeWidth={1.8} />}
          label="FAQ"
          onClick={() => {
            if (typeof window !== "undefined") window.open("https://ewa.app/help", "_blank");
          }}
        />
      </SectionCard>
      <SectionLabel>Community</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Users size={14} strokeWidth={1.8} />}
          label="Pro community"
          sublabel="Tips & meetups"
          onClick={() => {
            if (typeof window !== "undefined") window.open("https://ewa.app/community", "_blank");
          }}
        />
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- HowItWorksPage ------- */
export function HowItWorksPage() {
  const steps = [
    { n: 1, title: "Set up your storefront", body: "Add services, prices, and a portfolio so clients know what to expect." },
    { n: 2, title: "Set your availability", body: "Choose your weekly hours. We hold a buffer between appointments." },
    { n: 3, title: "Get bookings", body: "Clients see you nearby and book a slot. You confirm or decline within 60 seconds." },
    { n: 4, title: "Get paid", body: "Daily payouts hit your bank the morning after a service." },
  ];
  return (
    <SubpageShell title="How it works">
      <div className="px-5 pt-2">
        {steps.map((s) => (
          <div
            key={s.n}
            className="my-3 rounded-2xl p-4"
            style={{
              backgroundColor: "var(--eb-surface)",
              border: "1px solid var(--eb-hairline)",
            }}
          >
            <div
              className="mb-2 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold"
              style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
            >
              {s.n}
            </div>
            <div className="text-[16px] font-semibold">{s.title}</div>
            <div className="mt-1 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </SubpageShell>
  );
}

/* ------- TermsOfServicePage ------- */
export function TermsOfServicePage() {
  return (
    <SubpageShell title="Terms of service">
      <article className="prose px-5 py-3 text-[14px]" style={{ color: "var(--eb-fg)" }}>
        <p style={{ color: "var(--eb-fg-muted)" }}>Last updated: April 2026</p>
        <h3 className="mt-4 text-[16px] font-semibold">1. About Ewà Biz</h3>
        <p className="mt-1">
          Ewà Biz connects beauty professionals with clients in their area. By using the app you agree
          to these terms.
        </p>
        <h3 className="mt-4 text-[16px] font-semibold">2. Bookings & cancellations</h3>
        <p className="mt-1">
          Confirmed bookings are commitments. Repeated late cancellations may affect your visibility.
        </p>
        <h3 className="mt-4 text-[16px] font-semibold">3. Payouts</h3>
        <p className="mt-1">
          Earnings are paid out daily. Service fees and taxes are deducted automatically.
        </p>
        <h3 className="mt-4 text-[16px] font-semibold">4. Conduct</h3>
        <p className="mt-1">
          We have zero tolerance for harassment. Either party can report incidents in-app and we’ll
          investigate within 24 hours.
        </p>
      </article>
    </SubpageShell>
  );
}

/* ------- BlockListPage ------- */
export function BlockListPage() {
  return (
    <SubpageShell title="Block list">
      <Empty
        title="No one blocked"
        body="Anyone you block won’t be able to book or message you."
      />
    </SubpageShell>
  );
}

/* ------- shared Empty ------- */
function Empty({
  title,
  body,
  cta,
  onCta,
}: {
  title: string;
  body: string;
  cta?: ReactNode;
  onCta?: () => void;
}) {
  return (
    <div className="mx-4 mt-3 rounded-2xl p-6 text-center" style={{ backgroundColor: "var(--eb-surface)", border: "1px solid var(--eb-hairline)" }}>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="mt-1.5 text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
        {body}
      </div>
      {cta ? (
        <button
          type="button"
          onClick={onCta}
          className="mt-4 rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
        >
          {cta}
        </button>
      ) : null}
    </div>
  );
}

/* ------- EditPortfolioPage ------- */
export function EditPortfolioPage() {
  const profile = useProfile();
  const [photos, setPhotos] = useState<ProfilePortfolioItem[]>(
    profile.portfolio.length ? profile.portfolio : DEMO_PORTFOLIO,
  );

  const addPhoto = () => {
    const seed = Math.floor(Math.random() * 1000);
    const next: ProfilePortfolioItem = {
      id: `p${Date.now()}`,
      imageUrl: `https://picsum.photos/seed/ewa-${seed}/600/600`,
      caption: null,
    };
    setPhotos((prev) => [next, ...prev]);
    toast.success("Photo added");
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Photo removed");
  };

  return (
    <SubpageShell title="Portfolio">
      {photos.length === 0 ? (
        <Empty
          title="No photos yet"
          body="Add 3–9 photos that show your best work. Crisp, well-lit shots convert best."
          cta="Add photos"
          onCta={addPhoto}
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 px-2 pt-2">
          {photos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => removePhoto(p.id)}
              aria-label="Remove photo"
              className="group relative aspect-square overflow-hidden rounded-md"
            >
              <img
                src={p.imageUrl}
                alt={p.caption ?? "Portfolio photo"}
                className="h-full w-full object-cover"
              />
              <span
                className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-active:bg-black/40 group-active:opacity-100"
              >
                <Trash2 size={18} color="white" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={addPhoto}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-70"
          style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
        >
          <Camera size={16} /> Add photo
        </button>
      </div>
    </SubpageShell>
  );
}
