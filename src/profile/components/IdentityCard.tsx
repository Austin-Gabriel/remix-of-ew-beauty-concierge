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

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "·";
}

export function IdentityCard({
  name,
  role,
  neighborhood,
  avatarUrl,
  rating,
  reviewCount,
}: Props) {
  const subtitle = [role, neighborhood].filter(Boolean).join(" · ");
  const showRating = typeof rating === "number" && (reviewCount ?? 0) > 0;

  return (
    <div className="relative mx-4 mb-2 flex items-center gap-4 px-2 py-3">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
          style={{ border: "1px solid var(--eb-hairline)" }}
        />
      ) : (
        <div
          aria-hidden
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-[24px] font-semibold"
          style={{
            backgroundColor: "var(--eb-surface-2)",
            color: "var(--eb-fg)",
          }}
        >
          {initials(name)}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-[20px] font-semibold leading-tight"
          style={{ color: "var(--eb-fg)" }}
        >
          {name}
        </span>
        {subtitle ? (
          <span
            className="mt-0.5 truncate text-[14px]"
            style={{ color: "var(--eb-fg-muted)" }}
          >
            {subtitle}
          </span>
        ) : null}
        {showRating ? (
          <div className="mt-1 flex items-center gap-1.5">
            <Star size={14} fill="currentColor" style={{ color: "var(--eb-orange)" }} />
            <span
              className="text-[14px] leading-none"
              style={{
                color: "var(--eb-fg)",
                fontFamily: '"Fraunces", Times, serif',
                fontWeight: 500,
              }}
            >
              {rating!.toFixed(1)}
            </span>
            <span className="text-[13px]" style={{ color: "var(--eb-fg-muted)" }}>
              ({reviewCount})
            </span>
          </div>
        ) : null}
      </div>

      <Link
        to="/profile/settings/edit-profile"
        aria-label="Edit profile"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors active:bg-[var(--eb-surface-2)]"
        style={{
          color: "var(--eb-fg)",
          border: "1px solid var(--eb-hairline)",
        }}
      >
        <Pencil size={15} strokeWidth={1.8} />
      </Link>
    </div>
  );
}
