import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/auth/require-auth";
import { HomeShell, useHomeTheme } from "@/home/home-shell";
import { PageHeader, RowGroup, SectionLabel, Row, Switch } from "@/profile/profile-ui";
import { useProfile, type NotificationPrefs } from "@/profile/profile-context";

export const Route = createFileRoute("/profile/settings/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ewà Biz" }] }),
  component: () => (
    <RequireAuth>
      <NotificationsPage />
    </RequireAuth>
  ),
});

function NotificationsPage() {
  const { data, patchNotifications } = useProfile();
  const n = data.notifications;
  const set = (k: keyof NotificationPrefs, v: boolean) => patchNotifications({ [k]: v } as Partial<NotificationPrefs>);

  return (
    <HomeShell>
      <PageHeader title="Notifications" back={{ to: "/profile/account-settings" }} />

      <SectionLabel>Bookings</SectionLabel>
      <RowGroup>
        <Row label="New booking requests" sub="When a Client requests to book you" right={<Switch checked={n.newRequest} onChange={(v) => set("newRequest", v)} />} noChevron />
        <Row label="Booking confirmed" right={<Switch checked={n.bookingConfirmed} onChange={(v) => set("bookingConfirmed", v)} />} noChevron />
        <Row label="Booking reminders" sub="1 hour before each Booking" right={<Switch checked={n.bookingReminders} onChange={(v) => set("bookingReminders", v)} />} noChevron />
        <Row label="Booking cancelled" right={<Switch checked={n.bookingCancelled} onChange={(v) => set("bookingCancelled", v)} />} noChevron />
        <Row label="Client reviews" right={<Switch checked={n.clientReviews} onChange={(v) => set("clientReviews", v)} />} noChevron />
      </RowGroup>

      <SectionLabel>Messages</SectionLabel>
      <RowGroup>
        <Row label="New messages from Clients" right={<Switch checked={n.newMessages} onChange={(v) => set("newMessages", v)} />} noChevron />
        <Row label="Mentioned in a thread" right={<Switch checked={n.mentions} onChange={(v) => set("mentions", v)} />} noChevron />
      </RowGroup>

      <SectionLabel>Payments & account</SectionLabel>
      <RowGroup>
        <Row label="Payouts processed" right={<Switch checked={n.payoutsProcessed} onChange={(v) => set("payoutsProcessed", v)} />} noChevron />
        <Row label="Payout failed" right={<Switch checked={n.payoutFailed} onChange={(v) => set("payoutFailed", v)} />} noChevron />
        <Row label="Account security alerts" right={<RequiredChip />} noChevron />
      </RowGroup>

      <SectionLabel>Marketing</SectionLabel>
      <RowGroup>
        <Row label="Tips for growing your business" right={<Switch checked={n.marketingTips} onChange={(v) => set("marketingTips", v)} />} noChevron />
        <Row label="New features" right={<Switch checked={n.marketingFeatures} onChange={(v) => set("marketingFeatures", v)} />} noChevron />
      </RowGroup>

      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function RequiredChip() {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#061C27", opacity: 0.55, textTransform: "uppercase" }}>
      Required
    </span>
  );
}
