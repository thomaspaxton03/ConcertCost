"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COST_CATEGORIES, formatMoney, totalCost } from "@/lib/concert-math";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  hours_at_event: "3",
  ticket_cost: "0",
  ticket_fees: "0",
  parking_cost: "0",
  food_drink_cost: "0",
  merchandise_cost: "0",
  lodging_cost: "0",
  travel_cost: "0",
  other_cost: "0",
  fun_rating: "7",
  notes: "",
};

export function AddConcertForm() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const liveTotal = useMemo(
    () =>
      totalCost({
        ticket_cost: Number(form.ticket_cost),
        ticket_fees: Number(form.ticket_fees),
        parking_cost: Number(form.parking_cost),
        food_drink_cost: Number(form.food_drink_cost),
        merchandise_cost: Number(form.merchandise_cost),
        lodging_cost: Number(form.lodging_cost),
        travel_cost: Number(form.travel_cost),
        other_cost: Number(form.other_cost),
      }),
    [form],
  );

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You need to be logged in to save a concert.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: Number(form.distance_from_home) || 0,
      hours_at_event: Number(form.hours_at_event) || 0,
      ticket_cost: Number(form.ticket_cost) || 0,
      ticket_fees: Number(form.ticket_fees) || 0,
      parking_cost: Number(form.parking_cost) || 0,
      food_drink_cost: Number(form.food_drink_cost) || 0,
      merchandise_cost: Number(form.merchandise_cost) || 0,
      lodging_cost: Number(form.lodging_cost) || 0,
      travel_cost: Number(form.travel_cost) || 0,
      other_cost: Number(form.other_cost) || 0,
      fun_rating: Number(form.fun_rating),
      notes: form.notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setForm(emptyForm);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Add Concert</h1>
          <p className="opacity-70 mt-1">
            Capture the night, the costs, and how fun it felt.
          </p>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-2 px-4 w-fit">
          <div className="stat-title text-xs">Live total cost</div>
          <div className="stat-value text-2xl text-primary">
            {formatMoney(liveTotal)}
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <span>Concert saved! The form is cleared so you can add another.</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Concert details</h2>
          <p className="text-sm opacity-70 -mt-2">
            Where you went and how long you were there.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Field
              label="Concert name"
              required
              value={form.concert_name}
              onChange={(v) => update("concert_name", v)}
              placeholder="Summer Stadium Tour"
            />
            <Field
              label="Artist or band"
              required
              value={form.artist}
              onChange={(v) => update("artist", v)}
              placeholder="The Weeknd"
            />
            <Field
              label="Venue"
              required
              value={form.venue}
              onChange={(v) => update("venue", v)}
              placeholder="Rogers Centre"
            />
            <Field
              label="City"
              required
              value={form.city}
              onChange={(v) => update("city", v)}
              placeholder="Toronto"
            />
            <Field
              label="State / province"
              required
              value={form.state}
              onChange={(v) => update("state", v)}
              placeholder="ON"
            />
            <Field
              label="Concert date"
              type="date"
              required
              value={form.concert_date}
              onChange={(v) => update("concert_date", v)}
            />
            <Field
              label="Distance from home (miles)"
              type="number"
              min="0"
              step="0.1"
              value={form.distance_from_home}
              onChange={(v) => update("distance_from_home", v)}
              helper="Rough estimate is fine"
            />
            <Field
              label="Hours at the event"
              type="number"
              min="0"
              step="0.25"
              value={form.hours_at_event}
              onChange={(v) => update("hours_at_event", v)}
              helper="Used for cost per hour"
            />
            <div className="md:col-span-2">
              <label className="form-control w-full">
                <span className="label-text font-medium mb-1">Notes</span>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Opening act, weather, who you went with..."
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Costs</h2>
          <p className="text-sm opacity-70 -mt-2">
            Enter 0 if a category does not apply. Total updates as you type.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {COST_CATEGORIES.map((cat) => (
              <Field
                key={cat.key}
                label={cat.label}
                type="number"
                min="0"
                step="0.01"
                value={form[cat.key]}
                onChange={(v) => update(cat.key, v)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Fun rating</h2>
          <p className="text-sm opacity-70 -mt-2">
            1 = Terrible Time · 10 = Best Time Ever
          </p>
          <div className="flex flex-col gap-3 mt-2">
            <input
              type="range"
              min={1}
              max={10}
              value={form.fun_rating}
              onChange={(e) => update("fun_rating", e.target.value)}
              className="range range-primary"
            />
            <div className="flex justify-between text-xs opacity-70 px-1">
              <span>Terrible Time</span>
              <span className="font-bold text-base text-primary">
                {form.fun_rating} / 10
              </span>
              <span>Best Time Ever</span>
            </div>
          </div>
        </div>
      </section>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? "Saving..." : "Save concert"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  helper,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text font-medium mb-1">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        className="input input-bordered w-full"
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper && <span className="label-text-alt opacity-60 mt-1">{helper}</span>}
    </label>
  );
}
