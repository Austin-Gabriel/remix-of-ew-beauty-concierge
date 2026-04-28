import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";

export function TermsPage() {
  return (
    <HomeShell>
      <PageHeader title="Terms of service" back={{ to: "/profile/account-settings" }} />
      <article className="px-5 pt-2" style={{ fontFamily: HOME_SANS, color: "#061C27" }}>
        <p style={{ fontSize: 12, opacity: 0.55 }}>Last updated: April 1, 2026</p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>1. Your account</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          You're responsible for the activity on your account, including the services you list, the bookings you accept, and the way you communicate with Clients. Keep your login secure.
        </p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>2. Bookings & payments</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          Ewà Biz collects payment from Clients at the time of booking and releases your share, less commission, 24 hours after the Booking is marked complete. You agree to honor confirmed Bookings or accept the cancellation consequences described in our Pro policy.
        </p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>3. Conduct</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          Treat every Client with respect. Discrimination, harassment, or unsafe practices are grounds for immediate suspension. Report concerns through Support.
        </p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>4. Content & portfolio</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          You retain ownership of the photos and content you upload. You grant Ewà Biz a license to display them in connection with your profile and our marketing.
        </p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>5. Termination</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          You can deactivate your account at any time from Settings. We may suspend accounts that violate these terms or applicable law.
        </p>

        <h2 className="mt-5" style={{ fontSize: 17, fontWeight: 700 }}>6. Liability</h2>
        <p className="mt-2" style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
          Ewà Biz is a marketplace. We don't perform the services ourselves and aren't liable for the outcome of individual Bookings. Our total liability is limited to fees paid in the prior 12 months.
        </p>

        <p className="mt-6" style={{ fontSize: 12.5, opacity: 0.55, lineHeight: 1.6 }}>
          This summary is provided for convenience. The full legal terms govern in case of conflict. Contact support@ewabiz.com with questions.
        </p>
      </article>
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}
