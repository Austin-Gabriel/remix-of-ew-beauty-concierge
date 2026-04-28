import { Pencil, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  name: string;
  role?: string;
  neighborhood?: string;
  avatarUrl?: string | null;
  rating?: number | null;
  reviewCount?: number;
}

const NAVY = "#061C27";
const NAVY_MUTED = "rgba(6,28,39,0.55)";
const HAIRLINE = "rgba(6,28,39,0.10)";
const ORANGE = "#FF823F";
const ORANGE_SOFT = "rgba(255,130,63,0.14)";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "·"
  );
}

/**
 * White card on cream/midnight bg. Navy text. Per mem://design/card-surfaces:
 * cards are pure white in BOTH light and dark mode with navy text inside.
 */
export function IdentityCard({
  name,
  role,
  neighborhood,
  avatarUrl,
  rating,
  reviewCount,
}: Props) {
  const subtitle = [role, neighborhood].filter(Boolean).join(" · ");
  const hasReviews = (reviewCount ?? 0) > 0;

  return (
    <div
      className="relative mx-4 mb-2 flex items-center gap-4 px-5 py-5"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        border: `1px solid ${HAIRLINE}`,
        boxShadow:
          "0 1px 2px rgba(6,28,39,0.06), 0 8px 24px -12px rgba(6,28,39,0.18)",
        color: NAVY,
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-[88px] w-[88px] shrink-0 rounded-full object-cover"
          style={{ border: `1px solid ${HAIRLINE}` }}
        />
      ) : (
        <div
          aria-hidden
          className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full text-[30px] font-bold"
          style={{
            backgroundColor: ORANGE_SOFT,
            color: ORANGE,
            letterSpacing: "0.02em",
          }}
        >
          {initials(name)}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-[22px] font-bold leading-tight"
          style={{ color: NAVY, letterSpacing: "-0.01em" }}
        >
          {name}
        </span>
        {subtitle ? (
          <span
            className="mt-1 truncate text-[14px]"
            style={{ color: NAVY_MUTED }}
          >
            {subtitle}
          </span>
        ) : null}
        <div className="mt-2 flex items-center gap-1.5">
          <Star size={15} strokeWidth={2} fill={ORANGE} style={{ color: ORANGE }} />
          {hasReviews ? (
            <>
              <span
                className="text-[15px] font-bold leading-none"
                style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}
              >
                {rating!.toFixed(2)}
              </span>
              <span
                className="text-[14px]"
                style={{ color: NAVY_MUTED, fontVariantNumeric: "tabular-nums" }}
              >
                ({reviewCount})
              </span>
            </>
          ) : (
            <span className="text-[14px]" style={{ color: NAVY_MUTED }}>
              No reviews yet
            </span>
          )}
        </div>
      </div>

      <Link
        to="/profile/settings/edit-profile"
        aria-label="Edit profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:bg-[rgba(6,28,39,0.04)]"
        style={{
          color: NAVY,
          border: `1px solid ${HAIRLINE}`,
        }}
      >
        <Pencil size={16} strokeWidth={2} />
      </Link>
    </div>
  );
}
