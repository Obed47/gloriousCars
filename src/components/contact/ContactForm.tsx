"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

const SUBJECTS = [
  "General enquiry",
  "Buying a vehicle",
  "Booking a test drive",
  "Selling my car",
  "Something else",
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const composed = [
    `Hello ${SITE.name},`,
    ``,
    `Subject: ${form.subject}`,
    ...(form.name ? [`Name: ${form.name}`] : []),
    ...(form.email ? [`Email: ${form.email}`] : []),
    ...(form.phone ? [`Phone: ${form.phone}`] : []),
    ``,
    form.message,
  ].join("\n");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend in this build — hand off to WhatsApp, the primary channel.
    window.open(
      buildWhatsAppUrl(composed),
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <span className="eyebrow text-accent">Message ready</span>
        <h3 className="text-lg font-bold text-ink">
          We&apos;ve opened WhatsApp for you
        </h3>
        <p className="text-sm text-muted">
          Send the pre-filled message and our team will reply shortly. Prefer
          email? Write to{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-accent hover:underline"
          >
            {SITE.email}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-1 text-sm font-medium text-muted hover:text-ink"
        >
          Edit message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
            type="tel"
            autoComplete="tel"
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          required
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
          type="email"
          autoComplete="email"
          className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Subject</span>
        <select
          value={form.subject}
          onChange={(e) => set("subject")(e.target.value)}
          className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
        >
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Message</span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          className="resize-none rounded-lg border border-line-strong bg-surface p-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
        />
      </label>

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        <WhatsAppIcon className="size-4" />
        Send via WhatsApp
        <Send className="size-4" aria-hidden />
      </button>
      <p className="text-center text-xs text-muted">
        This opens WhatsApp with your message pre-filled — nothing is sent until
        you press send there.
      </p>
    </form>
  );
}
