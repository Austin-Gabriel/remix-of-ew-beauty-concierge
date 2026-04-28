import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";

const STEPS = [
  { n: "1", title: "Set up your storefront", body: "Add your services, prices, portfolio photos, and weekly availability. The more complete your profile, the higher you rank." },
  { n: "2", title: "Receive booking requests", body: "Clients book through your profile. You'll get a notification and have 12 hours to confirm or decline." },
  { n: "3", title: "Get paid securely", body: "Clients pay through Ewà Biz when they book. Your earnings are released 24 hours after each Booking is marked complete." },
  { n: "4", title: "Build your reputation", body: "After every Booking, Clients can leave a review. Reply publicly to show how you handle feedback." },
];

const FAQ = [
  { q: "When do I get paid?", a: "24 hours after the Booking is marked complete. Payouts run weekly on Fridays." },
  { q: "What's Ewà Biz's commission?", a: "We take 8% of each Booking, deducted automatically before payout." },
  { q: "Can I cancel a Booking?", a: "Yes, but cancellations within 24 hours of the appointment count toward your reliability score." },
  { q: "What if a Client no-shows?", a: "Mark them as a no-show in the Booking. You'll keep the deposit and we'll handle communication." },
];

export function HowItWorksPage() {
  return (
    <HomeShell>
      <PageHeader title="How Ewà Biz works" back={{ to: "/profile/account-settings" }} />
      <div className="px-5 pt-2" style={{ fontFamily: HOME_SANS, color: "#061C27" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>Built for hair Pros</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.55 }}>
          Ewà Biz handles the booking, payments, and reminders so you can focus on the work.
        </p>

        <div className="mt-6 space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-3 rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#FF823F", color: "#FFFFFF", fontWeight: 700, fontSize: 14 }}>{s.n}</div>
              <div className="min-w-0 flex-1">
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</div>
                <p className="mt-1" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.5 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-8" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>Common questions</h3>
        <div className="mt-3 overflow-hidden rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
          {FAQ.map((f, i) => (
            <details key={i} className="[&:not(:last-child)]:border-b" style={{ borderColor: "rgba(6,28,39,0.06)" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5" style={{ fontSize: 14.5, fontWeight: 500 }}>
                {f.q}
                <span style={{ opacity: 0.4 }}>+</span>
              </summary>
              <p className="px-4 pb-4" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.55 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}
