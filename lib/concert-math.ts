import type { Concert, ConcertCosts } from "@/lib/types";

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function totalCost(costs: ConcertCosts): number {
  return (
    toNumber(costs.ticket_cost) +
    toNumber(costs.ticket_fees) +
    toNumber(costs.parking_cost) +
    toNumber(costs.food_drink_cost) +
    toNumber(costs.merchandise_cost) +
    toNumber(costs.lodging_cost) +
    toNumber(costs.travel_cost) +
    toNumber(costs.other_cost)
  );
}

export function costPerHour(total: number, hours: number): number | null {
  const h = toNumber(hours);
  if (h <= 0) return null;
  return total / h;
}

/** Fun Points per $100 = (fun rating / total cost) * 100 */
export function funPointsPer100(funRating: number, total: number): number | null {
  if (total <= 0) return null;
  return (toNumber(funRating) / total) * 100;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function withMetrics(concert: Concert) {
  const total = totalCost(concert);
  return {
    ...concert,
    total,
    costPerHour: costPerHour(total, concert.hours_at_event),
    funPer100: funPointsPer100(concert.fun_rating, total),
  };
}

export const COST_CATEGORIES = [
  { key: "ticket_cost" as const, label: "Tickets" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & drink" },
  { key: "merchandise_cost" as const, label: "Merchandise" },
  { key: "lodging_cost" as const, label: "Hotel / lodging" },
  { key: "travel_cost" as const, label: "Travel / gas" },
  { key: "other_cost" as const, label: "Other" },
];
