import { CompareConcertsView } from "@/components/compare-concerts-view";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function ComparePage() {
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

  return <CompareConcertsView concerts={(data ?? []) as Concert[]} />;
}
