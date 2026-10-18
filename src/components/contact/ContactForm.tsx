"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useDictionary } from "@/i18n/dictionary-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

export function ContactForm() {
  const dict = useDictionary();
  const SUBJECTS = dict.contact.form.subjects;
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
    dict.contact.form.messageGreeting.replace("{name}", SITE.name),
    ``,
    `${dict.contact.form.subjectLabel}: ${form.subject}`,
    ...(form.name ? [`${dict.contact.form.nameLabel}: ${form.name}`] : []),
    ...(form.email ? [`${dict.contact.form.emailLabel}: ${form.email}`] : []),
    ...(form.phone ? [`${dict.contact.form.phoneLabel}: ${form.phone}`] : []),
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
        <span className="eyebrow text-accent">{dict.contact.form.successEyebrow}</span>
        <h3 className="text-lg font-bold text-ink">
          {dict.contact.form.successHeading}
        </h3>
        <p className="text-sm text-muted">
          {dict.contact.form.successBodyPrefix}{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-accent hover:underline"
          >
            {SITE.email}
          </a>
          {dict.contact.form.successBodySuffix}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-1 text-sm font-medium text-muted hover:text-ink"
        >
          {dict.contact.form.editMessageButton}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">{dict.contact.form.nameLabel}</span>
          <input
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">{dict.contact.form.phoneLabel}</span>
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
        <span className="text-sm font-semibold text-ink">{dict.contact.form.emailLabel}</span>
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
        <span className="text-sm font-semibold text-ink">{dict.contact.form.subjectLabel}</span>
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
        <span className="text-sm font-semibold text-ink">{dict.contact.form.messageLabel}</span>
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
        {dict.contact.form.submitButton}
        <Send className="size-4" aria-hidden />
      </button>
      <p className="text-center text-xs text-muted">
        {dict.contact.form.disclaimer}
      </p>
    </form>
  );
}
