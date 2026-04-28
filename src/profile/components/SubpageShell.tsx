import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface Props {
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

/**
 * Shell for every settings sub-page. Solid surface, hairline divider under
 * the header, scrollable body. Bottom tabs are NOT rendered on subpages.
 */
export function SubpageShell({ title, rightSlot, children }: Props) {
  const router = useRouter();
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--eb-bg)",
        color: "var(--eb-fg)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-2 py-2"
        style={{
          backgroundColor: "var(--eb-bg)",
          borderBottom: "1px solid var(--eb-hairline)",
        }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="flex items-center gap-1 rounded-md px-2 py-2 transition-opacity active:opacity-60"
          style={{ color: "var(--eb-fg)" }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
          <span className="text-[15px]">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold">{title}</h1>
        <div className="min-w-[40px] pr-2 text-right">{rightSlot}</div>
      </header>
      <main className="pb-12">{children}</main>
    </div>
  );
}
