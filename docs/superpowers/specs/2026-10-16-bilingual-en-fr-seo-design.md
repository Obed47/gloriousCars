# Bilingual EN/FR site with browser-language auto-detection

Status: approved for planning (design approved in chat 2026-10-16)
Audience: implementer (writing-plans / executing-plans)

## 1. Context

Glorious Cars targets car buyers in Yaoundé and Douala, Cameroon — both
majority-Francophone cities. The site is currently English-only. The
business wants visitors whose browser is set to French to automatically see
a French version, for both UX and local SEO (ranking for French-language
searches like "voiture à vendre à Yaoundé").

This follows directly from the SEO hardening done earlier in this session
(fixing `NEXT_PUBLIC_SITE_URL` to `https://gloriouscars237.com`, and
reinforcing Yaoundé/Douala signals in metadata, keywords and JSON-LD). The
URL strategy chosen here is deliberately designed not to disturb the
canonical URLs and sitemap entries already established for the English
site.

### Why this is architectural, not bounded

This restructures routing for the entire `src/app/` tree, introduces a new
`proxy.ts` (locale detection), and changes URL structure (adds `/fr/...`).
URL structure is hard to reverse once search engines index it, which is why
this went through the full brainstorming process rather than being treated
as a bounded change.

### Constraint specific to this codebase

Per `AGENTS.md`, this project runs a modified Next.js (16.3.3) where:
- `middleware.ts` is **deprecated and renamed to `proxy.ts`** (exported
  function `proxy`, not `middleware`). Using `middleware.ts` would silently
  never run.
- `next/root-params` (introduced in v16.3.0, i.e. the version this project
  is on) provides locale access in Server Components without prop-drilling.
- Third-party i18n libraries (`next-intl`, etc.) target the pre-rename
  `middleware` convention and are not verified to work with `proxy.ts` on
  this fork. **Decision: no third-party i18n library — a small
  custom implementation using the native `app/[lang]/` + `proxy.ts` +
  `next/root-params` primitives documented in
  `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`.**

## 2. Decisions already made (do not re-open without checking with the user)

These were resolved via explicit Q&A during design and are inputs to the
plan, not choices for the implementer to revisit:

1. **Vehicle content (name, description, specs) stays in English on both
   language versions.** No Supabase schema change, no admin form change.
   Only static UI labels/chrome are translated (see §4).
2. **A manual EN/FR switcher is included** alongside auto-detection (small
   control in Navbar/Footer), so a visitor isn't stuck with the
   browser-detected choice.
3. **Full public site is translated now** (not phased): Home, Cars listing,
   vehicle detail template, About, Services, Contact, Privacy, Terms,
   Favorites, Compare, and all shared chrome (Navbar, Footer,
   FloatingWhatsApp, TestDriveModal, ContactForm, CompareTray, error/404
   pages).
4. **Admin and login stay English-only**, forced regardless of browser
   language — internal staff tool, not a translation target.
5. **URL strategy: default locale (English) stays unprefixed; French is
   prefixed with `/fr/`.** This was chosen over the Next.js docs' literal
   example (prefixing every locale, e.g. `/en-US/...`) specifically to avoid
   breaking the canonical URLs, sitemap and Open Graph links already fixed
   this session. It was chosen over a single-URL/no-distinct-French-URL
   approach because Google cannot independently index or rank a language
   version that has no URL of its own.

## 3. Routing architecture

### 3.1 File layout

Everything currently under `src/app/` (including `admin/` and `login/`)
moves one level deeper into `src/app/[lang]/`, which becomes the site's
**single root layout** (defines `<html lang={lang}>`, loads `globals.css`,
the Montserrat font, `Providers`, `SiteJsonLd`, skip-link, Navbar, Footer,
`FloatingWhatsApp`, `CompareTray` — same content as today's
`src/app/layout.tsx`, just relocated and made locale-aware).

Stay exactly where they are at the true `src/app/` root — these are
response-producing file conventions, not pages, and don't need a layout
tree:
- `sitemap.ts`, `robots.ts`, `manifest.ts`
- `favicon.ico`, `icon.svg`
- `global-error.tsx` (already self-contained with its own `<html>/<body>`,
  per Next.js convention this file can only live at the true app root)

Move with everything else, nested one level deeper under `[lang]`:
- `page.tsx`, `about/`, `services/`, `contact/`, `privacy/`, `terms/`,
  `cars/` (including `cars/[brand]/[slug]/` and its `not-found.tsx`),
  `compare/`, `favorites/`, `admin/`, `login/`, `error.tsx`, `not-found.tsx`.

`generateStaticParams` on `src/app/[lang]/layout.tsx`:
```ts
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}
```
Admin/login remain dynamically rendered (they already call
`requireStaff()`/`getSession()`, which read cookies), so this does not
cause a wasted "French admin" static build — Next.js renders those
per-request regardless of the parent's `generateStaticParams`.

### 3.2 `src/proxy.ts` (not `middleware.ts`)

Runs on every request (via `matcher`, excluding `_next/static`,
`_next/image`, `favicon.ico`, `icon.svg`, `robots.txt`, `sitemap.xml`,
`manifest.webmanifest`, and other static file extensions — negative-match
pattern as shown in this fork's `proxy.js` file-convention docs).

Resolution order for the incoming pathname `P`:

1. **`P === "/en"` or starts with `"/en/"`** → redirect (308, permanent) to
   `P` with the `/en` prefix stripped (`/` if that leaves empty). This
   prevents `/en/...` from ever becoming a second, indexable copy of the
   English pages — it only ever exists as an internal rewrite target, never
   a public URL.
2. **`P === "/admin"` / starts with `"/admin/"`, or `P === "/login"` /
   starts with `"/login/"`** → rewrite (not redirect) to `/en${P}`.
   Visible URL is unchanged. Locale is always `"en"` here — never
   negotiated, never redirected to `/fr`, regardless of cookie or
   `Accept-Language`.
3. **`P === "/fr"` or starts with `"/fr/"`** → pass through
   (`NextResponse.next()`); the file router already resolves this
   correctly since `fr` is a literal matching segment. Refresh the
   `NEXT_LOCALE=fr` cookie here too, so a later unprefixed link still
   honors the visitor's standing choice.
4. **Anything else (unprefixed public path)**:
   - Read the `NEXT_LOCALE` cookie if present and valid (`"en"` or
     `"fr"`).
   - Otherwise negotiate from the `Accept-Language` header: parse the
     comma-separated list, sort by `q` weight, take the top tag, and treat
     it as French if its primary subtag is `fr` (covers `fr`, `fr-FR`,
     `fr-CM`, `fr-CA`, …). No new dependency (no `negotiator` /
     `@formatjs/intl-localematcher`) — a two-locale system doesn't need a
     general-purpose negotiation library; a ~10-line parser is enough and
     avoids relying on a package not verified against this fork's
     Node-runtime-only proxy.
   - If the resolved locale is `"fr"` → **redirect** (307) to `/fr${P}`
     and set `NEXT_LOCALE=fr` (path `/`, 1-year expiry).
   - Otherwise (resolved `"en"`, whether from cookie or default) →
     **rewrite** (not redirect) to `/en${P}`. Visible URL stays
     unprefixed. Refresh the `NEXT_LOCALE=en` cookie if one is already set
     (keeps an explicit manual choice sticky; doesn't plant a cookie for
     silent default-English visitors who never chose anything, so they
     remain open to future `Accept-Language` detection, e.g. if they are
     using a shared/public computer).

This is the "default locale unprefixed, others prefixed" pattern (the same
behavior `next-intl`'s `localePrefix: "as-needed"` provides), reimplemented
natively because of the third-party-library risk noted in §1.

### 3.3 Manual language switcher

A small client component in the Navbar and Footer. Given the current
resolved `lang` (passed down from the server root layout — client
components can't call `next/root-params` directly) and the current
`usePathname()`:
- If `lang === "fr"`, the target is the current path with the leading
  `/fr` stripped.
- If `lang === "en"`, the target is `/fr` + the current (unprefixed) path.

Clicking it sets the `NEXT_LOCALE` cookie to the target locale and performs
a full navigation to the target path (not a soft client-side transition
racing a just-set cookie) — correctness over a marginal perceived-speed
gain here.

## 4. Content & translation mechanism

- `src/i18n/locales.ts` — `LOCALES = ["en", "fr"]`, `Locale` type,
  `DEFAULT_LOCALE = "en"`.
- `src/i18n/dictionaries/en.ts` and `fr.ts` — nested-namespace string
  objects (`nav`, `footer`, `home`, `cars`, `vehicleDetail`, `about`,
  `services`, `contact`, `privacy`, `terms`, `favorites`, `compare`,
  `testDrive`, `contactForm`, `statusBadges`, `specLabels`, `notFound`,
  `error`, `languageSwitcher`, `common`). `fr.ts`'s type is derived from
  `en.ts`'s shape, so a missing French key is a **TypeScript build error**,
  not a silent fallback to English — translation completeness is enforced
  by the compiler.
- `src/i18n/get-dictionary.ts` — server-only helper that calls
  `lang()` from `next/root-params` and returns the matching dictionary.
  Usable from any Server Component or server-side utility without prop
  drilling, per this fork's `next/root-params` docs.
- `src/i18n/dictionary-context.tsx` — `"use client"` Context Provider,
  populated once in `src/app/[lang]/layout.tsx` with the resolved
  dictionary (plain serializable object, crosses the server/client
  boundary as a prop with no issue) and a `useDictionary()` hook for
  client components (Navbar, Footer, TestDriveModal, ContactForm,
  CompareTray, FloatingWhatsApp, InventoryBrowser filters, the language
  switcher itself).
- `SITE` config (`src/lib/site.ts`): `tagline`/`description` become a
  `Record<Locale, { tagline: string; description: string }>` (or a
  parallel `SITE_COPY` map) — written as real French marketing copy
  targeting actual French search phrasing for Cameroon ("voiture à vendre
  à Yaoundé", "voiture d'occasion Douala", "essai de conduite",
  "concessionnaire automobile"), not a literal translation of the English
  copy. Business name, phone, email, address are not translated.
- **Vehicle content passthrough**: `vehicle.name`, `vehicle.description`,
  `vehicle.brand`, `vehicle.fuelType`, `vehicle.transmission`,
  `vehicle.color`, `vehicle.location`, `vehicle.reference` render exactly
  as stored, unchanged by locale, per decision §2.1. Only the labels around
  them ("Mileage", "Gearbox", "Available in…", "Reference") come from the
  dictionary.

## 5. SEO wiring

- **Self-referencing canonical per locale.** The French page's canonical
  is its own URL (`/fr/cars`), never the English URL. Getting this backward
  (canonicalizing `fr → en`) would tell Google to ignore the French page
  entirely.
- **Reciprocal hreflang** (`alternates.languages`) on every page pair:
  `{ en: "/path", fr: "/fr/path", "x-default": "/path" }`, set on both the
  English and French versions of that page (not just one direction). Plain
  `fr`/`en` codes, not `fr-CM`/`en-CM` — there is one French version for
  all Francophone visitors, not region-specific content, so region
  sub-tags aren't needed.
- **`sitemap.ts`** emits both URLs for every page (static pages + every
  vehicle detail page), each with the same `alternates.languages` pair, so
  Google discovers both from one source. Same `priority`/`changeFrequency`
  for both locale entries of a given page.
- **`robots.ts`** disallow patterns must also cover the `/fr/` versions of
  `/favorites`, `/compare`, `/login` (currently prefix-matched against the
  English paths only) — `/admin` and `/login` never get an `/fr/` form
  per §3.2 rule 2, but `/favorites` and `/compare` do.
- **JSON-LD** (`SiteJsonLd`, `VehicleJsonLd`, `BreadcrumbJsonLd`):
  site/dealer description and breadcrumb labels localized; vehicle-specific
  fields stay as-is per §4's passthrough rule.
- **`openGraph.locale` / `alternateLocale` per page**: French pages set
  `openGraph.locale: "fr_FR"` and `alternateLocale: ["en_US"]`; English
  pages keep `en_US` and gain `alternateLocale: ["fr_FR"]`. This matters
  concretely here because WhatsApp (this business's primary conversion
  channel, per `SITE.whatsappNumber`) renders link previews from these
  Open Graph tags.
- **`<html lang>`** is set dynamically per locale by the root layout
  (`<html lang={lang}>`), which is also why `[lang]` must be the actual
  root layout rather than a nested segment (a nested layout cannot mutate
  the `<html>` tag the outer root layout already rendered).

## 6. Non-goals (explicitly out of scope for this pass)

- No Supabase schema change, no admin-form change, no per-vehicle French
  fields (decision §2.1).
- No third-party i18n library (decision §1).
- No region-specific French variants (`fr-CM` vs `fr-FR` content
  differences) — one French version for everyone.
- No translation of `/admin` or `/login` UI.
- No machine-translation API integration.

## 7. Testing impact (for the plan to account for, not resolve here)

- **Component tests** (`tests/components/*`) that render components
  directly, outside the full routing tree, will need either a default
  English dictionary when no `DictionaryProvider` is present, or a shared
  test-setup wrapper that supplies one — otherwise every test asserting
  exact English copy breaks at once. Pick one approach in the plan and
  apply it consistently, rather than patching tests ad hoc.
- **E2E tests** (`tests/e2e/*`, Playwright) navigate the running app and
  assert English copy/paths at unprefixed URLs. These should keep passing
  unchanged as long as Playwright's browser context doesn't set a French
  `Accept-Language`/locale (confirm `playwright.config.ts` doesn't set
  `locale: "fr-FR"` anywhere; if it's unset or `en-US`, default-English
  behavior is preserved). Add new E2E coverage for: first-visit French
  redirect, the manual switcher, and that `/fr/...` 404s correctly for a
  nonexistent vehicle.
- **Unit tests** referencing hardcoded route strings (e.g.
  `tests/unit/whatsapp.test.ts`, `tests/unit/slug.test.ts`) are unaffected
  — slugs and WhatsApp number formatting don't change; only the
  surrounding message copy does, and only where that copy is
  dictionary-driven.
- `scripts/e2e-env.mjs` / `tests/e2e/fixtures/catalogue.json` are unaffected
  (vehicle content stays English/unchanged).

## 8. Risk notes

- The single biggest risk is accidentally changing an existing canonical
  English URL (e.g. `/cars/toyota/...`) during the `[lang]` restructuring.
  The plan must verify, post-migration, that every URL in the current
  sitemap output is byte-identical to before (only the response's internal
  rendering path changed, not what's requested).
- Multiple root layouts were deliberately avoided (see brainstorm chat) by
  nesting `admin`/`login` under `[lang]` too and forcing them to `"en"` in
  `proxy.ts`, rather than giving them a separate root layout. This avoids
  duplicating `globals.css`/fonts/`Providers` wiring and the risk of admin
  silently losing its styling — confirm this is actually true in practice
  (admin renders with correct Tailwind styling) as an explicit verification
  step in the plan, not an assumption.
