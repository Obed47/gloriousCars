"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveVehicle } from "@/app/admin/actions";
import { ImagesField } from "@/components/admin/ImagesField";
import {
  BODY_TYPES,
  CONDITIONS,
  DRIVE_TYPES,
  FEATURE_CATEGORIES,
  FUEL_TYPES,
  STATUSES,
  TRANSMISSIONS,
  type SaveState,
  type VehicleDraft,
} from "@/lib/admin/vehicleForm";

const control =
  "rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 aria-invalid:border-red-500";
const input = `h-11 ${control}`;
const textarea = `${control} py-2.5`;

function Field({
  label,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="card flex flex-col gap-5 p-6">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function Select({
  name,
  options,
  defaultValue,
  invalid,
}: {
  name: string;
  options: readonly string[];
  defaultValue: string;
  invalid?: boolean;
}) {
  return (
    <select name={name} defaultValue={defaultValue} aria-invalid={invalid} className={input}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function VehicleForm({
  vehicleId,
  initial,
}: {
  vehicleId: string | null;
  initial: VehicleDraft;
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(
    saveVehicle.bind(null, vehicleId),
    { draft: initial, errors: {} },
  );
  const { draft: d, errors: e } = state;
  // Saving mid-upload would drop the photo that is still on its way.
  const [uploading, setUploading] = useState(false);

  // The Save button is at the bottom, so a problem further up would otherwise
  // look like "nothing happened". Bring the first problem into view.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (Object.keys(state.errors).length === 0) return;
    const first = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"], [role="alert"]',
    );
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (first?.getAttribute("aria-invalid") === "true") first.focus({ preventScroll: true });
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-6">
      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock reference" error={e.reference} hint="Unique, e.g. PC-BMW-X5-0241">
            <input name="reference" defaultValue={d.reference} aria-invalid={!!e.reference} className={input} />
          </Field>
          <Field label="Location" error={e.location}>
            <input name="location" defaultValue={d.location} aria-invalid={!!e.location} className={input} />
          </Field>
          <Field label="Brand" error={e.brand}>
            <input name="brand" defaultValue={d.brand} aria-invalid={!!e.brand} className={input} />
          </Field>
          <Field label="Model" error={e.model}>
            <input name="model" defaultValue={d.model} aria-invalid={!!e.model} className={input} />
          </Field>
          <Field label="Trim (optional)">
            <input name="trim" defaultValue={d.trim} className={input} />
          </Field>
          <Field label="Year" error={e.year}>
            <input name="year" inputMode="numeric" defaultValue={d.year} aria-invalid={!!e.year} className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Listing" description="Price is in XAF.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Price (XAF)" error={e.price}>
            <input name="price" inputMode="numeric" defaultValue={d.price} aria-invalid={!!e.price} className={input} />
          </Field>
          <Field label="Mileage (km)" error={e.mileage}>
            <input name="mileage" inputMode="numeric" defaultValue={d.mileage} aria-invalid={!!e.mileage} className={input} />
          </Field>
          <Field label="Condition" error={e.condition}>
            <Select name="condition" options={CONDITIONS} defaultValue={d.condition} invalid={!!e.condition} />
          </Field>
          <Field label="Status" error={e.status} hint="Sold vehicles are hidden from the public site.">
            <Select name="status" options={STATUSES} defaultValue={d.status} invalid={!!e.status} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={d.featured}
            className="size-4 accent-accent"
          />
          Feature on the home page
        </label>
      </Section>

      <Section title="Specification">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Engine" error={e.engine} hint="e.g. 3.0L turbo I6">
            <input name="engine" defaultValue={d.engine} aria-invalid={!!e.engine} className={input} />
          </Field>
          <Field label="Horsepower" error={e.horsepower}>
            <input name="horsepower" inputMode="numeric" defaultValue={d.horsepower} aria-invalid={!!e.horsepower} className={input} />
          </Field>
          <Field label="Colour" error={e.color}>
            <input name="color" defaultValue={d.color} aria-invalid={!!e.color} className={input} />
          </Field>
          <Field label="Fuel" error={e.fuelType}>
            <Select name="fuelType" options={FUEL_TYPES} defaultValue={d.fuelType} invalid={!!e.fuelType} />
          </Field>
          <Field label="Transmission" error={e.transmission}>
            <Select name="transmission" options={TRANSMISSIONS} defaultValue={d.transmission} invalid={!!e.transmission} />
          </Field>
          <Field label="Drive" error={e.driveType}>
            <Select name="driveType" options={DRIVE_TYPES} defaultValue={d.driveType} invalid={!!e.driveType} />
          </Field>
          <Field label="Body type" error={e.bodyType}>
            <Select name="bodyType" options={BODY_TYPES} defaultValue={d.bodyType} invalid={!!e.bodyType} />
          </Field>
          <Field label="Seats" error={e.seats}>
            <input name="seats" inputMode="numeric" defaultValue={d.seats} aria-invalid={!!e.seats} className={input} />
          </Field>
          <Field label="Doors" error={e.doors}>
            <input name="doors" inputMode="numeric" defaultValue={d.doors} aria-invalid={!!e.doors} className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <Field label="Description" error={e.description}>
          <textarea name="description" rows={5} defaultValue={d.description} aria-invalid={!!e.description} className={textarea} />
        </Field>
        <Field label="Highlights" hint="One per line.">
          <textarea name="highlights" rows={4} defaultValue={d.highlights} className={textarea} />
        </Field>
      </Section>

      <Section title="Features & equipment" description="One feature per line. Empty categories are hidden.">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURE_CATEGORIES.map((category) => (
            <Field key={category} label={category}>
              <textarea
                name={`features_${category}`}
                rows={5}
                defaultValue={d.features[category]}
                className={textarea}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Photos">
        <ImagesField initial={d.images} error={e.images} onBusyChange={setUploading} />
      </Section>

      {state.message && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-60"
        >
          {(pending || uploading) && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {uploading ? "Uploading photos…" : vehicleId ? "Save changes" : "Add vehicle"}
        </button>
        <Link
          href="/admin"
          className="inline-flex h-12 items-center rounded-lg px-4 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
