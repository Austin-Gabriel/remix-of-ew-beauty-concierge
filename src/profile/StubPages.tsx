import type { ReactNode } from "react";
import { SubpageShell } from "@/profile/components/SubpageShell";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";
import { useProfile } from "@/profile/hooks/useProfile";
import { Star, Calendar, CreditCard, Link2, HelpCircle, FileText } from "lucide-react";

/* ------- ServicesStubPage ------- */
export function ServicesStubPage() {
  const profile = useProfile();
  return (
    <SubpageShell title="Services & pricing">
      <SectionLabel>Active</SectionLabel>
      {profile.services.length === 0 ? (
        <Empty
          title="No services yet"
          body="Add the services you offer with prices and durations so clients can book."
          cta="Add a service"
        />
      ) : (
        <SectionCard>
          {profile.services.map((s) => (
            <SettingsRow
              key={s.id}
              icon={<span className="text-[14px]">✂︎</span>}
              label={s.name}
              sublabel={`${s.durationMinutes} min`}
              right={<span className="text-[15px] font-medium">${s.priceUsd}</span>}
            />
          ))}
        </SectionCard>
      )}
    </SubpageShell>
  );
}

/* ------- ReviewsStubPage ------- */
export function ReviewsStubPage() {
  const profile = useProfile();
  return (
    <SubpageShell title="Reviews">
      {profile.recentReviews.length === 0 ? (
        <Empty
          title="No reviews yet"
          body="Reviews appear here after a completed appointment."
          cta="Share your profile"
        />
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 px-5 py-6">
            <Star size={20} fill="currentColor" style={{ color: "var(--eb-orange)" }} />
            <span
              style={{
                fontFamily: '"Fraunces", Times, serif',
                fontSize: 36,
                fontWeight: 500,
                color: "var(--eb-fg)",
              }}
            >
              {profile.rating?.toFixed(1) ?? "—"}
            </span>
            <span className="ml-1 text-[14px]" style={{ color: "var(--eb-fg-muted)" }}>
              ({profile.reviewCount})
            </span>
          </div>
          <SectionCard>
            {profile.recentReviews.map((r) => (
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
        </>
      )}
    </SubpageShell>
  );
}

/* ------- AvailabilityStubPage ------- */
export function AvailabilityStubPage() {
  const profile = useProfile();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = profile.availability.summary ?? "9:00 AM – 7:00 PM";
  return (
    <SubpageShell title="Availability">
      <SectionLabel>Weekly schedule</SectionLabel>
      <SectionCard>
        {days.map((d, i) => (
          <SettingsRow
            key={d}
            icon={
              <span className="text-[11px] font-semibold" style={{ color: "var(--eb-fg)" }}>
                {d.slice(0, 1)}
              </span>
            }
            label={d}
            sublabel={i === 6 ? "Closed" : hours}
            hideChevron
            asStatic
          />
        ))}
      </SectionCard>
      <SectionLabel>Buffer between appointments</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Calendar size={14} strokeWidth={1.8} />}
          label="20 minutes"
          hideChevron
          asStatic
        />
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- SocialsStubPage ------- */
export function SocialsStubPage() {
  return (
    <SubpageShell title="Connect socials">
      <SectionLabel>Platforms</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Link2 size={14} strokeWidth={1.8} />}
          label="Instagram"
          sublabel="Show your latest 6 posts on your profile"
          right={<ConnectPill />}
        />
        <SettingsRow
          icon={<Link2 size={14} strokeWidth={1.8} />}
          label="TikTok"
          sublabel="Show your top videos"
          right={<ConnectPill />}
        />
        <SettingsRow
          icon={<Link2 size={14} strokeWidth={1.8} />}
          label="YouTube"
          sublabel="Embed a featured video"
          right={<ConnectPill />}
        />
      </SectionCard>
    </SubpageShell>
  );
}

function ConnectPill() {
  return (
    <span
      className="rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
    >
      Connect
    </span>
  );
}

/* ------- PayoutsAndBankingPage ------- */
export function PayoutsAndBankingPage() {
  const profile = useProfile();
  const connected = !!profile.payout.method;
  return (
    <SubpageShell title="Payouts & banking">
      <SectionLabel>Method</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<CreditCard size={14} strokeWidth={1.8} />}
          label={connected ? profile.payout.method! : "No method connected"}
          sublabel={connected ? "Receives daily payouts" : "Add a bank account to get paid"}
          right={
            !connected ? (
              <span
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ backgroundColor: "var(--eb-orange)", color: "white" }}
              >
                Add
              </span>
            ) : undefined
          }
        />
      </SectionCard>
      <SectionLabel>Tax</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<FileText size={14} strokeWidth={1.8} />}
          label="Tax documents"
          sublabel="W-9, year-end summaries"
        />
      </SectionCard>
    </SubpageShell>
  );
}

/* ------- HelpAndSupportPage ------- */
export function HelpAndSupportPage() {
  return (
    <SubpageShell title="Help & support">
      <SectionLabel>Get help</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<HelpCircle size={14} strokeWidth={1.8} />}
          label="Contact support"
          sublabel="We reply within 4 hours"
        />
        <SettingsRow icon={<HelpCircle size={14} strokeWidth={1.8} />} label="Report a problem" />
        <SettingsRow icon={<HelpCircle size={14} strokeWidth={1.8} />} label="FAQ" />
      </SectionCard>
      <SectionLabel>Community</SectionLabel>
      <SectionCard>
        <SettingsRow icon={<HelpCircle size={14} strokeWidth={1.8} />} label="Pro community" sublabel="Tips & meetups" />
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
function Empty({ title, body, cta }: { title: string; body: string; cta?: ReactNode }) {
  return (
    <div className="mx-4 mt-3 rounded-2xl p-6 text-center" style={{ backgroundColor: "var(--eb-surface)", border: "1px solid var(--eb-hairline)" }}>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="mt-1.5 text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
        {body}
      </div>
      {cta ? (
        <button
          type="button"
          className="mt-4 rounded-full px-4 py-2 text-[13px] font-semibold"
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
  return (
    <SubpageShell title="Portfolio">
      {profile.portfolio.length === 0 ? (
        <Empty
          title="No photos yet"
          body="Add 3–9 photos that show your best work. Crisp, well-lit shots convert best."
          cta="Add photos"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 px-2 pt-2">
          {profile.portfolio.map((p) => (
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
    </SubpageShell>
  );
}
