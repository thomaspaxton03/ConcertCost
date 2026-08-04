import { DashboardView } from "@/components/dashboard-view";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function DashboardPage() {
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

  return <DashboardView concerts={(data ?? []) as Concert[]} />;
}
