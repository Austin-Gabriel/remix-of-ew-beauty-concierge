import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "@/calendar/calendar-page";
import { RequireAuth } from "@/auth/require-auth";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Ewà Biz" }] }),
  component: CalendarRoute,
});

function CalendarRoute() {
  return (
    <RequireAuth>
      <CalendarPage />
    </RequireAuth>
  );
}
