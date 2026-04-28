import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useHomeTheme, HOME_SANS } from "@/home/home-shell";

/**
 * Shared list-row primitives for the Profile + Settings surfaces.
 * Apple-Settings vibe: white card, grouped rows, hairline dividers, chevrons.
 *
 * Cards are pure white in both themes (per mem://design/card-surfaces).
 */

export function PageHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: { to: string; label?: string };
  right?: ReactNode;
}) {
  const { text } = useHomeTheme();
  return (
    <div className="relative flex h-12 items-center justify-center px-4" style={{ fontFamily: HOME_SANS }}>
      {back ? (
        <Link
          to={back.to}
          aria-label={back.label ?? "Back"}
          className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ color: text }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      ) : null}
      <h1 style={{ color: text, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h1>
      {right ? <div className="absolute right-3 flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { text } = useHomeTheme();
  return (
    <div
      className="px-5 pt-6 pb-2"
      style={{
        color: text,
        opacity: 0.55,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: HOME_SANS,
      }}
    >
      {children}
    </div>
  );
}

/** Group of rows rendered as one white card with internal hairline dividers. */
export function RowGroup({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 overflow-hidden rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)" }}>
      {children}
    </div>
  );
}

interface RowProps {
  label: string;
  sub?: ReactNode;
  to?: string;
  onClick?: () => void;
  right?: ReactNode;
  /** Hide the chevron (e.g. read-only rows or rows with switches). */
  noChevron?: boolean;
  /** Tone the label red — for destructive actions. */
  destructive?: boolean;
  /** Disabled / coming soon. */
  disabled?: boolean;
  leading?: ReactNode;
}

export function Row({ label, sub, to, onClick, right, noChevron, destructive, disabled, leading }: RowProps) {
  const labelColor = destructive ? "#DC2626" : "#061C27";
  const inner = (
    <div className="flex w-full items-center gap-3 px-4 py-3.5" style={{ fontFamily: HOME_SANS }}>
      {leading ? <div className="flex h-8 w-8 items-center justify-center">{leading}</div> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <span style={{ color: labelColor, fontSize: 15, fontWeight: 500 }}>{label}</span>
        {sub ? (
          <span style={{ color: "#061C27", opacity: 0.55, fontSize: 12.5, marginTop: 2 }}>{sub}</span>
        ) : null}
      </div>
      {right ? <div className="flex items-center" style={{ color: "#061C27" }}>{right}</div> : null}
      {!noChevron && (to || onClick) ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#061C27", opacity: 0.35 }}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      ) : null}
    </div>
  );

  const sharedClass = "block w-full text-left transition-colors active:bg-black/[0.04] disabled:opacity-50 [&:not(:last-child)]:border-b";
  const sharedStyle = { borderColor: "rgba(6,28,39,0.06)" } as const;

  if (disabled) {
    return (
      <div className={sharedClass} style={{ ...sharedStyle, opacity: 0.5 }}>
        {inner}
      </div>
    );
  }
  if (to) {
    return (
      <Link to={to} className={sharedClass} style={sharedStyle}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClass} style={sharedStyle}>
        {inner}
      </button>
    );
  }
  return (
    <div className={sharedClass} style={sharedStyle}>
      {inner}
    </div>
  );
}

/** iOS-style switch using design tokens. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-7 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
      style={{
        backgroundColor: checked ? "#FF823F" : "rgba(6,28,39,0.18)",
      }}
    >
      <span
        className="inline-block h-6 w-6 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

/** Scrollable safe-area-aware page wrapper used by every Settings sub-page. */
export function SettingsPage({ children }: { children: ReactNode }) {
  const { bg, text } = useHomeTheme();
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: HOME_SANS,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
      }}
    >
      {children}
    </div>
  );
}
