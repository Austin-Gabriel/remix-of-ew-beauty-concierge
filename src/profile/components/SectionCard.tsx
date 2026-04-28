import type { ReactNode } from "react";
import { Children } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Card wrapper around a vertical stack of SettingsRow children.
 * Auto-renders a hairline divider between rows, inset 56px on the left
 * to align under the label text (not under the icon).
 */
export function SectionCard({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <div
      className="mx-4 overflow-hidden"
      style={{
        backgroundColor: "var(--eb-surface)",
        borderRadius: 14,
        border: "1px solid var(--eb-hairline)",
      }}
    >
      {items.map((child, i) => (
        <div key={i} className="relative">
          {child}
          {i < items.length - 1 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 left-[56px] h-px"
              style={{ backgroundColor: "var(--eb-hairline)" }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
