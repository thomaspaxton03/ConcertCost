import { withMetrics } from "@/lib/concert-math";
import type { Concert } from "@/lib/types";

/** localStorage key: concert-budget:{userId}:{year} */
export function budgetStorageKey(userId: string, year: number): string {
  return `concert-budget:${userId}:${year}`;
}

export function readBudget(userId: string, year: number): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(budgetStorageKey(userId, year));
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function writeBudget(userId: string, year: number, amount: number): void {
  window.localStorage.setItem(budgetStorageKey(userId, year), String(amount));
}

/** Current year plus every year that appears in the user's concert dates. */
export function budgetYearOptions(concerts: Concert[]): number[] {
  const current = new Date().getFullYear();
  const years = new Set<number>([current]);
  for (const c of concerts) {
    years.add(new Date(c.concert_date + "T00:00:00").getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function concertsInYear(concerts: Concert[], year: number): Concert[] {
  return concerts.filter(
    (c) => new Date(c.concert_date + "T00:00:00").getFullYear() === year,
  );
}

/** Amount spent in a year using the existing total-cost formula. */
export function amountSpentInYear(concerts: Concert[], year: number): number {
  return concertsInYear(concerts, year).reduce(
    (sum, c) => sum + withMetrics(c).total,
    0,
  );
}

export function parseBudgetInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export type BudgetStatus =
  | "comfortable"
  | "close"
  | "exact"
  | "over";

export function budgetStatus(
  spent: number,
  budget: number,
): BudgetStatus {
  if (budget <= 0) return "comfortable";
  if (spent > budget) return "over";
  // Exact match on dollars avoids float weirdness like 99.999%
  if (spent === budget) return "exact";
  const percentUsed = (spent / budget) * 100;
  if (percentUsed >= 75) return "close";
  return "comfortable";
}

/** Bar fill capped at 100; text can show the real percent. */
export function progressBarWidth(percentUsed: number): number {
  if (!Number.isFinite(percentUsed) || percentUsed <= 0) return 0;
  return Math.min(percentUsed, 100);
}

export function progressColorClass(percentUsed: number): string {
  if (percentUsed > 100) return "progress-error";
  if (percentUsed >= 75) return "progress-warning";
  return "progress-success";
}
