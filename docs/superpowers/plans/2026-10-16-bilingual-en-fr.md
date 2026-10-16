# Bilingual EN/FR Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the public site in French automatically when a visitor's browser prefers French, with a manual override, without changing any existing English URL.

**Architecture:** Everything under `src/app/` (admin and login included) moves one level deeper into `src/app/[lang]/`, which becomes the site's single root layout. A new `src/proxy.ts` resolves the locale per request (cookie, then `Accept-Language`, admin/login always forced to English) and either rewrites unprefixed paths to serve `lang="en"` invisibly or redirects to a visible `/fr/...` URL. A small hand-rolled dictionary system (no third-party i18n library) supplies translated UI strings; vehicle content from Supabase is never translated.

**Tech Stack:** Next.js 16.3.3 (this fork: `proxy.ts` not `middleware.ts`; `next/root-params` for locale access in Server Components), React 19, TypeScript, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-bilingual-en-fr-seo-design.md`

## Global Constraints

- Use `src/proxy.ts` exporting `proxy`, never `middleware.ts` — this fork deprecated and renamed it; a `middleware.ts` file would silently never run.
- No third-party i18n library.
- No Supabase schema change, no admin-form change. `vehicle.name`, `vehicle.description`, `vehicle.brand`, `vehicle.fuelType`, `vehicle.transmission`, `vehicle.color`, `vehicle.location`, `vehicle.reference` render identically regardless of locale.
- Every English dictionary string must be byte-identical to the current hardcoded copy it replaces — this is an extraction, not a copy-edit, so existing tests that assert that text keep passing unchanged.
- Cookie name `NEXT_LOCALE`, `path: "/"`, 1-year `maxAge`.
- Default locale `en` stays unprefixed (`/cars`, not `/en/cars`); French is `/fr/...`. A visible `/en/...` URL is never valid — redirect it to the unprefixed path.
- `/admin` and `/login` (now `/[lang]/admin`, `/[lang]/login` on disk) always resolve `lang="en"`, regardless of cookie or `Accept-Language`. This check runs before the generic cookie/header logic, not after.
- hreflang and `openGraph.locale` use plain `en`/`fr` — no region subtags (`fr-CM`), since there is one French version for everyone.
- Every locale's page sets its own self-referencing canonical. Never canonicalize the French page back to the English URL.
- `next/root-params`'s `lang()` only works in Server Components. Client components receive the resolved dictionary via `useDictionary()` (`DictionaryProvider` in the root layout), not by calling `lang()` themselves.
- `manifest.ts` stays English-only (it's a single static resource outside the `[lang]` tree, not a non-goal oversight — recorded in the spec §6).

## Review Focus

- A visitor with no `Accept-Language` header at all (some bots, privacy-focused browsers) must default to English, not throw. → Task 2.
- A tampered/garbage `NEXT_LOCALE` cookie value (anything other than `"en"`/`"fr"`) must be treated as absent, not as a third locale. → Task 2.
- A visitor with a `NEXT_LOCALE=fr` cookie who requests `/admin` or `/login` must still get English — the admin/login override must short-circuit before the cookie is ever consulted. → Task 2.
- Someone manually requesting `/en/cars` must be redirected to `/cars`, never rendered as a second, indexable copy. → Task 2.
- `/fr/cars/<brand>/<nonexistent-slug>` must 404 correctly through the vehicle-specific `not-found.tsx`, which is now nested two levels deeper (`[lang]/cars/[brand]/[slug]/not-found.tsx`) — the restructuring must not shadow or break it. → Task 3.

---

## Task 1: i18n core utilities

**Files:**
- Create: `src/i18n/locales.ts`
- Create: `src/i18n/dictionaries/en.ts`
- Create: `src/i18n/dictionaries/fr.ts`
- Create: `src/i18n/dictionaries/index.ts`
- Create: `src/i18n/get-dictionary.ts`
- Create: `src/i18n/dictionary-context.tsx`
- Create: `src/i18n/alternates.ts`
- Test: `tests/unit/i18n/get-dictionary.test.ts`
- Test: `tests/unit/i18n/dictionary-context.test.tsx`
- Test: `tests/unit/i18n/alternates.test.ts`

**Interfaces:**
- Produces: `LOCALES: readonly ["en", "fr"]`, `type Locale = "en" | "fr"`, `DEFAULT_LOCALE: Locale = "en"`, `LOCALE_COOKIE = "NEXT_LOCALE"` (all from `src/i18n/locales.ts`).
- Produces: `type Dictionary` (from `src/i18n/dictionaries/en.ts`, `typeof en`), `dictionaries: Record<Locale, Dictionary>` (from `index.ts`). The initial `en`/`fr` objects contain only two namespaces for now — `common` (e.g. `common.viewSite`, `common.loading`) and `nav` (the five `Footer`/`Navbar` link labels: Home, Cars, About, Services, Contact) and `languageSwitcher` (e.g. `languageSwitcher.switchToFrench`, `languageSwitcher.switchToEnglish`) — every later content task adds its own top-level namespace to both files.
- Produces: `getDictionary(): Promise<Dictionary>` (server-only, reads `next/root-params`'s `lang()`).
- Produces: `DictionaryProvider({ dictionary, children }): JSX.Element` and `useDictionary(): Dictionary` (client; falls back to the English dictionary with a `console.warn` in development if no provider is present — this is what keeps every existing component test passing unchanged until a test explicitly wraps with a French provider).
- Produces: `localePaths(unprefixedPath: string, locale: Locale): { canonical: string; languages: { en: string; fr: string; "x-default": string } }`. For `unprefixedPath = "/"`, the French path is `/fr`; for any other path, it's `/fr${unprefixedPath}`. `canonical` is the French path when `locale === "fr"`, otherwise `unprefixedPath`. `languages.en`/`languages["x-default"]` are always `unprefixedPath`; `languages.fr` is always the French path.

- [ ] **Step 1: Write failing tests for `localePaths`**

```ts
// tests/unit/i18n/alternates.test.ts
test("root path", () => {
  expect(localePaths("/", "en")).toEqual({
    canonical: "/",
    languages: { en: "/", fr: "/fr", "x-default": "/" },
  });
});
test("nested path, french locale canonicalizes to the french url", () => {
  expect(localePaths("/cars", "fr")).toEqual({
    canonical: "/fr/cars",
    languages: { en: "/cars", fr: "/fr/cars", "x-default": "/cars" },
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail** (`npx vitest run tests/unit/i18n/alternates.test.ts`) with "Cannot find module".

- [ ] **Step 3: Implement `src/i18n/locales.ts` and `src/i18n/alternates.ts`** per the signatures above.

- [ ] **Step 4: Run tests, confirm they pass.**

- [ ] **Step 5: Write failing tests for the dictionary system**

```ts
// tests/unit/i18n/get-dictionary.test.ts
vi.mock("next/root-params", () => ({ lang: vi.fn() }));
test("returns the french dictionary when lang() resolves fr", async () => { ... });
test("falls back to english when lang() resolves an unknown value", async () => { ... });
```
```tsx
// tests/unit/i18n/dictionary-context.test.tsx
test("useDictionary returns the english dictionary when no provider is present", () => { ... });
test("useDictionary returns the provided dictionary inside DictionaryProvider", () => { ... });
```

- [ ] **Step 6: Run tests, confirm they fail.**

- [ ] **Step 7: Implement `src/i18n/dictionaries/en.ts`, `fr.ts`, `index.ts`, `get-dictionary.ts`, `dictionary-context.tsx`.** `fr.ts` is typed as `const fr: Dictionary = {...}` (imported from `en.ts`) so a missing French key is a compile error.

- [ ] **Step 8: Run tests, confirm they pass. Run `npx tsc --noEmit`, confirm no errors.**

- [ ] **Step 9: Commit**

```bash
git add src/i18n tests/unit/i18n
git commit -m "feat(i18n): add locale, dictionary and alternates core utilities"
```

---

## Task 2: Locale resolution logic + `proxy.ts`

**Files:**
- Create: `src/i18n/resolve-locale.ts`
- Create: `src/proxy.ts`
- Test: `tests/unit/i18n/resolve-locale.test.ts`

**Interfaces:**
- Consumes: `Locale`, `DEFAULT_LOCALE`, `LOCALE_COOKIE` from `src/i18n/locales.ts` (Task 1).
- Produces: `type LocaleAction = { kind: "next" } | { kind: "rewrite"; path: string } | { kind: "redirect"; path: string }`.
- Produces: `prefersFrench(acceptLanguage: string | null): boolean` — parses a comma-separated `Accept-Language` value, sorts entries by `;q=` weight (default `1` when absent), and returns whether the top entry's primary subtag (text before any `-`) is `"fr"`. Returns `false` for `null`/empty input.
- Produces: `resolveLocaleAction(pathname: string, cookieLocale: string | null, acceptLanguage: string | null): LocaleAction`, implementing the cascade below exactly (order matters — admin/login must be checked before the cookie is read):
  1. `pathname === "/en"` or starts with `"/en/"` → `{ kind: "redirect", path: <pathname with the leading "/en" removed, or "/" if that is empty> }`.
  2. `pathname === "/admin"`, starts with `"/admin/"`, `pathname === "/login"`, or starts with `"/login/"` → `{ kind: "rewrite", path: "/en" + pathname }`.
  3. `pathname === "/fr"` or starts with `"/fr/"` → `{ kind: "next" }`.
  4. Otherwise: let `locale = cookieLocale === "en" || cookieLocale === "fr" ? cookieLocale : (prefersFrench(acceptLanguage) ? "fr" : DEFAULT_LOCALE)`. If `locale === "fr"` → `{ kind: "redirect", path: "/fr" + (pathname === "/" ? "" : pathname) }`. Otherwise → `{ kind: "rewrite", path: "/en" + pathname }`.
- Produces: `proxy(request: NextRequest): NextResponse` (default export) and `config = { matcher: [...] }` in `src/proxy.ts`. Thin adapter: reads `request.nextUrl.pathname`, `request.cookies.get(LOCALE_COOKIE)?.value ?? null`, `request.headers.get("accept-language")`, calls `resolveLocaleAction`, and translates its result into `NextResponse.next()` / `.rewrite(new URL(path, request.url))` / `.redirect(new URL(path, request.url))`. On every `"redirect"` to an `/fr...` path, and on every `"next"` for an already-`/fr` path, sets `response.cookies.set(LOCALE_COOKIE, "fr", { path: "/", maxAge: 60 * 60 * 24 * 365 })`. The `matcher` excludes `_next/static`, `_next/image`, `favicon.ico`, `icon.svg`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, and common static-file extensions, following the negative-match pattern in this fork's `proxy.js` file-convention docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, "Negative matching").

- [ ] **Step 1: Write failing tests covering every Review Focus case and the happy paths**

```ts
// tests/unit/i18n/resolve-locale.test.ts
test("no accept-language header defaults to english", () => {
  expect(resolveLocaleAction("/cars", null, null)).toEqual({ kind: "rewrite", path: "/en/cars" });
});
test("garbage cookie value is treated as absent, falls through to accept-language", () => {
  expect(resolveLocaleAction("/cars", "xx", "fr-FR")).toEqual({ kind: "redirect", path: "/fr/cars" });
});
test("admin is forced to english even with a french cookie", () => {
  expect(resolveLocaleAction("/admin", "fr", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/admin" });
});
test("login is forced to english even with a french cookie", () => {
  expect(resolveLocaleAction("/login", "fr", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/login" });
});
test("a visible /en path redirects to the unprefixed path", () => {
  expect(resolveLocaleAction("/en/cars", null, null)).toEqual({ kind: "redirect", path: "/cars" });
});
test("bare /en redirects to /", () => {
  expect(resolveLocaleAction("/en", null, null)).toEqual({ kind: "redirect", path: "/" });
});
test("a /fr path passes through untouched", () => {
  expect(resolveLocaleAction("/fr/cars", null, null)).toEqual({ kind: "next" });
});
test("unprefixed root with french accept-language redirects to /fr", () => {
  expect(resolveLocaleAction("/", null, "fr-CM,fr;q=0.9,en;q=0.5")).toEqual({ kind: "redirect", path: "/fr" });
});
test("existing english cookie takes priority over a french accept-language header", () => {
  expect(resolveLocaleAction("/cars", "en", "fr-FR")).toEqual({ kind: "rewrite", path: "/en/cars" });
});

// prefersFrench
test.each([
  ["fr-CM,fr;q=0.9,en;q=0.5", true],
  ["en-US,en;q=0.9", false],
  ["", false],
  [null, false],
])("prefersFrench(%s) -> %s", (header, expected) => {
  expect(prefersFrench(header)).toBe(expected);
});
```

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Implement `src/i18n/resolve-locale.ts`** per the cascade above.

- [ ] **Step 4: Run tests, confirm they pass.**

- [ ] **Step 5: Implement `src/proxy.ts`** as the thin adapter described above. No test file for this step — it has no logic of its own beyond wiring, and `next`'s proxy runtime isn't something Vitest exercises directly; Task 3's build and e2e checks are what exercise it end-to-end.

- [ ] **Step 6: Run `npx tsc --noEmit`, confirm no errors.**

- [ ] **Step 7: Commit**

```bash
git add src/i18n/resolve-locale.ts src/proxy.ts tests/unit/i18n/resolve-locale.test.ts
git commit -m "feat(i18n): add locale resolution logic and proxy.ts"
```

---

## Task 3: Restructure `src/app/` under `[lang]` and wire it up

**Files:**
- Move (via `git mv`, preserving history) into `src/app/[lang]/`: `about/`, `admin/`, `cars/`, `compare/`, `contact/`, `error.tsx`, `favorites/`, `login/`, `not-found.tsx`, `page.tsx`, `privacy/`, `services/`, `terms/`, `layout.tsx`.
- Stay in place (unchanged this task): `sitemap.ts`, `robots.ts`, `manifest.ts`, `favicon.ico`, `icon.svg`, `global-error.tsx`.
- Modify: `src/app/[lang]/layout.tsx` (post-move).

**Interfaces:**
- Consumes: `getDictionary()`, `DictionaryProvider` (Task 1); `proxy` (Task 2, already created, now takes effect because the `[lang]` tree it targets exists).
- Produces: every existing route reachable at its current unprefixed URL (via `proxy`'s rewrite) plus a parallel `/fr/...` URL, with no other behavior change yet (translation is Tasks 4–10; this task is pure plumbing).

- [ ] **Step 1: Capture the pre-move URL baseline.** Run `npm run build`, then:
  ```bash
  grep -oE '<loc>[^<]*</loc>' .next/server/app/sitemap.xml.body | sort > /tmp/sitemap-before.txt
  ```
  (scratchpad is fine too; this file is only compared against in Step 7, not committed).

- [ ] **Step 2: Move the files.** `zsh` treats `[` and `]` as glob characters, so quote the destination path on every command:
  ```bash
  mkdir -p 'src/app/[lang]'
  git mv src/app/about 'src/app/[lang]/about'
  git mv src/app/admin 'src/app/[lang]/admin'
  git mv src/app/cars 'src/app/[lang]/cars'
  git mv src/app/compare 'src/app/[lang]/compare'
  git mv src/app/contact 'src/app/[lang]/contact'
  git mv src/app/error.tsx 'src/app/[lang]/error.tsx'
  git mv src/app/favorites 'src/app/[lang]/favorites'
  git mv src/app/login 'src/app/[lang]/login'
  git mv src/app/not-found.tsx 'src/app/[lang]/not-found.tsx'
  git mv src/app/page.tsx 'src/app/[lang]/page.tsx'
  git mv src/app/privacy 'src/app/[lang]/privacy'
  git mv src/app/services 'src/app/[lang]/services'
  git mv src/app/terms 'src/app/[lang]/terms'
  git mv src/app/layout.tsx 'src/app/[lang]/layout.tsx'
  ```

- [ ] **Step 3: Fix the two relative imports in the moved `layout.tsx`** that pointed at siblings of the old `src/app/` and are now one level too shallow: `import "./globals.css"` → `import "../globals.css"`; the font `src: "../fonts/montserrat-variable.woff2"` → `src: "../../fonts/montserrat-variable.woff2"`.

- [ ] **Step 4: Update `src/app/[lang]/layout.tsx`'s component signature and body.** Add:
  ```ts
  export async function generateStaticParams() {
    return [{ lang: "en" }, { lang: "fr" }];
  }
  ```
  Change the function to `RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: Locale }> })`, read `const { lang } = await params;`, set `<html lang={lang} ...>` (was the hardcoded `"en"`), fetch `const dictionary = await getDictionary();`, and wrap the existing body contents in `<DictionaryProvider dictionary={dictionary}>...</DictionaryProvider>` inside `<Providers>`.

- [ ] **Step 5: Search the moved tree for any other relative import that points outside its own subtree** (`grep -rn 'from "\.\./\.\./' 'src/app/[lang]'`, excluding `@/`-aliased imports, which are depth-independent) and fix any found. Expect none beyond Step 3's two.

- [ ] **Step 6: Run `npm run build`.** Fix any TypeScript or build error before continuing — do not proceed with a broken build.

- [ ] **Step 7: Diff the sitemap baseline.**
  ```bash
  grep -oE '<loc>[^<]*</loc>' .next/server/app/sitemap.xml.body | sort > /tmp/sitemap-after.txt
  diff /tmp/sitemap-before.txt /tmp/sitemap-after.txt
  ```
  Expected: no diff (sitemap content is untouched by this task; Task 11 is what adds the `/fr` entries).

- [ ] **Step 8: Run the full existing test suite** (`npm run test` and `npm run typecheck`). Expect all passing, unchanged — this task does not alter any component's behavior, only its file location and the locale plumbing around it.

- [ ] **Step 8b: Confirm `playwright.config.ts` does not set a French browser locale** (`grep -n "locale" playwright.config.ts`) — if it sets `locale: "fr-FR"` or similar, every existing e2e test would now hit the first-visit French redirect and break. Expect no match, or an explicit `"en-US"`; if a French locale is set, add `locale: "en-US"` to the Playwright config so existing English-path e2e tests keep testing the English path.

- [ ] **Step 9: Smoke-check `/admin` and `/login` still render correctly.** Start `npm run dev` (or reuse the production server from Step 6 via `npm run start`), request `/login` and `/admin` (the latter redirects to `/login` when signed out — confirm that redirect still happens), and confirm the response is styled HTML (Tailwind classes applied), not an unstyled error page.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: restructure src/app under [lang], wire proxy and dynamic html lang"
```

---

## Task 4: Navbar, Footer, and the manual language switcher

**Files:**
- Create: `src/components/site/LanguageSwitcher.tsx`
- Modify: `src/components/site/Navbar.tsx`
- Modify: `src/components/site/Footer.tsx`
- Test: `tests/components/language-switcher.test.tsx` (new)
- Test: existing `tests/components/*` files covering Navbar/Footer, if any — confirm unchanged, do not add French assertions here.

**Interfaces:**
- Consumes: `useDictionary()` (Task 1); dictionary namespaces `common`, `nav`, `languageSwitcher` (Task 1).
- Produces: `LanguageSwitcher({ locale }: { locale: Locale }): JSX.Element` — reads `usePathname()`, computes the other locale's path (strip/prepend `/fr` on the current pathname, mirroring `localePaths`' math), and on click sets `document.cookie = \`${LOCALE_COOKIE}=<target>; path=/; max-age=31536000\`` (importing `LOCALE_COOKIE` from `src/i18n/locales.ts`, Task 1 — never a re-typed `"NEXT_LOCALE"` literal) then navigates with `window.location.href = target` (a full navigation, not a client-side transition, so the cookie is guaranteed to be in place before `proxy` runs on the next request).

- [ ] **Step 1: Write the failing test for `LanguageSwitcher`**

```tsx
test("on the english site, the switcher links to the french version of the current path", () => {
  vi.mocked(usePathname).mockReturnValue("/cars");
  render(<LanguageSwitcher locale="en" />);
  expect(screen.getByRole("link", { name: /français/i })).toHaveAttribute("href", "/fr/cars");
});
test("on the french site, the switcher links to the unprefixed english path", () => {
  vi.mocked(usePathname).mockReturnValue("/fr/cars");
  render(<LanguageSwitcher locale="fr" />);
  expect(screen.getByRole("link", { name: /english/i })).toHaveAttribute("href", "/cars");
});
```

- [ ] **Step 2: Run test, confirm it fails.**

- [ ] **Step 3: Implement `LanguageSwitcher`** per the interface above.

- [ ] **Step 4: Run test, confirm it passes.**

- [ ] **Step 5: Wire `dict.nav.*` into `Navbar.tsx`'s `LINKS` labels** (extract the current five hardcoded labels — Home/Cars/About/Services/Contact — to `dict.nav.home` etc., values byte-identical to today), and add `<LanguageSwitcher locale={locale} />` to the navbar (Navbar becomes locale-aware: either it already receives `locale`/`dict` as props from the root layout, or reads them via `useDictionary()` — use the hook, since Navbar is a client component).

- [ ] **Step 6: Wire the same `dict.nav.*` keys into `Footer.tsx`'s `NAV` array**, and add the switcher there too.

- [ ] **Step 7: Run the full existing test suite.** Confirm every test that renders Navbar/Footer still passes unchanged (English dictionary default from Task 1 keeps the rendered text identical to before).

- [ ] **Step 8: Commit**

```bash
git add src/components/site/LanguageSwitcher.tsx src/components/site/Navbar.tsx src/components/site/Footer.tsx src/i18n/dictionaries tests/components/language-switcher.test.tsx
git commit -m "feat(i18n): translate nav/footer chrome, add manual language switcher"
```

---

## Task 5: Home page

**Files:**
- Modify: `src/app/[lang]/page.tsx`
- Modify: `src/components/home/Hero.tsx`, `QuickSearch.tsx`, `FeaturedVehicles.tsx`, `OilService.tsx`, `AboutStrip.tsx`, `WhyChooseUs.tsx`, `HowItWorks.tsx`, `BrandStrip.tsx`, `Testimonials.tsx`, `HomeCta.tsx`
- Test: existing `tests/components/*` covering these — confirm unchanged.
- Test: new test(s) rendering at least `Hero` and `HomeCta` with the French dictionary, asserting representative French strings.

**Interfaces:**
- Consumes: `getDictionary()`, `localePaths()` (Task 1); `dict.home.*` (new namespace this task defines, covering every static string in the listed components); `useDictionary()` for any of the listed components that are client components.
- Produces: `generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata>` replacing the current static `export const metadata` in `src/app/[lang]/page.tsx`, setting locale-appropriate `title`/`description`, `alternates` from `localePaths("/", lang)`, and `openGraph.locale`/`alternateLocale` (`en_US`/`fr_FR`, each the other's alternate).

- [ ] **Step 1: Write failing tests** asserting French output for `Hero` (headline/CTA) and `HomeCta`, following the pattern from Task 4's switcher test (wrap with `DictionaryProvider` carrying the French dictionary).

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Extract every hardcoded string in the ten listed components into `dict.home.*`** (English values byte-identical to current copy), threading the dictionary through via `useDictionary()` (all ten are client-rendered marketing sections already using hooks like `useScroll`/`usePrefersReducedMotion`, confirm each file's "use client" status while editing). Write the French copy using real Cameroon-market phrasing (not literal translation), per the spec §4/§5.

- [ ] **Step 4: Convert `src/app/[lang]/page.tsx`'s metadata export to `generateMetadata`** per the interface above. Title/description text: French equivalents of the current English ones (e.g. "Voitures à vendre à Yaoundé et Douala, Cameroun"), consistent with the spec's example phrasing.

- [ ] **Step 5: Run tests, confirm they pass. Run the full existing suite, confirm it's still unchanged for the English path.**

- [ ] **Step 6: Commit**

```bash
git add src/app/'[lang]'/page.tsx src/components/home src/i18n/dictionaries tests
git commit -m "feat(i18n): translate home page and its metadata"
```

---

## Task 6: Cars listing page

**Files:**
- Modify: `src/app/[lang]/cars/page.tsx`
- Modify: `src/components/cars/InventoryBrowser.tsx`, `FilterPanel.tsx`, `SortSelect.tsx`
- Modify: `src/components/vehicles/VehicleCard.tsx`, `VehicleGrid.tsx`
- Test: existing component tests for the above — confirm unchanged.
- Test: new French-dictionary test(s) for `InventoryBrowser` filter labels and `VehicleCard`'s static chrome (not the vehicle data itself).

**Interfaces:**
- Consumes: same as Task 5 (`getDictionary`, `localePaths`, `useDictionary`), new `dict.cars.*` namespace (filter labels, sort options, empty-state copy, the page's own H1/intro text) and `dict.vehicleCard.*` (badge/button chrome only — never vehicle data).
- Produces: `generateMetadata` for `src/app/[lang]/cars/page.tsx`, same shape as Task 5's, with `localePaths("/cars", lang)`.

- [ ] **Step 1: Write failing French-dictionary tests** for `InventoryBrowser` (a filter label) and `VehicleCard` (a static label such as a "View details" affordance, not the vehicle's own name/price).

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Extract hardcoded strings into `dict.cars.*`/`dict.vehicleCard.*`** across the listed files, byte-identical English values. Confirm no `vehicle.*` field is routed through the dictionary — per Global Constraints, those stay as stored.

- [ ] **Step 4: Convert `cars/page.tsx`'s metadata to `generateMetadata`**, using the French title/description already fixed this session's SEO work as the basis for the English side and writing the French equivalent (e.g. "Voitures à vendre à Yaoundé et Douala").

- [ ] **Step 5: Run tests, confirm they pass. Run the full suite, confirm no regression.**

- [ ] **Step 6: Commit**

```bash
git add src/app/'[lang]'/cars/page.tsx src/components/cars src/components/vehicles/VehicleCard.tsx src/components/vehicles/VehicleGrid.tsx src/i18n/dictionaries tests
git commit -m "feat(i18n): translate cars listing page and filters"
```

---

## Task 7: Vehicle detail page

**Files:**
- Modify: `src/app/[lang]/cars/[brand]/[slug]/page.tsx`
- Modify: `src/components/detail/SpecGrid.tsx`, `AboutVehicle.tsx`, `DetailCTAs.tsx`, `DetailSaveRow.tsx`, `Gallery.tsx` (non-content controls only — thumbnail `alt` text stays derived from vehicle data per Task-independent existing logic)
- Modify: `src/components/detail/VehicleJsonLd.tsx`, `src/components/seo/BreadcrumbJsonLd.tsx`
- Modify: `src/components/ui/Badge.tsx` (status label mapping)
- Test: existing component/detail tests — confirm unchanged.
- Test: new French-dictionary test(s) for `SpecGrid` labels and the status `Badge`.

**Interfaces:**
- Consumes: `getDictionary`, `localePaths`, `useDictionary`; new `dict.vehicleDetail.*` namespace (spec labels "Mileage"/"Fuel"/"Gearbox"/"Reference"/"Available in…", section headings "Key specifications"/"About this vehicle", breadcrumb label "Cars for sale", CTA button text) and `dict.statusBadge.*` (`available`/`reserved`/`sold` — a fixed three-value enum defined in code, distinct from free-text vehicle content, so it is translated).
- Produces: `generateMetadata({ params }: { params: Promise<{ lang: Locale; brand: string; slug: string }> }): Promise<Metadata>` replacing the current one — vehicle name/description stay in English in the generated title/description text per Global Constraints (only the surrounding phrase, e.g. "for sale" / "à vendre", is localized), `alternates` from `localePaths(vehiclePath(vehicle), lang)`, `openGraph.locale`/`alternateLocale` as in Task 5.

- [ ] **Step 1: Write failing tests** for `SpecGrid` (a label, French dictionary) and `Badge`/`statusTone` (status label renders "Disponible"/"Réservé"/"Vendu" under the French dictionary, "Available"/"Reserved"/"Sold" under English — both from the dictionary, not a hardcoded string either way).

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Extract labels/headings into `dict.vehicleDetail.*` and `dict.statusBadge.*`** across the listed files. In `page.tsx`, breadcrumb labels and section headings come from the dictionary; `vehicle.brand`, `vehicle.name`, `vehicle.year`, `vehicle.description`, `vehicle.reference` keep rendering directly from the `Vehicle` object, unchanged.

- [ ] **Step 4: Localize `VehicleJsonLd`'s non-vehicle-data labels and `BreadcrumbJsonLd`'s breadcrumb names** (e.g. "Cars for sale" / "Voitures à vendre") via the dictionary; vehicle-derived JSON-LD fields (`name`, `description`, `brand`, `fuelType`, etc.) stay as-is.

- [ ] **Step 5: Convert `generateMetadata`** per the interface above.

- [ ] **Step 6: Run tests, confirm they pass. Run the full suite, confirm no regression.**

- [ ] **Step 7: Commit**

```bash
git add src/app/'[lang]'/cars/'[brand]'/'[slug]'/page.tsx src/components/detail src/components/seo/BreadcrumbJsonLd.tsx src/components/ui/Badge.tsx src/i18n/dictionaries tests
git commit -m "feat(i18n): translate vehicle detail page, JSON-LD labels and status badges"
```

---

## Task 8: About, Services, Contact

**Files:**
- Modify: `src/app/[lang]/about/page.tsx`, `src/app/[lang]/services/page.tsx`, `src/app/[lang]/contact/page.tsx`
- Modify: `src/components/contact/ContactForm.tsx`
- Modify: `src/components/detail/TestDriveModal.tsx`
- Modify: `src/lib/whatsapp.ts` (signatures change — see Interfaces)
- Test: existing tests for the above — confirm unchanged.
- Test: new French-dictionary test(s) for `ContactForm`'s subject options and `TestDriveModal`'s labels; new tests for the changed `whatsapp.ts` signatures.

**Interfaces:**
- Consumes: `getDictionary`, `localePaths`, `useDictionary`; new `dict.about.*`, `dict.services.*`, `dict.contact.*`, `dict.testDrive.*` namespaces.
- Produces (breaking changes, update all call sites in the same commit): `vehicleInquiryMessage(vehicle: Vehicle, dict: Dictionary): string`, `testDriveMessage(vehicle: Vehicle, details: TestDriveDetails, dict: Dictionary): string`, `generalInquiryMessage(dict: Dictionary): string` — each now builds its label lines (`"Vehicle:"`, `"Reference:"`, `"I'd like to know more..."`, etc.) from `dict.whatsapp.*` instead of inline English literals; the vehicle-derived values they interpolate (`title`, `price`, `vehicle.fuelType`, `vehicle.transmission`, `vehicle.location`) are unchanged.
- Produces: `generateMetadata` for all three pages, same shape as prior tasks.

- [ ] **Step 1: Write failing tests**: `ContactForm` renders French subject options under the French dictionary; `vehicleInquiryMessage`/`testDriveMessage`/`generalInquiryMessage` each have a test asserting the French dictionary produces French label lines while vehicle data (e.g. `fuelType`) still appears verbatim.

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Update `src/lib/whatsapp.ts`'s three message builders** to take a `dict` parameter and source their label lines from `dict.whatsapp.*`, added to both dictionaries.

- [ ] **Step 4: Update every call site of the three functions** — run `grep -rn "vehicleInquiryMessage\|testDriveMessage\|generalInquiryMessage" src tests` (not just `src`: `tests/unit/whatsapp.test.ts` calls all three directly and must pass a dictionary too, or it won't compile) and update each: component call sites (`ContactForm.tsx`, `TestDriveModal.tsx`, `DetailCTAs.tsx`) pass `useDictionary()`'s result; `tests/unit/whatsapp.test.ts`'s existing calls pass the English dictionary (`en` from `src/i18n/dictionaries/en.ts`) so its current assertions keep passing unchanged (English output is byte-identical per Global Constraints), alongside new assertions added for the French dictionary.

- [ ] **Step 5: Extract remaining hardcoded strings** in `about/page.tsx`, `services/page.tsx`, `contact/page.tsx`, `ContactForm.tsx` (including the `SUBJECTS` array), `TestDriveModal.tsx` into their namespaces.

- [ ] **Step 6: Convert the three pages' metadata to `generateMetadata`.**

- [ ] **Step 7: Run tests, confirm they pass. Run the full suite, confirm no regression.**

- [ ] **Step 8: Commit**

```bash
git add src/app/'[lang]'/about src/app/'[lang]'/services src/app/'[lang]'/contact src/components/contact/ContactForm.tsx src/components/detail/TestDriveModal.tsx src/lib/whatsapp.ts src/i18n/dictionaries tests
git commit -m "feat(i18n): translate about/services/contact pages and WhatsApp message templates"
```

---

## Task 9: Privacy, Terms, Favorites, Compare

**Files:**
- Modify: `src/app/[lang]/privacy/page.tsx`, `src/app/[lang]/terms/page.tsx`, `src/app/[lang]/favorites/page.tsx`, `src/app/[lang]/compare/page.tsx`
- Modify: `src/components/site/CompareTray.tsx`
- Test: existing tests for the above — confirm unchanged.
- Test: new French-dictionary test(s) for `CompareTray` and the Favorites/Compare empty states.

**Interfaces:**
- Consumes: `getDictionary`, `localePaths`, `useDictionary`; new `dict.legal.*` (shared body copy structure for privacy/terms — these are long-form legal text, so the dictionary entries are the already-existing English paragraphs verbatim plus their French translation, not restructured), `dict.favorites.*`, `dict.compare.*`.
- Produces: `generateMetadata` for all four pages.

- [ ] **Step 1: Write failing French-dictionary tests** for `CompareTray` (one label) and the Favorites/Compare pages' empty-state copy.

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Extract the four pages' and `CompareTray`'s hardcoded strings into their namespaces.**

- [ ] **Step 4: Convert all four pages' metadata to `generateMetadata`.** Recall `robots: { index: false, follow: true }` on favorites/compare — keep that as-is in both locales (not SEO-visible either way).

- [ ] **Step 5: Run tests, confirm they pass. Run the full suite, confirm no regression.**

- [ ] **Step 6: Commit**

```bash
git add src/app/'[lang]'/privacy src/app/'[lang]'/terms src/app/'[lang]'/favorites src/app/'[lang]'/compare src/components/site/CompareTray.tsx src/i18n/dictionaries tests
git commit -m "feat(i18n): translate privacy, terms, favorites and compare pages"
```

---

## Task 10: Error/not-found pages, FloatingWhatsApp, and site-wide copy

**Files:**
- Modify: `src/app/[lang]/error.tsx`, `src/app/[lang]/not-found.tsx`, `src/app/[lang]/cars/[brand]/[slug]/not-found.tsx`
- Modify: `src/components/site/FloatingWhatsApp.tsx`
- Modify: `src/lib/site.ts` (add `SITE_COPY`)
- Modify: `src/components/seo/SiteJsonLd.tsx`
- Test: existing tests for the above — confirm unchanged.
- Test: new French-dictionary test(s) for the three error/not-found pages and `FloatingWhatsApp`.
- Test: `SiteJsonLd` renders the French `SITE_COPY.description` when given the French dictionary/locale.

**Interfaces:**
- Consumes: `getDictionary`, `useDictionary`; new `dict.errorPage.*`, `dict.notFound.*` namespaces.
- Produces: `SITE_COPY: Record<Locale, { tagline: string; description: string }>` in `src/lib/site.ts`, with `SITE_COPY.en` equal to the existing `SITE.tagline`/`SITE.description` values (so nothing that still reads `SITE.tagline`/`SITE.description` directly — i.e. `manifest.ts`, per Global Constraints — needs to change). `SiteJsonLd` and any other locale-aware consumer switch to `SITE_COPY[locale]`.

- [ ] **Step 1: Write failing tests** for `error.tsx`/`not-found.tsx`/vehicle `not-found.tsx` (French heading text) and `FloatingWhatsApp` (French `aria-label`/tooltip if any).

- [ ] **Step 2: Run tests, confirm they fail.**

- [ ] **Step 3: Extract strings into `dict.errorPage.*`/`dict.notFound.*` across the three pages and `FloatingWhatsApp`.**

- [ ] **Step 4: Add `SITE_COPY` to `src/lib/site.ts`** and update `SiteJsonLd.tsx` (and any other remaining `SITE.description`/`SITE.tagline` reader outside `manifest.ts` — re-run the `grep` from the spec's exploration to confirm the full list) to read `SITE_COPY[locale]` instead.

- [ ] **Step 5: Run tests, confirm they pass. Run the full suite, confirm no regression.**

- [ ] **Step 6: Commit**

```bash
git add src/app/'[lang]'/error.tsx src/app/'[lang]'/not-found.tsx src/app/'[lang]'/cars/'[brand]'/'[slug]'/not-found.tsx src/components/site/FloatingWhatsApp.tsx src/lib/site.ts src/components/seo/SiteJsonLd.tsx tests
git commit -m "feat(i18n): translate error/not-found pages, WhatsApp bubble and site-wide copy"
```

---

## Task 11: Bilingual sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `localePaths` (Task 1).
- Produces: `sitemap()` emits two entries (English and French) for every static route and every non-sold vehicle, each with `alternates.languages` set from `localePaths`, and identical `priority`/`changeFrequency` across the pair.

- [ ] **Step 1: Write a failing test** (`tests/unit/sitemap.test.ts`, new) asserting the output array's length doubles relative to today's and that a sample entry (e.g. `/cars`) has a `/fr/cars` sibling with matching `priority`.

- [ ] **Step 2: Run test, confirm it fails.**

- [ ] **Step 3: Implement.** For each current `staticRoutes`/`vehicleRoutes` entry, produce the English entry as today plus a French entry (`url` prefixed `/fr`, same `priority`/`changeFrequency`/`lastModified`), both carrying `alternates: { languages: localePaths(<unprefixed path>, <that entry's locale>).languages }`.

- [ ] **Step 4: Run test, confirm it passes.** Run `npm run build` and re-check the sitemap body manually (`grep -c '<loc>'` roughly doubles).

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts tests/unit/sitemap.test.ts
git commit -m "feat(i18n): list both language versions of every page in the sitemap"
```

---

## Task 12: `robots.ts` locale coverage

**Files:**
- Modify: `src/app/robots.ts`

**Interfaces:**
- Produces: `disallow` list extended with `/fr/favorites` and `/fr/compare` (no `/fr/admin`/`/fr/login` — those paths are never reachable per Task 2's forced-English rule, so there is nothing at that URL to disallow).

- [ ] **Step 1: Write a failing test** (`tests/unit/robots.test.ts`, new, or extend an existing one if present) asserting `/fr/favorites` and `/fr/compare` are present in the `disallow` array.

- [ ] **Step 2: Run test, confirm it fails.**

- [ ] **Step 3: Implement.**

- [ ] **Step 4: Run test, confirm it passes.**

- [ ] **Step 5: Commit**

```bash
git add src/app/robots.ts tests/unit/robots.test.ts
git commit -m "feat(i18n): disallow the french favorites/compare paths in robots.txt"
```

---

## Task 13: Full-site verification

**Files:**
- Create: `tests/e2e/i18n.spec.ts`

**Interfaces:**
- Consumes: the running app from Tasks 1–12.

- [ ] **Step 1: Write new Playwright tests** in `tests/e2e/i18n.spec.ts`:
  - A request with `Accept-Language: fr-FR` to `/` redirects to `/fr` and the page renders French nav text.
  - A request with no special header to `/` stays at `/` and renders English nav text (regression guard for the default path).
  - Clicking the manual switcher on an English page navigates to the `/fr` equivalent and the choice persists across a subsequent navigation (cookie set).
  - `/fr/cars/<brand>/<a-nonexistent-slug>` renders the vehicle not-found page (not a generic error), in French.
  - `/en/cars` redirects to `/cars`.

- [ ] **Step 2: Run the new e2e tests.** Unlike earlier tasks, this one adds no new production code — Tasks 1–12 already implement the behavior it checks — so there is no "confirm it fails first" step. Run them directly and expect every one to pass; any failure means an earlier task's behavior doesn't match the spec and must be fixed in that task's files, not patched here.

- [ ] **Step 3: Run `npm run test:all`** (lint, typecheck, unit tests, e2e). Fix anything red.

- [ ] **Step 4: Re-run the sitemap/robots manual spot-check**: `curl`/build-check that `/sitemap.xml` lists both locales for a sample of pages and `/robots.txt` disallows the `/fr/` paths from Task 12.

- [ ] **Step 5: Confirm the original English sitemap URLs are still byte-identical** to the Task 3 baseline (`/tmp/sitemap-before.txt`), i.e. the new French entries are additions, not replacements.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/i18n.spec.ts
git commit -m "test(i18n): add end-to-end coverage for locale detection, switching and french 404s"
```
