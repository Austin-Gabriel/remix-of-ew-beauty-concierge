interface Props {
  children: string;
}

export function SectionLabel({ children }: Props) {
  return (
    <div
      className="px-6 pt-6 pb-2 text-[11px] font-medium uppercase"
      style={{ color: "var(--eb-fg-muted)", letterSpacing: "0.06em" }}
    >
      {children}
    </div>
  );
}
