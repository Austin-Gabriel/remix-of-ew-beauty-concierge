import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";

interface Props {
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  /** Fallback path when there's no in-app history to pop. Defaults to /profile. */
  backTo?: string;
}

/**
 * Shell for every settings sub-page. Solid surface, hairline divider under
 * the header, scrollable body. Bottom tabs are NOT rendered on subpages.
 *
 * Back navigation: pops the in-app history when possible, otherwise navigates
 * to the configured fallback (defaults to /profile). This means a user who
 * deep-links to a subpage still gets a working Back button instead of being
 * bounced out of the app.
 */
export function SubpageShell({ title, rightSlot, children, backTo = "/profile" }: Props) {
  const router = useRouter();
  const navigate = useNavigate();

  const goBack = () => {
    // history.length > 1 means we have something to pop within this tab.
    // When the user opened the URL directly, length is 1 (or the prior entry
    // is outside the app) — fall back to the canonical parent route.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: backTo as "/profile" });
    }
  };

  return (
    <div
      data-theme="dark"
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
          onClick={goBack}
          aria-label="Back to Profile"
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
