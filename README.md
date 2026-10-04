# Glorious Cars

A premium car-marketplace front end: browse an inventory, inspect a vehicle in
detail, book a test drive, and convert through **WhatsApp** rather than an
online checkout.

Built with **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**,
**Tailwind CSS v4**, **Motion** for animation and **lucide-react** for icons.

Supabase integration is included for authentication, inventory persistence and
admin operations.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build (static where possible)
npm run start      # serve the production build
npm run lint       # eslint
```

> **Images**: vehicle photos are uploaded from the admin to the project's
> Supabase Storage bucket; every `<VehicleImage>` falls back to a branded car
> silhouette if a photo fails to load.

---

## Configuration — everything lives in `src/lib/site.ts`

```ts
export const SITE = {
  name: "Glorious Cars",
  whatsappNumber: "237677176139",   // digits only, international format
  phoneDisplay: "+237 677 176 139",
  email: "hello@gloriouscars.example",
  address: { line, city, country },
  hours: [...],
  locations: [...],                 // test-drive / pickup locations
  social: { facebook, instagram, tiktok, linkedin },
  stats: [...],                     // ⚠ PLACEHOLDER figures — replace or remove
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gloriouscars.example.com",
};
```

Set `NEXT_PUBLIC_SITE_URL` to the real production domain before deploying and
submitting the sitemap to search engines. The fallback domain is for local
development only.

### Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` (the **API** URL,
  `https://<project-ref>.supabase.co`, not the dashboard address) and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable or anon key, never the
  secret / `service_role` key).
3. In the Supabase SQL editor, run these in order:
  1. `supabase/migrations/20260908000000_initial_schema.sql`
  2. `supabase/migrations/20260920000000_staff_access_hardening.sql`
  3. `supabase/migrations/20260920010000_vehicle_images_storage.sql` (photo
     uploads: creates the `vehicle-images` bucket)
4. In **Authentication → Sign In / Providers**, turn off **Allow new users to
  sign up**. Staff are created by hand under **Authentication → Users**.
5. Give a user staff access (roles are `admin` or `editor`):

   ```sql
   insert into public.profiles (id, role)
   select id, 'admin' from auth.users where email = 'you@example.com'
   on conflict (id) do update set role = excluded.role;
   ```

Then sign in at `/login`. The admin lives at `/admin`: list vehicles, add and
edit them, change status (Available / Reserved / Sold), feature them on the
home page, and (admins only) delete them.

How it fits together:

- **Public reads** go through `src/lib/repository.ts` with a cookie-less client
  (`src/lib/supabase/public.ts`). Row-level security hides `Sold` vehicles from
  the public. If the Supabase env vars are not set at all, the catalogue is
  empty; if they are set and the query fails, the build/request fails rather
  than showing an empty catalogue.
- **Public pages are prerendered** and refreshed on demand when staff save a
  change (`revalidatePath` in `src/app/admin/actions.ts`), with a 5-minute
  fallback (`revalidate` in `src/app/layout.tsx`) for rows edited directly in the
  Supabase dashboard.
- **Access control** is layered: `src/proxy.ts` redirects signed-out visitors
  from `/admin` to `/login`; every admin page and Server Action calls
  `requireStaff()` (`src/lib/auth.ts`); Postgres row-level security is the
  final gate for every write.
- **Photos** are uploaded from the admin (drag and drop or file picker) straight
  from the browser to the public `vehicle-images` Supabase Storage bucket, after
  being resized to at most 2000px (which also strips GPS/EXIF data). Only staff
  can upload or delete; files no vehicle uses any more are removed on save.
  Photos can also be added by link, but only from hosts in
  `src/lib/images.ts` (your own Storage bucket). That list feeds
  both `next.config.ts` and the admin validation, because `next/image` throws
  on any other host. Restart `next dev` after changing it.

### WhatsApp

The number is referenced **once** (`WHATSAPP_NUMBER` in `src/lib/whatsapp.ts`,
sourced from `SITE.whatsappNumber`). All CTAs build their links through:

| Helper | Used by |
| --- | --- |
| `buildWhatsAppUrl(message)` | every WhatsApp link — URL-encodes the text |
| `vehicleInquiryMessage(vehicle)` | "Order / Inquire on WhatsApp" on the detail page |
| `testDriveMessage(vehicle, details)` | test-drive confirmation screen |
| `generalInquiryMessage()` | floating button, footer, CTA sections, contact form |

---

## Data model & architecture

Nothing in the UI imports vehicle data directly. Everything goes through the
**data-access layer** so the source can change without touching components:

```
src/lib/repository.ts        async getters: getAllVehicles, getVehicleBySlugs,
                             getFeaturedVehicles, queryVehicles, getFilterOptions…
                             (reads `public.vehicles` from Supabase)
src/lib/filtering.ts         pure filter + sort + option-derivation (client-safe)
src/lib/types.ts             the `Vehicle` shape
```

To use a different backend, reimplement `loadVehicles()` in `repository.ts`.
The functions are already `async`; callers already `await`. Nothing else
changes.

### Vehicle shape

`id, reference, brand, model, trim?, year, price, currency, mileage, fuelType,
transmission, engine, horsepower, driveType, bodyType, color, seats, doors,
condition, status, featured, location, description, highlights[], features[],
images[], listedAt`

Clean URLs are derived from the data: `/cars/bmw/x5-xdrive40i-2024`
(`src/lib/slug.ts`). Detail pages are statically generated via
`generateStaticParams` and carry per-vehicle `<title>`, description, Open Graph
tags and `schema.org/Car` JSON-LD.

### Routes

| Route | |
| --- | --- |
| `/` | homepage — hero, quick search, featured, about, why, how-it-works, brands, reviews, CTA |
| `/cars` | inventory — sidebar filters (mobile bottom-sheet), instant client-side filtering, URL-synced, sort, result count, empty state |
| `/cars/[brand]/[slug]` | detail — gallery + lightbox, spec grid, features, description, WhatsApp + test-drive CTAs, sticky mobile action bar, related vehicles |
| `/compare` | up to 3 vehicles side by side, best-value highlighting |
| `/favorites` | saved vehicles (localStorage) |
| `/about` · `/services` · `/contact` | content pages |
| `/privacy` · `/terms` | placeholder legal pages |
| `sitemap.xml` · `robots.txt` · `manifest.webmanifest` | generated |

### Client state

`src/components/providers/` — `FavoritesProvider` and `CompareProvider`, both
backed by `localStorage` (`glorious-cars:favorites`, `glorious-cars:compare`), hydration-safe,
synced across tabs. Mounted once in `app/layout.tsx`.

---

## Admin-ready

There is no admin UI, but the shape is ready for one: a single write surface
(`repository.ts`) over a stable model, human `reference` codes, a `status`
field (`Available` / `Reserved` / `Sold`), and a `featured` flag. Adding "create
/ edit / delete vehicle, upload images, mark sold" is a matter of pointing the
repository at a database and building forms against the same `Vehicle` type.

---

## Notes

- **Fonts** — Montserrat is self-hosted via `next/font/local` from
  `src/fonts/*.woff2` (extracted from `@fontsource-variable/montserrat`).
- **Stats** (`SITE.stats`) and **testimonials** (`src/data/reviews.ts`) are
  clearly-marked placeholders. Replace with verified figures / consented reviews
  before launch.
- **Accessibility** — semantic landmarks, keyboard-operable menus, gallery and
  modals (Esc to close, focus management), visible focus rings, `aria` state on
  toggles, skip link, and full `prefers-reduced-motion` support (animations
  collapse to instant).
- **Performance** — static generation, `next/image` with responsive `sizes`,
  lazy loading, `preload` only on LCP imagery, skeleton loaders, minimal JS.
- No payment processing — WhatsApp is the conversion channel by design.
