"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Heart, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

/**
 * Quick links in the search overlay. Each one opens the matching filter, so it
 * always leads to results.
 */
export const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "BMW", href: "/cars?brand=BMW" },
  { label: "Hybrid", href: "/cars?fuel=Hybrid" },
  { label: "Electric", href: "/cars?fuel=Electric" },
  { label: "Automatic", href: "/cars?transmission=Automatic" },
  { label: "Under XAF 40M", href: "/cars?priceMax=40000000" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, hydrated } = useFavorites();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useDialogFocus(searchOpen, searchRef);
  useDialogFocus(menuOpen, menuRef);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("home-hero");
      const pastHero = hero
        ? hero.getBoundingClientRect().bottom <= 80
        : window.scrollY > 8;
      setScrolled(pastHero);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close overlays after a route change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll while an overlay is open.
  useEffect(() => {
    const locked = menuOpen || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  // Esc closes overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const heroHeader = pathname === "/" && !scrolled && !menuOpen;

  function runSearch(value: string) {
    const q = value.trim();
    setSearchOpen(false);
    setTerm("");
    router.push(q ? `/cars?search=${encodeURIComponent(q)}` : "/cars");
  }

  function openSearchPreset(href: string) {
    setSearchOpen(false);
    setTerm("");
    router.push(href);
  }

  const favBadge = hydrated && count > 0 ? count : null;

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow,height] duration-300",
          heroHeader
            ? "border-b border-white/10 bg-ink text-white"
            : "border-b border-line bg-surface/85 shadow-nav backdrop-blur-md",
        ].join(" ")}
      >
        <nav
          className={`wrap flex items-center justify-between gap-4 transition-[height] duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
          aria-label="Primary"
        >
          <Logo tone={heroHeader ? "light" : "dark"} preload />

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                      heroHeader
                        ? "text-white/80 hover:text-white"
                        : "text-muted hover:text-ink",
                      active && (heroHeader ? "text-white" : "text-ink"),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {link.label}
                    {active && (
                      <span
                        className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-accent"
                        aria-hidden
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search vehicles"
              className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                heroHeader
                  ? "text-white hover:bg-white/10"
                  : "text-ink hover:bg-black/5"
              }`}
            >
              <Search className="size-[1.15rem]" aria-hidden />
            </button>

            <Link
              href="/favorites"
              aria-label={`Favorites${favBadge ? ` (${favBadge})` : ""}`}
              className={`relative flex size-10 items-center justify-center rounded-lg transition-colors ${
                heroHeader
                  ? "text-white hover:bg-white/10"
                  : "text-ink hover:bg-black/5"
              }`}
            >
              <Heart className="size-[1.15rem]" aria-hidden />
              {favBadge && (
                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-4 text-white">
                  {favBadge}
                </span>
              )}
            </Link>

            <div className="ml-1 hidden sm:block">
              <Button href="/cars" size="sm" withArrow>
                Find a Car
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={`flex size-10 items-center justify-center rounded-lg transition-colors lg:hidden ${
                heroHeader
                  ? "text-white hover:bg-white/10"
                  : "text-ink hover:bg-black/5"
              }`}
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      {/* Overlays live outside <header>: its backdrop-filter would make it
          the containing block for `fixed` children, shrinking them to the
          header's height. */}
      {/* ---- Search overlay ---- */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-70 flex items-start justify-center bg-ink/70 px-4 pt-24 backdrop-blur-sm sm:pt-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSearchOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Search vehicles"
          >
            <motion.div
              ref={searchRef}
              className="w-full max-w-xl rounded-2xl bg-surface p-4 shadow-lift"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(term);
                }}
                className="flex items-center gap-3 rounded-xl border border-line bg-mist px-4"
              >
                <Search className="size-5 shrink-0 text-muted" aria-hidden />
                <input
                  autoFocus
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search make or car name…"
                  className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
                  aria-label="Search term"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-ink"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
                <span className="eyebrow py-1 text-muted">Popular</span>
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openSearchPreset(item.href)}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Mobile menu ---- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            className="fixed inset-0 z-70 flex flex-col bg-ink text-white lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="wrap flex h-20 items-center justify-between">
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <div className="wrap flex flex-1 flex-col justify-between pb-10 pt-6">
              <ul className="flex flex-col">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b border-white/10 py-5 text-2xl font-bold tracking-tight"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="size-5 text-silver"
                        aria-hidden
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col gap-4">
                <Button href="/cars" size="lg" fullWidth withArrow>
                  Find a Car
                </Button>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-silver">
                  <a href={`tel:${SITE.phoneDisplay.replace(/\s/g, "")}`}>
                    {SITE.phoneDisplay}
                  </a>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
