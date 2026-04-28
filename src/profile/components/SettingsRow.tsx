import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface SettingsRowProps {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  /** Override right-side content (Switch, badge, custom text). */
  right?: ReactNode;
  hideChevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
  /** Treat as static row (no press effect). */
  asStatic?: boolean;
}

const NAVY = "#061C27";
const NAVY_MUTED = "rgba(6,28,39,0.55)";
const DANGER = "#B91C1C";
const PRESS = "rgba(6,28,39,0.04)";

/**
 * Row inside a white card. Navy text + muted navy icon stroke.
 * No more peach icon chip — orange is reserved for the one primary action
 * per screen (mem://design/orange-discipline).
 */
export function SettingsRow({
  icon,
  label,
  sublabel,
  right,
  hideChevron,
  onClick,
  destructive,
  asStatic,
}: SettingsRowProps) {
  const Comp = asStatic ? "div" : "button";
  const fg = destructive ? DANGER : NAVY;
  return (
    <Comp
      type={asStatic ? undefined : "button"}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 text-left transition-colors"
      style={{
        minHeight: 56,
        color: fg,
        ...(asStatic ? {} : { ["--press-bg" as never]: PRESS }),
      }}
      onMouseDown={asStatic ? undefined : (e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = PRESS;
      }}
      onMouseUp={asStatic ? undefined : (e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
      onMouseLeave={asStatic ? undefined : (e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
    >
      {icon ? (
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center"
          style={{ color: destructive ? DANGER : NAVY_MUTED }}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col py-2.5">
        <span className="text-[15px] leading-tight font-medium" style={{ color: fg }}>
          {label}
        </span>
        {sublabel ? (
          <span
            className="mt-0.5 truncate text-[13px]"
            style={{ color: destructive ? DANGER : NAVY_MUTED, opacity: destructive ? 0.85 : 1 }}
          >
            {sublabel}
          </span>
        ) : null}
      </span>
      {right ? <span className="ml-2 shrink-0">{right}</span> : null}
      {!hideChevron && !right && !destructive ? (
        <ChevronRight size={16} style={{ color: NAVY_MUTED }} className="shrink-0" />
      ) : null}
    </Comp>
  );
}
