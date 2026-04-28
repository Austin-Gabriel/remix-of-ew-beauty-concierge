import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { HomeShell, useHomeTheme, HOME_SANS } from "@/home/home-shell";
import { BottomTabs } from "@/home/bottom-tabs";
import { useProfile, monogramOf } from "./profile-context";
import { PageHeader, RowGroup, SectionLabel, Row, SettingsPage } from "./profile-ui";

/**
 * /profile — Pro identity hub. List-row settings-style page (Apple Settings
 * vibe). Identity card on top, then grouped sections of tappable rows.
 */
export function ProfilePage() {
  const { data } = useProfile();
  const navigate = useNavigate();
  const [customerViewOpen, setCustomerViewOpen] = useState(false);

  const minPriceLabel = useMemo(() => {
    if (data.serviceMenu.length === 0) return null;
    const min = Math.min(...data.serviceMenu.map((s) => s.priceUsd));
    return `from $${min}`;
  }, [data.serviceMenu]);

  const socialsConnected = [
    data.instagram ? "Instagram" : null,
    data.tiktok ? "TikTok" : null,
  ].filter(Boolean) as string[];

  return (
    <HomeShell>
      <ProfileHeader />
      <div className="pb-4">
        <IdentityCard />

        <SectionLabel>Storefront</SectionLabel>
        <RowGroup>
          <Row
            label="Services & pricing"
            sub={
              data.services.length > 0
                ? `${data.services.length} services · ${minPriceLabel}`
                : "Add Services to get bookings"
            }
            to="/profile/services"
          />
          <Row
            label="Portfolio"
            sub={data.portfolio.length > 0 ? `${data.portfolio.length} photos` : "Add photos to start"}
            to="/profile/settings/edit-portfolio"
          />
          <Row
            label="Reviews"
            sub={
              data.reviewCount && data.reviewCount > 0
                ? `${data.rating?.toFixed(1)} · ${data.reviewCount} reviews`
                : "No reviews yet"
            }
            to="/profile/reviews"
          />
          <Row
            label="Customer view"
            sub="How Clients see you"
            onClick={() => setCustomerViewOpen(true)}
            right={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#061C27", opacity: 0.35 }}>
                <path d="M7 17L17 7M17 7H9M17 7v8" />
              </svg>
            }
            noChevron
          />
        </RowGroup>

        <SectionLabel>How you work</SectionLabel>
        <RowGroup>
          <Row
            label="Availability"
            sub={data.availabilitySummary ?? "Set your weekly schedule"}
            to="/profile/availability"
          />
          <Row
            label="Payouts"
            sub={data.bankName && data.bankLast4 ? `${data.bankName} ··${data.bankLast4}` : "Add bank account"}
            to="/profile/payouts-and-banking"
          />
        </RowGroup>

        <SectionLabel>Social</SectionLabel>
        <RowGroup>
          <Row
            label="Connect socials"
            sub={socialsConnected.length > 0 ? socialsConnected.join(" · ") : "Instagram · TikTok"}
            to="/profile/socials"
            right={
              socialsConnected.length === 0 ? (
                <span style={{ color: "#FF823F", fontWeight: 600, fontSize: 14 }}>Connect</span>
              ) : undefined
            }
            noChevron={socialsConnected.length === 0}
          />
        </RowGroup>
      </div>

      <BottomTabs
        active="profile"
        onSelect={(k) => {
          if (k === "home") navigate({ to: "/home" });
          if (k === "bookings") navigate({ to: "/bookings", search: { tab: "upcoming" } });
          if (k === "calendar") navigate({ to: "/calendar" });
          if (k === "earnings") navigate({ to: "/earnings" });
        }}
      />

      {customerViewOpen ? <CustomerViewSheet onClose={() => setCustomerViewOpen(false)} /> : null}
    </HomeShell>
  );
}

function ProfileHeader() {
  const { text } = useHomeTheme();
  // Mock: surface "1" when there are unread notifications.
  const unread = 0;
  return (
    <div className="flex items-center justify-between px-4 pt-2 pb-1" style={{ fontFamily: HOME_SANS }}>
      <h1 style={{ color: text, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Profile</h1>
      <div className="flex items-center gap-1">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ color: text }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" />
            <path d="M10 21a2 2 0 004 0" />
          </svg>
          {unread > 0 ? (
            <span
              className="absolute"
              style={{
                top: 8,
                right: 8,
                width: 9,
                height: 9,
                borderRadius: 9999,
                backgroundColor: "#FF823F",
                boxShadow: `0 0 0 2px var(--background, #061C27)`,
              }}
            />
          ) : null}
        </Link>
        <Link
          to="/profile/account-settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ color: text }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function IdentityCard() {
  const { data } = useProfile();
  const initials = monogramOf(data.fullName);
  return (
    <div className="mx-4 mt-2 mb-2 flex items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
      {data.avatarDataUrl ? (
        <img src={data.avatarDataUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F0EBD8", color: "#FF823F", fontSize: 22, fontWeight: 600, letterSpacing: "0.02em" }}
        >
          {initials}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span style={{ color: "#061C27", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {data.fullName ?? "Your studio"}
        </span>
        <span style={{ color: "#061C27", opacity: 0.6, fontSize: 13, marginTop: 2 }}>
          Stylist · {data.neighborhood ?? "Add neighborhood"}
        </span>
        <div className="mt-1.5 flex items-center gap-1" style={{ color: "#061C27", fontSize: 13 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF823F" stroke="#FF823F" strokeWidth="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span style={{ fontWeight: 600 }}>{data.rating?.toFixed(1) ?? "—"}</span>
          <span style={{ opacity: 0.55 }}>
            {data.reviewCount ? `(${data.reviewCount} reviews)` : "(no reviews yet)"}
          </span>
        </div>
      </div>
      <Link
        to="/profile/settings/edit-profile"
        aria-label="Edit profile"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity active:opacity-60"
        style={{ backgroundColor: "rgba(6,28,39,0.05)", color: "#061C27" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </Link>
    </div>
  );
}

/** Lightweight sheet showing the Pro how Clients see them. Inline, not a route. */
function CustomerViewSheet({ onClose }: { onClose: () => void }) {
  const { data } = useProfile();
  const initials = monogramOf(data.fullName);
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl p-5"
        style={{ backgroundColor: "#FFFFFF", color: "#061C27", fontFamily: HOME_SANS, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.18)" }} />
        <div className="mb-1 flex items-center justify-between">
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55 }}>
            Customer view
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full" style={{ backgroundColor: "rgba(6,28,39,0.05)" }}>
            ✕
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F0EBD8", color: "#FF823F", fontSize: 18, fontWeight: 600 }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{data.fullName}</div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>Stylist · {data.neighborhood}</div>
          </div>
        </div>

        {data.tagline ? (
          <p className="mt-4" style={{ fontSize: 14, lineHeight: 1.5 }}>
            {data.tagline}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(data.portfolio.length > 0 ? data.portfolio : new Array(6).fill(null)).slice(0, 6).map((src, i) =>
            src ? (
              <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
            ) : (
              <div key={i} className="aspect-square w-full rounded-lg" style={{ backgroundColor: "rgba(6,28,39,0.06)" }} />
            ),
          )}
        </div>

        <div className="mt-4">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55, marginBottom: 6 }}>
            Services
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.services.map((s) => (
              <span key={s} className="rounded-full px-3 py-1" style={{ backgroundColor: "rgba(6,28,39,0.05)", fontSize: 12.5 }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl font-semibold"
          style={{ backgroundColor: "#FF823F", color: "#FFFFFF" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ---------- Re-export the shared SettingsPage so route stubs can use one import ---------- */
export { SettingsPage };
