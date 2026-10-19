import type { Metadata } from "next";
import { localePaths } from "@/i18n/alternates";
import { dictionaries } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/locales";
import { SITE } from "@/lib/site";

// Nested under the `[lang]` segment, so this page's own `params` already
// carry `lang` — no need for `next/root-params`'s `lang()` here for the
// metadata, same as src/app/[lang]/cars/page.tsx.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = dictionaries[locale];
  const { canonical, languages } = localePaths("/privacy", locale);

  return {
    title: dict.privacy.metadata.title,
    description: dict.privacy.metadata.description.replace("{name}", SITE.name),
    alternates: { canonical, languages },
  };
}

export default async function PrivacyPage() {
  const dict = await getDictionary();
  const t = dict.privacy;

  return (
    <div className="wrap max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {t.title}
      </h1>
      <p className="mt-3 rounded-lg bg-mist px-4 py-3 text-sm text-muted">
        {t.disclaimer}
      </p>

      <div className="mt-8 flex flex-col gap-6 text-[0.9375rem] leading-relaxed text-muted">
        {t.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">{t.contact.heading}</h2>
          <p>
            {t.contact.prefix}{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-accent hover:underline"
            >
              {SITE.email}
            </a>
            {t.contact.suffix}
          </p>
        </section>
      </div>
    </div>
  );
}
