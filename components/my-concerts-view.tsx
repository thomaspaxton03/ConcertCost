"use client";

import { useState } from "react";
import { ConcertCards } from "@/components/concert-cards";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  filterAndSortConcerts,
  uniqueArtists,
  uniqueStates,
  uniqueYears,
  type SortOption,
} from "@/lib/concert-list-controls";
import type { Concert } from "@/lib/types";

export function MyConcertsView({ concerts }: { concerts: Concert[] }) {
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [state, setState] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

  const artists = uniqueArtists(concerts);
  const states = uniqueStates(concerts);
  const years = uniqueYears(concerts);

  const filtered = filterAndSortConcerts(concerts, {
    search,
    artist,
    state,
    year,
    sort,
  });

  const hasActiveControls =
    search.trim() !== "" ||
    artist !== "" ||
    state !== "" ||
    year !== "" ||
    sort !== DEFAULT_SORT;

  function clearFilters() {
    setSearch("");
    setArtist("");
    setState("");
    setYear("");
    setSort(DEFAULT_SORT);
  }

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-4 p-4 sm:p-5">
          <div className="form-control w-full">
            <label className="label py-1" htmlFor="concert-search">
              <span className="label-text font-medium text-base-content">
                Search
              </span>
            </label>
            <input
              id="concert-search"
              type="search"
              className="input input-bordered w-full bg-base-100 text-base-content"
              placeholder="Search name, artist, venue, city, or state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="form-control w-full">
              <label className="label py-1" htmlFor="filter-artist">
                <span className="label-text font-medium text-base-content">
                  Artist
                </span>
              </label>
              <select
                id="filter-artist"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              >
                <option value="">All artists</option>
                {artists.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label py-1" htmlFor="filter-state">
                <span className="label-text font-medium text-base-content">
                  State
                </span>
              </label>
              <select
                id="filter-state"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">All states</option>
                {states.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label py-1" htmlFor="filter-year">
                <span className="label-text font-medium text-base-content">
                  Concert year
                </span>
              </label>
              <select
                id="filter-year"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">All years</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label py-1" htmlFor="sort-concerts">
                <span className="label-text font-medium text-base-content">
                  Sort by
                </span>
              </label>
              <select
                id="sort-concerts"
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-base-content/80">
              Showing {filtered.length} of {concerts.length} concerts
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm self-start sm:self-auto"
              onClick={clearFilters}
              disabled={!hasActiveControls}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body items-center text-center py-10">
            <p className="max-w-md text-base-content/80">
              No concerts match your current search or filters. Try changing or
              clearing them.
            </p>
            {hasActiveControls && (
              <button
                type="button"
                className="btn btn-primary btn-sm mt-2"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <ConcertCards concerts={filtered} />
      )}
    </div>
  );
}
