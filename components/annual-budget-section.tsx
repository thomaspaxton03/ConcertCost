"use client";

import { useEffect, useState } from "react";
import { formatMoney, formatNumber } from "@/lib/concert-math";
import {
  amountSpentInYear,
  budgetStatus,
  budgetYearOptions,
  concertsInYear,
  parseBudgetInput,
  progressBarWidth,
  progressColorClass,
  readBudget,
  writeBudget,
} from "@/lib/annual-budget";
import type { Concert } from "@/lib/types";

export function AnnualBudgetSection({
  userId,
  concerts,
}: {
  userId: string;
  concerts: Concert[];
}) {
  const years = budgetYearOptions(concerts);
  const [year, setYear] = useState(years[0] ?? new Date().getFullYear());
  const [budget, setBudget] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load budget whenever user or year changes
  useEffect(() => {
    const saved = readBudget(userId, year);
    setBudget(saved);
    setEditing(saved == null);
    setInput(saved != null ? String(saved) : "");
    setError(null);
    setSuccess(false);
  }, [userId, year]);

  const spent = amountSpentInYear(concerts, year);
  const yearConcertCount = concertsInYear(concerts, year).length;
  const remaining = budget != null ? budget - spent : null;
  const percentUsed =
    budget != null && budget > 0 ? (spent / budget) * 100 : null;

  function handleSave() {
    setSuccess(false);
    const parsed = parseBudgetInput(input);
    if (parsed == null) {
      setError("Enter a dollar amount greater than zero. Letters and blanks are not allowed.");
      return;
    }
    writeBudget(userId, year, parsed);
    setBudget(parsed);
    setEditing(false);
    setError(null);
    setSuccess(true);
  }

  function handleChangeBudget() {
    setEditing(true);
    setSuccess(false);
    setError(null);
    setInput(budget != null ? String(budget) : "");
  }

  const status =
    budget != null && budget > 0 ? budgetStatus(spent, budget) : null;

  return (
    <section className="card bg-base-100 shadow-md">
      <div className="card-body gap-5 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="card-title text-xl text-base-content">
              Annual Concert Budget
            </h2>
            <p className="text-sm text-base-content/70 mt-1">
              Track how much you planned to spend versus what you actually spent.
            </p>
          </div>

          <div className="form-control w-full sm:w-40">
            <label className="label py-1" htmlFor="budget-year">
              <span className="label-text font-medium text-base-content">
                Year
              </span>
            </label>
            <select
              id="budget-year"
              className="select select-bordered w-full bg-base-100 text-base-content"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {editing || budget == null ? (
          <div className="space-y-3 max-w-md">
            <p className="font-medium text-base-content">
              Set a concert budget for {year}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="form-control flex-1 w-full">
                <label className="label py-1" htmlFor="budget-amount">
                  <span className="label-text text-base-content">
                    Budget amount ($)
                  </span>
                </label>
                <input
                  id="budget-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="1000"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary sm:mb-0"
                onClick={handleSave}
              >
                Save Budget
              </button>
            </div>
            <p className="text-xs text-base-content/60">
              This budget is saved on the current device only.
            </p>
            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success text-sm">
                <span>Your concert budget has been saved.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleChangeBudget}
              >
                Change Budget
              </button>
              {success && (
                <span className="text-sm text-success">
                  Your concert budget has been saved.
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <BudgetStat title="Annual Budget" value={formatMoney(budget)} />
              <BudgetStat title="Amount Spent" value={formatMoney(spent)} />
              <BudgetStat
                title="Amount Remaining"
                value={
                  remaining != null && remaining < 0
                    ? `${formatMoney(Math.abs(remaining))} Over Budget`
                    : formatMoney(remaining ?? 0)
                }
                emphasize={remaining != null && remaining < 0}
              />
              <BudgetStat
                title="Budget Used"
                value={
                  percentUsed == null
                    ? "N/A"
                    : `${formatNumber(percentUsed, 1)}%`
                }
              />
              <BudgetStat
                title="Concerts Attended During the Year"
                value={String(yearConcertCount)}
              />
            </div>

            {percentUsed != null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-base-content/80">
                  <span>Budget progress</span>
                  <span>
                    {formatNumber(percentUsed, 1)}% of budget used
                  </span>
                </div>
                <progress
                  className={`progress w-full h-3 ${progressColorClass(percentUsed)}`}
                  value={progressBarWidth(percentUsed)}
                  max={100}
                />
                <p className="text-sm text-base-content/80">
                  {status === "comfortable" &&
                    "You’re comfortably within your concert budget."}
                  {status === "close" &&
                    "You’re getting close to your concert budget."}
                  {status === "exact" &&
                    "You’ve used your entire concert budget."}
                  {status === "over" &&
                    remaining != null &&
                    `You’re over your concert budget by ${formatMoney(Math.abs(remaining))}.`}
                </p>
              </div>
            )}

            {yearConcertCount === 0 && (
              <div className="alert bg-base-200 text-base-content">
                <span>
                  No concerts logged for this year yet. Your full budget is
                  still available.
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-base-content/60">
          Budget settings are saved on this device.
        </p>
      </div>
    </section>
  );
}

function BudgetStat({
  title,
  value,
  emphasize = false,
}: {
  title: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-box bg-base-200 p-4">
      <p className="text-xs uppercase tracking-wide opacity-60">{title}</p>
      <p
        className={`text-lg font-bold leading-tight break-words mt-1 ${
          emphasize ? "text-error" : "text-base-content"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
