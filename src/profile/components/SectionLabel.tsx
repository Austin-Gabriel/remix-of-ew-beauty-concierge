interface Props {
  children: string;
}

/**
 * Eyebrow label above each card group. Matches the CardEyebrow style used
 * in Earnings / Bookings — navy at 0.55 opacity, 11px uppercase, 0.06em.
 * The color uses currentColor so that on a midnight page (dark mode) the
 * eyebrow inherits the cream chrome color instead of dropping to navy.
 */
export function SectionLabel({ children }: Props) {
  return (
    <div
      className="px-6 pt-6 pb-2 text-[11px] font-semibold uppercase"
      style={{
        opacity: 0.55,
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </div>
  );
}
