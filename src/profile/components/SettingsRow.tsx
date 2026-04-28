import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface SettingsRowProps {
  icon: ReactNode;
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
  return (
    <Comp
      type={asStatic ? undefined : "button"}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 text-left transition-colors active:bg-[var(--eb-surface-2)]"
      style={{
        minHeight: 56,
        color: destructive ? "var(--eb-danger)" : "var(--eb-fg)",
      }}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{
          backgroundColor: "var(--eb-surface-2)",
          color: destructive ? "var(--eb-danger)" : "var(--eb-orange)",
        }}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col py-2">
        <span className="text-[15px] leading-tight">{label}</span>
        {sublabel ? (
          <span
            className="mt-0.5 truncate text-[13px]"
            style={{ color: "var(--eb-fg-muted)" }}
          >
            {sublabel}
          </span>
        ) : null}
      </span>
      {right ? <span className="ml-2 shrink-0">{right}</span> : null}
      {!hideChevron && !right && !destructive ? (
        <ChevronRight size={16} style={{ color: "var(--eb-fg-muted)" }} className="shrink-0" />
      ) : null}
    </Comp>
  );
}
