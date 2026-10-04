"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Check, MapPin, X } from "lucide-react";
import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import {
  buildWhatsAppUrl,
  testDriveMessage,
  type TestDriveDetails,
} from "@/lib/whatsapp";
import type { Vehicle } from "@/lib/types";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

interface FormState {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  location: string;
  message: string;
}

const emptyForm = (): FormState => ({
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  location: SITE.locations[0],
  message: "",
});

export function TestDriveModal({
  vehicle,
  open,
  onClose,
}: {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [confirmed, setConfirmed] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const today = new Date().toISOString().slice(0, 10);

  // Reset transient state on each open/close transition; focus first field.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setErrors({});
      const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    setForm(emptyForm());
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.phone.trim()) next.phone = "We need a phone number to confirm.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "That email doesn't look right.";
    if (!form.date) next.date = "Choose a preferred date.";
    if (!form.time) next.time = "Pick a time slot.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    window.open(waHref, "_blank", "noopener,noreferrer");
    setConfirmed(true);
  }

  const details: TestDriveDetails = {
    name: form.name,
    phone: form.phone,
    email: form.email || undefined,
    date: form.date,
    time: form.time,
    location: form.location,
    message: form.message || undefined,
  };
  const waHref = buildWhatsAppUrl(testDriveMessage(vehicle, details));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-lift sm:rounded-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-extrabold uppercase tracking-tight text-ink"
                >
                  {confirmed
                    ? "Your test drive is requested"
                    : "Book your test drive"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {confirmed
                    ? "Your details have been opened in WhatsApp. Our team will contact you shortly to confirm your appointment."
                    : "Experience the vehicle before you make your decision."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {/* Selected vehicle */}
            <div className="flex items-center gap-3 border-b border-line bg-mist px-5 py-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-graphite">
                {vehicle.images[0] && (
                  <Image
                    src={vehicle.images[0].url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {vehicleFullTitle(vehicle)}
                </p>
                <p className="text-xs text-muted">
                  {formatPrice(vehicle.price, vehicle.currency)} · Ref{" "}
                  {vehicle.reference}
                </p>
              </div>
            </div>

            {confirmed ? (
              <Confirmation
                vehicle={vehicle}
                form={form}
                waHref={waHref}
                onClose={onClose}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 overflow-y-auto p-5"
                noValidate
              >
                <TextField
                  ref={firstFieldRef}
                  label="Full name"
                  required
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
                  autoComplete="name"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Phone number"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    error={errors.phone}
                    autoComplete="tel"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>

                <TextField
                  label="Preferred date"
                  required
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={set("date")}
                  error={errors.date}
                />

                <fieldset>
                  <legend className="mb-1.5 text-sm font-semibold text-ink">
                    Preferred time <span className="text-accent">*</span>
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const activeSlot = form.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => set("time")(slot)}
                          aria-pressed={activeSlot}
                          className={`h-10 rounded-lg border text-sm font-semibold transition-colors ${
                            activeSlot
                              ? "border-accent bg-accent text-white"
                              : "border-line-strong bg-surface text-ink hover:border-ink"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.time}</p>
                  )}
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">
                    Preferred location
                  </span>
                  <select
                    value={form.location}
                    onChange={(e) => set("location")(e.target.value)}
                    className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
                  >
                    {SITE.locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">
                    Additional message
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(e) => set("message")(e.target.value)}
                    rows={3}
                    className="resize-none rounded-lg border border-line-strong bg-surface p-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
                    placeholder="Anything we should know before your visit?"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                >
                  <CalendarCheck className="size-4" aria-hidden />
                  Confirm Test Drive
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Confirmation({
  vehicle,
  form,
  waHref,
  onClose,
}: {
  vehicle: Vehicle;
  form: FormState;
  waHref: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-5">
      <div
        className="relative flex items-center justify-center py-2"
        aria-hidden
      >
        <div className="h-px w-full bg-line" />
        <motion.span
          className="absolute left-0 flex size-9 items-center justify-center rounded-full bg-accent text-white"
          initial={{ left: "0%" }}
          animate={{ left: "calc(100% - 2.25rem)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <Check className="size-4" />
        </motion.span>
        <MapPin className="absolute right-0 size-6 text-accent" />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-mist p-4 text-sm">
        <dt className="font-semibold text-muted">Vehicle</dt>
        <dd className="text-ink">{vehicleFullTitle(vehicle)}</dd>
        <dt className="font-semibold text-muted">Date</dt>
        <dd className="text-ink">{form.date}</dd>
        <dt className="font-semibold text-muted">Time</dt>
        <dd className="text-ink">{form.time}</dd>
        <dt className="font-semibold text-muted">Location</dt>
        <dd className="text-ink">{form.location}</dd>
      </dl>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-[#053019] transition-colors hover:bg-[#20bd5a]"
      >
        <WhatsAppIcon className="size-5" />
        Open WhatsApp again
      </a>
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-muted hover:text-ink"
      >
        Done
      </button>
    </div>
  );
}

const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
    type?: string;
    min?: string;
    autoComplete?: string;
  }
>(function TextField(
  { label, value, onChange, error, required, type = "text", min, autoComplete },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <input
        ref={ref}
        type={type}
        min={min}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-11 rounded-lg border bg-surface px-3 text-sm text-ink outline-none transition-colors focus-visible:ring-4 focus-visible:ring-accent/15 ${
          error
            ? "border-red-400 focus-visible:border-red-500"
            : "border-line-strong focus-visible:border-accent"
        }`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
});
