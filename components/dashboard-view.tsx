"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnnualBudgetSection } from "@/components/annual-budget-section";
import { EmptyState } from "@/components/empty-state";
import {
  COST_CATEGORIES,
  formatMoney,
  formatNumber,
  withMetrics,
} from "@/lib/concert-math";
import type { Concert } from "@/lib/types";

const PIE_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ffa07a",
];

export function DashboardView({
  concerts,
  userId,
}: {
  concerts: Concert[];
  userId: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="opacity-70 mt-1">
          A quick look at your nights out and what they cost.
        </p>
      </div>

      <AnnualBudgetSection userId={userId} concerts={concerts} />

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <DashboardStatsAndCharts concerts={concerts} />
      )}
    </div>
  );
}

function DashboardStatsAndCharts({ concerts }: { concerts: Concert[] }) {
  const enriched = concerts.map(withMetrics);
  const totalSpent = enriched.reduce((sum, c) => sum + c.total, 0);
  const avgCost = totalSpent / enriched.length;
  const avgFun =
    enriched.reduce((sum, c) => sum + c.fun_rating, 0) / enriched.length;
  const hourValues = enriched
    .map((c) => c.costPerHour)
    .filter((v): v is number => v != null);
  const avgCostPerHour =
    hourValues.length > 0
      ? hourValues.reduce((a, b) => a + b, 0) / hourValues.length
      : null;

  const withFunValue = enriched.filter((c) => c.funPer100 != null);
  const bestValue =
    withFunValue.length > 0
      ? withFunValue.reduce((best, c) =>
          (c.funPer100 ?? 0) > (best.funPer100 ?? 0) ? c : best,
        )
      : null;
  const mostExpensive = enriched.reduce((best, c) =>
    c.total > best.total ? c : best,
  );
  const highestFun = enriched.reduce((best, c) =>
    c.fun_rating > best.fun_rating ? c : best,
  );

  const categoryTotals = COST_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: enriched.reduce((sum, c) => sum + Number(c[cat.key]), 0),
  })).filter((row) => row.value > 0);

  const byConcert = enriched.map((c) => ({
    name:
      c.concert_name.length > 16
        ? c.concert_name.slice(0, 14) + "…"
        : c.concert_name,
    total: Number(c.total.toFixed(2)),
    fun: c.fun_rating,
    funPer100: c.funPer100 == null ? 0 : Number(c.funPer100.toFixed(2)),
  }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total concerts" value={String(enriched.length)} />
        <StatCard title="Total spent" value={formatMoney(totalSpent)} />
        <StatCard title="Avg cost / concert" value={formatMoney(avgCost)} />
        <StatCard
          title="Avg fun rating"
          value={`${formatNumber(avgFun, 1)} / 10`}
        />
        <StatCard
          title="Avg cost / hour"
          value={avgCostPerHour == null ? "—" : formatMoney(avgCostPerHour)}
        />
        <StatCard
          title="Best value"
          value={bestValue?.concert_name ?? "—"}
          subtitle={
            bestValue?.funPer100 != null
              ? `${formatNumber(bestValue.funPer100, 2)} fun pts / $100`
              : undefined
          }
        />
        <StatCard
          title="Most expensive"
          value={mostExpensive.concert_name}
          subtitle={formatMoney(mostExpensive.total)}
        />
        <StatCard
          title="Highest fun"
          value={highestFun.concert_name}
          subtitle={`${highestFun.fun_rating} / 10`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Spending by cost category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {categoryTotals.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total cost by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar dataKey="total" fill="#8884d8" name="Total cost" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fun rating by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="fun" fill="#82ca9d" name="Fun rating" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fun Points per $100 by concert">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatNumber(Number(value), 2)}
              />
              <Bar
                dataKey="funPer100"
                fill="#ffc658"
                name="Fun Points per $100"
                radius={6}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-5 gap-1">
        <p className="text-xs uppercase tracking-wide opacity-60">{title}</p>
        <p className="text-xl font-bold leading-tight break-words">{value}</p>
        {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title text-base">{title}</h2>
        {children}
      </div>
    </div>
  );
}
