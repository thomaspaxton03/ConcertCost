"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COST_CATEGORIES,
  formatMoney,
  formatNumber,
  withMetrics,
} from "@/lib/concert-math";
import type { Concert } from "@/lib/types";

/** Same palette family as the dashboard charts */
const FIRST_BAR = "#8884d8";
const SECOND_BAR = "#82ca9d";

function formatConcertDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Example: Metallica — World Tour — June 15, 2026 */
function concertOptionLabel(concert: Concert): string {
  return `${concert.artist} — ${concert.concert_name} — ${formatConcertDate(concert.concert_date)}`;
}

function shortBarName(concert: Concert): string {
  const name =
    concert.concert_name.length > 18
      ? concert.concert_name.slice(0, 16) + "…"
      : concert.concert_name;
  return name;
}

type MetricKind = "lower-better" | "higher-better" | "info";

type Row = {
  label: string;
  first: string;
  second: string;
  kind: MetricKind;
  firstRaw: number | null;
  secondRaw: number | null;
};

function winnerSide(
  kind: MetricKind,
  firstRaw: number | null,
  secondRaw: number | null,
): "first" | "second" | null {
  if (kind === "info") return null;
  if (firstRaw == null || secondRaw == null) return null;
  if (firstRaw === secondRaw) return null;
  if (kind === "lower-better") {
    return firstRaw < secondRaw ? "first" : "second";
  }
  return firstRaw > secondRaw ? "first" : "second";
}

export function CompareConcertsView({ concerts }: { concerts: Concert[] }) {
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");

  if (concerts.length < 2) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body items-center text-center gap-4 py-12">
            <h2 className="card-title text-xl text-base-content">
              Almost ready to compare
            </h2>
            <p className="max-w-md text-base-content/80">
              Add at least two concerts before using the comparison feature.
            </p>
            <Link href="/add" className="btn btn-primary">
              Add a concert
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const first = concerts.find((c) => c.id === firstId) ?? null;
  const second = concerts.find((c) => c.id === secondId) ?? null;

  function swapConcerts() {
    setFirstId(secondId);
    setSecondId(firstId);
  }

  const firstMetrics = first ? withMetrics(first) : null;
  const secondMetrics = second ? withMetrics(second) : null;

  const rows: Row[] | null =
    first && second && firstMetrics && secondMetrics
      ? [
          {
            label: "Concert name",
            first: first.concert_name,
            second: second.concert_name,
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          {
            label: "Artist",
            first: first.artist,
            second: second.artist,
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          {
            label: "Venue, city, and state",
            first: `${first.venue}, ${first.city}, ${first.state}`,
            second: `${second.venue}, ${second.city}, ${second.state}`,
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          {
            label: "Concert date",
            first: formatConcertDate(first.concert_date),
            second: formatConcertDate(second.concert_date),
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          {
            label: "Total cost",
            first: formatMoney(firstMetrics.total),
            second: formatMoney(secondMetrics.total),
            kind: "lower-better",
            firstRaw: firstMetrics.total,
            secondRaw: secondMetrics.total,
          },
          {
            label: "Fun rating",
            first: `${first.fun_rating} / 10`,
            second: `${second.fun_rating} / 10`,
            kind: "higher-better",
            firstRaw: first.fun_rating,
            secondRaw: second.fun_rating,
          },
          {
            label: "Cost per hour",
            first:
              firstMetrics.costPerHour == null
                ? "N/A"
                : formatMoney(firstMetrics.costPerHour),
            second:
              secondMetrics.costPerHour == null
                ? "N/A"
                : formatMoney(secondMetrics.costPerHour),
            kind: "lower-better",
            firstRaw: firstMetrics.costPerHour,
            secondRaw: secondMetrics.costPerHour,
          },
          {
            label: "Fun Points per $100",
            first:
              firstMetrics.funPer100 == null
                ? "N/A"
                : formatNumber(firstMetrics.funPer100, 2),
            second:
              secondMetrics.funPer100 == null
                ? "N/A"
                : formatNumber(secondMetrics.funPer100, 2),
            kind: "higher-better",
            firstRaw: firstMetrics.funPer100,
            secondRaw: secondMetrics.funPer100,
          },
          {
            label: "Distance from home",
            first: `${formatNumber(Number(first.distance_from_home), 1)} mi`,
            second: `${formatNumber(Number(second.distance_from_home), 1)} mi`,
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          {
            label: "Hours at the event",
            first: formatNumber(Number(first.hours_at_event), 1),
            second: formatNumber(Number(second.hours_at_event), 1),
            kind: "info",
            firstRaw: null,
            secondRaw: null,
          },
          ...COST_CATEGORIES.map((cat) => ({
            label: cat.label,
            first: formatMoney(Number(first[cat.key])),
            second: formatMoney(Number(second[cat.key])),
            kind: "info" as const,
            firstRaw: null,
            secondRaw: null,
          })),
        ]
      : null;

  const chartData =
    first && second
      ? COST_CATEGORIES.map((cat) => ({
          category: cat.label,
          first: Number(first[cat.key]),
          second: Number(second[cat.key]),
        }))
      : [];

  return (
    <div className="space-y-6">
      <Header />

      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-4 p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1" htmlFor="first-concert">
                <span className="label-text font-semibold text-base-content">
                  First Concert
                </span>
              </label>
              <select
                id="first-concert"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={firstId}
                onChange={(e) => {
                  const next = e.target.value;
                  setFirstId(next);
                  if (next && next === secondId) setSecondId("");
                }}
              >
                <option value="">Choose a concert…</option>
                {concerts.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id === secondId}
                  >
                    {concertOptionLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label py-1" htmlFor="second-concert">
                <span className="label-text font-semibold text-base-content">
                  Second Concert
                </span>
              </label>
              <select
                id="second-concert"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={secondId}
                onChange={(e) => {
                  const next = e.target.value;
                  setSecondId(next);
                  if (next && next === firstId) setFirstId("");
                }}
              >
                <option value="">Choose a concert…</option>
                {concerts.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id === firstId}
                  >
                    {concertOptionLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={swapConcerts}
              disabled={!firstId && !secondId}
            >
              Swap Concerts
            </button>
          </div>
        </div>
      </div>

      {!rows && (
        <div className="alert bg-base-100 text-base-content shadow">
          <span>Pick two different concerts to see the comparison.</span>
        </div>
      )}

      {rows && first && second && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConcertSummary
              title="First Concert"
              concert={first}
              accentClass="border-primary"
            />
            <ConcertSummary
              title="Second Concert"
              concert={second}
              accentClass="border-secondary"
            />
          </div>

          <div className="card bg-base-100 shadow-md overflow-x-auto">
            <div className="card-body p-0 sm:p-2">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="text-base-content">
                      <th>What we compare</th>
                      <th>First Concert</th>
                      <th>Second Concert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const win = winnerSide(
                        row.kind,
                        row.firstRaw,
                        row.secondRaw,
                      );
                      return (
                        <tr key={row.label}>
                          <td className="font-medium text-base-content/80 whitespace-nowrap">
                            {row.label}
                            {row.kind !== "info" && (
                              <span className="block text-xs font-normal opacity-60">
                                {row.kind === "lower-better"
                                  ? "Lower is better"
                                  : "Higher is better"}
                              </span>
                            )}
                          </td>
                          <td
                            className={
                              win === "first"
                                ? "bg-success/20 font-semibold text-base-content"
                                : "text-base-content"
                            }
                          >
                            {row.first}
                            {win === "first" && (
                              <span className="badge badge-success badge-sm ml-2">
                                Better
                              </span>
                            )}
                          </td>
                          <td
                            className={
                              win === "second"
                                ? "bg-success/20 font-semibold text-base-content"
                                : "text-base-content"
                            }
                          >
                            {row.second}
                            {win === "second" && (
                              <span className="badge badge-success badge-sm ml-2">
                                Better
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-base text-base-content">
                Cost categories side by side
              </h2>
              <p className="text-sm text-base-content/70 -mt-1 mb-2">
                Purple = First Concert · Green = Second Concert
              </p>
              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                    />
                    <Legend />
                    <Bar
                      dataKey="first"
                      name={shortBarName(first)}
                      fill={FIRST_BAR}
                      radius={4}
                    />
                    <Bar
                      dataKey="second"
                      name={shortBarName(second)}
                      fill={SECOND_BAR}
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-base-content">Compare Concerts</h1>
      <p className="opacity-70 mt-1 text-base-content">
        Pick two of your shows and see which one gave you more bang for your
        buck.
      </p>
    </div>
  );
}

function ConcertSummary({
  title,
  concert,
  accentClass,
}: {
  title: string;
  concert: Concert;
  accentClass: string;
}) {
  return (
    <div className={`card bg-base-100 shadow-md border-l-4 ${accentClass}`}>
      <div className="card-body gap-1 p-5">
        <p className="text-xs uppercase tracking-wide opacity-60">{title}</p>
        <h2 className="card-title text-xl text-base-content">
          {concert.concert_name}
        </h2>
        <p className="text-base-content/80">{concert.artist}</p>
        <p className="text-sm text-base-content/70">
          {concert.venue} · {concert.city}, {concert.state}
        </p>
        <p className="text-sm text-base-content/70">
          {formatConcertDate(concert.concert_date)}
        </p>
      </div>
    </div>
  );
}
