import { ConcertCards } from "@/components/concert-cards";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function MyConcertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Could not load concerts: {error.message}</span>
      </div>
    );
  }

  const concerts = (data ?? []) as Concert[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Concerts</h1>
        <p className="opacity-70 mt-1">
          Everything you have logged so far — only your shows.
        </p>
      </div>

      {concerts.length === 0 ? (
        <EmptyState message="No concerts logged yet. Add your first concert to start seeing your dashboard." />
      ) : (
        <ConcertCards concerts={concerts} />
      )}
    </div>
  );
}
