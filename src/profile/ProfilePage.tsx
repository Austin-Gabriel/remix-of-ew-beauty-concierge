import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ProfileHeader } from "@/profile/components/ProfileHeader";
import { IdentityCard } from "@/profile/components/IdentityCard";
import { SectionLabel } from "@/profile/components/SectionLabel";
import { SectionCard } from "@/profile/components/SectionCard";
import { SettingsRow } from "@/profile/components/SettingsRow";
import { CustomerViewModal } from "@/profile/components/CustomerViewModal";
import { useProfile } from "@/profile/hooks/useProfile";
import { useT } from "@/profile/i18n/SettingsI18nProvider";
import { BottomTabs, type TabKey } from "@/home/bottom-tabs";
import { HomeShell } from "@/home/home-shell";
import {
  Scissors,
  Image as ImageIcon,
  Star,
  Eye,
  Calendar,
  CreditCard,
  Link2,
} from "lucide-react";

export function ProfilePage() {
  const profile = useProfile();
  const { t } = useT();
  const [customerViewOpen, setCustomerViewOpen] = useState(false);
  const navigate = useNavigate();

  const minPrice = profile.services.length
    ? Math.min(...profile.services.map((s) => s.priceUsd))
    : null;

  const servicesSub =
    profile.services.length === 0
      ? t("profilePage.servicesEmpty", { defaultValue: "Add services to get bookings" })
      : t("profilePage.servicesSummary", {
          defaultValue: `${profile.services.length} services · from $${minPrice}`,
          count: profile.services.length,
          min: minPrice ?? 0,
        });

  const portfolioSub =
    profile.portfolio.length === 0
      ? t("profilePage.portfolioEmpty", { defaultValue: "Add photos to start" })
      : t("profilePage.portfolioSummary", {
          defaultValue: `${profile.portfolio.length} photos`,
          count: profile.portfolio.length,
        });

  const reviewsSub =
    !profile.rating || profile.reviewCount === 0
      ? t("profilePage.reviewsEmpty", { defaultValue: "No reviews yet" })
      : t("profilePage.reviewsSummary", {
          defaultValue: `${profile.rating.toFixed(1)} · ${profile.reviewCount} reviews`,
          rating: profile.rating.toFixed(1),
          count: profile.reviewCount,
        });

  const socialsSub =
    profile.socials.length === 0
      ? t("profilePage.socialsEmpty", { defaultValue: "Share your work" })
      : profile.socials.map((s) => s.handle).join(" · ");

  return (
    <HomeShell noTabBarSpacing>
      <div
        className="min-h-screen w-full"
        style={{
          backgroundColor: "var(--eb-bg)",
          color: "var(--eb-fg)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 92px)",
        }}
      >
      <ProfileHeader hasUnread={profile.hasUnreadNotifications} />

      <IdentityCard
        name={profile.name}
        role={profile.role}
        neighborhood={profile.neighborhood}
        avatarUrl={profile.avatarUrl}
        rating={profile.rating}
        reviewCount={profile.reviewCount}
      />

      <SectionLabel>{t("profilePage.storefront", { defaultValue: "Storefront" })}</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Scissors size={17} strokeWidth={2} />}
          label={t("profilePage.services", { defaultValue: "Services & pricing" })}
          sublabel={servicesSub}
          onClick={() => navigate({ to: "/profile/services" })}
        />
        <SettingsRow
          icon={<ImageIcon size={17} strokeWidth={2} />}
          label={t("profilePage.portfolio", { defaultValue: "Portfolio" })}
          sublabel={portfolioSub}
          onClick={() => navigate({ to: "/profile/settings/edit-portfolio" })}
        />
        <SettingsRow
          icon={<Star size={17} strokeWidth={2} fill="currentColor" />}
          label={t("profilePage.reviews", { defaultValue: "Reviews" })}
          sublabel={reviewsSub}
          onClick={() => navigate({ to: "/profile/reviews" })}
        />
        <SettingsRow
          icon={<Eye size={17} strokeWidth={2} />}
          label={t("profilePage.customerView", { defaultValue: "Customer view" })}
          sublabel={t("profilePage.customerViewSub", { defaultValue: "How clients see you" })}
          onClick={() => setCustomerViewOpen(true)}
        />
      </SectionCard>

      <SectionLabel>{t("profilePage.howYouWork", { defaultValue: "How you work" })}</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Calendar size={17} strokeWidth={2} />}
          label={t("profilePage.availability", { defaultValue: "Availability" })}
          sublabel={
            profile.availability.summary ??
            t("profilePage.availabilityEmpty", { defaultValue: "Set your weekly schedule" })
          }
          onClick={() => navigate({ to: "/profile/availability" })}
        />
        <SettingsRow
          icon={<CreditCard size={17} strokeWidth={2} />}
          label={t("profilePage.payouts", { defaultValue: "Payouts" })}
          sublabel={
            profile.payout.method ??
            t("profilePage.payoutsEmpty", { defaultValue: "Add bank account" })
          }
          onClick={() => navigate({ to: "/profile/payouts-and-banking" })}
        />
      </SectionCard>

      <SectionLabel>{t("profilePage.social", { defaultValue: "Social" })}</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={<Link2 size={17} strokeWidth={2} />}
          label={t("profilePage.socialsLabel", { defaultValue: "Connect socials" })}
          sublabel={socialsSub}
          right={
            profile.socials.length === 0 ? (
              <span
                className="text-[15px] font-semibold"
                style={{ color: "var(--eb-orange)" }}
              >
                {t("profilePage.connect", { defaultValue: "Connect" })}
              </span>
            ) : undefined
          }
          onClick={() => navigate({ to: "/profile/socials" })}
        />
      </SectionCard>

      <CustomerViewModal
        open={customerViewOpen}
        onOpenChange={setCustomerViewOpen}
        profile={profile}
      />

      <ProfileBottomTabs />
    </div>
    </HomeShell>
  );
}

function ProfileBottomTabs() {
  const navigate = useNavigate();
  return (
    <BottomTabs
      active={"profile" as TabKey}
      onSelect={(k) => {
        if (k === "home") navigate({ to: "/home" });
        else if (k === "bookings") navigate({ to: "/bookings", search: { tab: "upcoming" } });
        else if (k === "calendar") navigate({ to: "/calendar" });
        else if (k === "earnings") navigate({ to: "/earnings" });
      }}
    />
  );
}
