import type { ReactNode } from "react";
import { Children } from "react";

interface Props {
  children: ReactNode;
}

/**
 * White card with hairline divider between rows. Navy text is enforced
 * inside child rows (SettingsRow, etc.) — see mem://design/card-surfaces.
 */
export function SectionCard({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <div
      className="mx-4 overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        border: "1px solid rgba(6,28,39,0.10)",
        boxShadow:
          "0 1px 2px rgba(6,28,39,0.06), 0 8px 24px -12px rgba(6,28,39,0.18)",
        color: "#061C27",
      }}
    >
      {items.map((child, i) => (
        <div key={i} className="relative">
          {child}
          {i < items.length - 1 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute right-4 bottom-0 left-4 h-px"
              style={{ backgroundColor: "rgba(6,28,39,0.08)" }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
