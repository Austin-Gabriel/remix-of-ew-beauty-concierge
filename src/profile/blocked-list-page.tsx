import { HomeShell, HOME_SANS } from "@/home/home-shell";
import { PageHeader, RowGroup } from "./profile-ui";
import { useProfile } from "./profile-context";
import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BlockedListPage() {
  const { data, patch } = useProfile();
  const { userId } = useAuth();

  const unblock = async (id: string) => {
    // Optimistic local removal
    patch({ blocked: data.blocked.filter((b) => b.id !== id) });
    if (userId) {
      const { error } = await supabase.from("blocked_pairs").delete().eq("id", id).eq("blocker_user_id", userId);
      if (error) toast("Couldn't unblock — try again.");
      else toast("Unblocked.");
    } else {
      toast("Unblocked.");
    }
  };

  return (
    <HomeShell>
      <PageHeader title="Block list" back={{ to: "/profile/settings/privacy" }} />
      <p className="px-5 pt-3 pb-1" style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.5, fontFamily: HOME_SANS }}>
        Clients you've blocked can't message or book you.
      </p>

      {data.blocked.length === 0 ? (
        <div className="mx-4 mt-4 rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(6,28,39,0.08)", fontFamily: HOME_SANS }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <div className="mt-2" style={{ fontSize: 15, fontWeight: 600, color: "#061C27" }}>No one blocked</div>
          <p className="mt-1.5" style={{ fontSize: 13, color: "#061C27", opacity: 0.6, lineHeight: 1.5 }}>
            Block someone from a message thread or their profile to add them here.
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <RowGroup>
            {data.blocked.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3 [&:not(:last-child)]:border-b" style={{ borderColor: "rgba(6,28,39,0.06)", fontFamily: HOME_SANS }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#F1ECE6", color: "#061C27", fontWeight: 700, fontSize: 13 }}>
                  {b.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1" style={{ fontSize: 15, color: "#061C27", fontWeight: 500 }}>{b.name}</div>
                <button type="button" onClick={() => unblock(b.id)} className="rounded-full px-3.5 py-1.5" style={{ backgroundColor: "#FF823F", color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>
                  Unblock
                </button>
              </div>
            ))}
          </RowGroup>
        </div>
      )}
      <div style={{ height: 32 }} />
    </HomeShell>
  );
}
