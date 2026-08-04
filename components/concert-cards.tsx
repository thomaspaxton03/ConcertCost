import {
  COST_CATEGORIES,
  formatMoney,
  formatNumber,
  withMetrics,
} from "@/lib/concert-math";
import type { Concert } from "@/lib/types";

export function ConcertCards({ concerts }: { concerts: Concert[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {concerts.map((concert) => {
        const m = withMetrics(concert);
        return (
          <article key={concert.id} className="card bg-base-100 shadow-md">
            <div className="card-body gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="card-title text-xl">{concert.concert_name}</h2>
                  <p className="opacity-80">{concert.artist}</p>
                  <p className="text-sm opacity-70">
                    {concert.venue} · {concert.city}, {concert.state}
                  </p>
                  <p className="text-sm opacity-70">
                    {new Date(concert.concert_date + "T00:00:00").toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
                <div className="badge badge-primary badge-lg">
                  Fun {concert.fun_rating}/10
                </div>
              </div>

              <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-200 w-full">
                <div className="stat py-3">
                  <div className="stat-title">Total cost</div>
                  <div className="stat-value text-lg">{formatMoney(m.total)}</div>
                </div>
                <div className="stat py-3">
                  <div className="stat-title">Cost / hour</div>
                  <div className="stat-value text-lg">
                    {m.costPerHour == null ? "—" : formatMoney(m.costPerHour)}
                  </div>
                </div>
                <div className="stat py-3">
                  <div className="stat-title">Fun / $100</div>
                  <div className="stat-value text-lg">
                    {m.funPer100 == null
                      ? "—"
                      : formatNumber(m.funPer100, 2)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Main cost categories</p>
                <div className="flex flex-wrap gap-2">
                  {COST_CATEGORIES.filter((c) => Number(concert[c.key]) > 0).map(
                    (c) => (
                      <span key={c.key} className="badge badge-outline">
                        {c.label}: {formatMoney(Number(concert[c.key]))}
                      </span>
                    ),
                  )}
                  {COST_CATEGORIES.every((c) => Number(concert[c.key]) === 0) && (
                    <span className="text-sm opacity-60">No costs entered</span>
                  )}
                </div>
              </div>

              {concert.notes && (
                <p className="text-sm bg-base-200 rounded-lg p-3">
                  <span className="font-semibold">Notes: </span>
                  {concert.notes}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
