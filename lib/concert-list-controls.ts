import { withMetrics } from "@/lib/concert-math";
import type { Concert } from "@/lib/types";

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "cost-desc"
  | "cost-asc"
  | "fun-desc"
  | "fun-asc"
  | "value-desc"
  | "value-asc";

export const DEFAULT_SORT: SortOption = "date-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Newest concert date first" },
  { value: "date-asc", label: "Oldest concert date first" },
  { value: "cost-desc", label: "Highest total cost" },
  { value: "cost-asc", label: "Lowest total cost" },
  { value: "fun-desc", label: "Highest fun rating" },
  { value: "fun-asc", label: "Lowest fun rating" },
  { value: "value-desc", label: "Highest Fun Points per $100" },
  { value: "value-asc", label: "Lowest Fun Points per $100" },
];

/** Unique artists from the user's concerts, A–Z. */
export function uniqueArtists(concerts: Concert[]): string[] {
  return Array.from(new Set(concerts.map((c) => c.artist).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Unique states from the user's concerts, A–Z. */
export function uniqueStates(concerts: Concert[]): string[] {
  return Array.from(new Set(concerts.map((c) => c.state).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Unique years from concert dates, newest year first. */
export function uniqueYears(concerts: Concert[]): number[] {
  const years = concerts.map((c) =>
    new Date(c.concert_date + "T00:00:00").getFullYear(),
  );
  return Array.from(new Set(years)).sort((a, b) => b - a);
}

function matchesSearch(concert: Concert, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    concert.concert_name,
    concert.artist,
    concert.venue,
    concert.city,
    concert.state,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export type ConcertListFilters = {
  search: string;
  artist: string;
  state: string;
  year: string;
  sort: SortOption;
};

export function filterAndSortConcerts(
  concerts: Concert[],
  filters: ConcertListFilters,
): Concert[] {
  let list = concerts.filter((c) => matchesSearch(c, filters.search));

  if (filters.artist) {
    list = list.filter((c) => c.artist === filters.artist);
  }
  if (filters.state) {
    list = list.filter((c) => c.state === filters.state);
  }
  if (filters.year) {
    const year = Number(filters.year);
    list = list.filter(
      (c) => new Date(c.concert_date + "T00:00:00").getFullYear() === year,
    );
  }

  const enriched = list.map((c) => ({ concert: c, metrics: withMetrics(c) }));

  enriched.sort((a, b) => {
    switch (filters.sort) {
      case "date-asc":
        return a.concert.concert_date.localeCompare(b.concert.concert_date);
      case "date-desc":
        return b.concert.concert_date.localeCompare(a.concert.concert_date);
      case "cost-asc":
        return a.metrics.total - b.metrics.total;
      case "cost-desc":
        return b.metrics.total - a.metrics.total;
      case "fun-asc":
        return a.concert.fun_rating - b.concert.fun_rating;
      case "fun-desc":
        return b.concert.fun_rating - a.concert.fun_rating;
      case "value-asc": {
        const av = a.metrics.funPer100 ?? -Infinity;
        const bv = b.metrics.funPer100 ?? -Infinity;
        return av - bv;
      }
      case "value-desc": {
        const av = a.metrics.funPer100 ?? -Infinity;
        const bv = b.metrics.funPer100 ?? -Infinity;
        return bv - av;
      }
      default:
        return b.concert.concert_date.localeCompare(a.concert.concert_date);
    }
  });

  return enriched.map((row) => row.concert);
}
