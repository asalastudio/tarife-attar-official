"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Handbag, List, X, ChatCircle } from "@phosphor-icons/react";
import { useShopifyCart } from "@/context";
import { useChat } from "@/context/ChatContext";
import { useIntro } from "@/context/IntroContext";

/**
 * SiteHeader
 *
 * Three tiers, in the manner of a classical perfume house:
 *   1. Announcement bar (ink) carrying one sentence and one link.
 *   2. Masthead (alabaster): quiz link left, wordmark centred, concierge and satchel right.
 *   3. Section links, one row, desktop only. On mobile the same links live in a drawer.
 *
 * The bottom-left satchel and the corner compass are left exactly as they were;
 * this bar is the plain path, the compass remains the discovery path.
 */

const ANNOUNCEMENT = {
  text: "Every waypoint now in 3 ml. Any three for $50, through 28 September.",
  href: "/atlas",
};

// The four territories of the Atlas. The Atlas page reads ?territory= and
// opens on that tab, so these are true deep links, not anchors.
const TERRITORIES: Array<{ id: string; name: string; tagline: string; price: string }> = [
  { id: "ember", name: "Ember", tagline: "Spice. Warmth. The intimacy of ancient routes.", price: "$28 / $48" },
  { id: "tidal", name: "Tidal", tagline: "Salt. Mist. The pull of open water.", price: "$30 / $50" },
  { id: "petal", name: "Petal", tagline: "Bloom. Herb. The exhale of living gardens.", price: "$30 / $50" },
  { id: "terra", name: "Terra", tagline: "Wood. Oud. The gravity of deep forests.", price: "$33 / $55" },
];

type MenuKey = "atlas" | "relic" | "gift" | "journal";

const SECTIONS: Array<{ label: string; href: string; menu?: MenuKey }> = [
  { label: "The Atlas", href: "/atlas", menu: "atlas" },
  { label: "The Relic", href: "/relic", menu: "relic" },
  { label: "Gift Sets", href: "/gift", menu: "gift" },
  { label: "Journal", href: "/journal", menu: "journal" },
  { label: "Stockists", href: "/stockists" },
];

type MenuLink = { label: string; href: string; note: string; meta?: string };

/**
 * Every panel shares one anatomy so the menu reads the same wherever the
 * cursor lands: an introduction on the left, the section's doors in the
 * middle, and one featured card on the right.
 */
const MENUS: Record<
  MenuKey,
  {
    eyebrow: string;
    title: string;
    intro: string;
    all: { label: string; href: string };
    links: MenuLink[];
    feature: { eyebrow: string; title: string; body: string; cta: string; href: string };
  }
> = {
  atlas: {
    eyebrow: "Four territories \u00b7 Twenty-eight waypoints",
    title: "The Atlas",
    intro: "Clean, alcohol-free perfume oils, each one a place. Choose a territory by the feeling you want to carry.",
    all: { label: "View the full Atlas", href: "/atlas" },
    links: TERRITORIES.map((t) => ({
      label: t.name,
      href: `/atlas?territory=${t.id}`,
      note: t.tagline,
      meta: `3 ml $23 \u00b7 6 ml / 12 ml ${t.price}`,
    })),
    feature: {
      eyebrow: "Through 28 September",
      title: "Any three 3 ml for $50",
      body: "Every waypoint now comes in the 3 ml travel size. Mix any three in stock; the price applies at checkout, no code.",
      cta: "Choose your three",
      href: "/atlas",
    },
  },
  relic: {
    eyebrow: "Rare materials \u00b7 Small lots",
    title: "The Relic",
    intro: "Pure oud oils, aged resins and vintage attars, kept as specimens rather than blends.",
    all: { label: "View the Relic", href: "/relic" },
    links: [
      { label: "Pure Oud", href: "/relic#pure-oud", note: "Single-origin agarwood oils. Aged. Verified. Uncut." },
      { label: "Aged Resins", href: "/relic#aged-resins", note: "Fossilized amber, vintage frankincense and temple-grade myrrh." },
      { label: "Rare Attars", href: "/relic#rare-attars", note: "Traditional hydro-distillations from master perfumers." },
    ],
    feature: {
      eyebrow: "Collector's note",
      title: "Quantities are finite",
      body: "When a lot is gone it is gone. The Relic is restocked only when the material is right.",
      cta: "See what remains",
      href: "/relic",
    },
  },
  gift: {
    eyebrow: "For someone who travels by scent",
    title: "Gift Sets",
    intro: "Curated sets and small formats for giving, when you know the person better than their perfume.",
    all: { label: "View all gifts", href: "/gift" },
    links: [
      { label: "The Traveler Set", href: "/gift", note: "A curated set of Atlas waypoints, ready to give." },
      { label: "Three in 3 ml", href: "/atlas", note: "Build your own trio of travel sizes, any three for $50." },
      { label: "From the Relic", href: "/relic", note: "A rare oil or resin for the collector who has everything." },
    ],
    feature: {
      eyebrow: "Not sure what they wear?",
      title: "Find their waypoint",
      body: "A few questions about how they live point to the territory that suits them.",
      cta: "Start the quiz",
      href: "/quiz",
    },
  },
  journal: {
    eyebrow: "Field notes from the archive",
    title: "Journal",
    intro: "Stories behind the blends, the places that inspired them, and notes for collectors.",
    all: { label: "Read the Journal", href: "/journal" },
    links: [
      { label: "Field Notes", href: "/journal?category=field-notes", note: "Dispatches from the road and the studio." },
      { label: "Behind the Blend", href: "/journal?category=behind-the-blend", note: "How a waypoint is composed, note by note." },
      { label: "Territory Spotlight", href: "/journal?category=territory-spotlight", note: "One territory, read closely." },
      { label: "Collector Archives", href: "/journal?category=collector-archives", note: "Rare materials and the stories they carry." },
    ],
    feature: {
      eyebrow: "The Field Journal",
      title: "Log your waypoints",
      body: "Keep a record of what you wore, where, and how it wore on skin.",
      cta: "Open the Field Journal",
      href: "/field-journal",
    },
  },
};

const DRAWER_EXTRAS: Array<{ label: string; href: string }> = [
  { label: "Find Your Waypoint", href: "/quiz" },
  { label: "Field Journal", href: "/field-journal" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useShopifyCart();
  const { openChat } = useChat();
  const { introActive } = useIntro();
  const headerRef = useRef<HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const showMenu = (key: MenuKey | null) => {
    cancelClose();
    setOpenMenu(key);
  };
  // A short grace period lets the cursor cross the gap between link and panel.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  // Close the drawer and any panel on navigation.
  useEffect(() => {
    setDrawerOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  // Publish the header's height so full-height sections can sit exactly beneath it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--site-header-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--site-header-h");
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 py-3 ${
      isActive(href)
        ? "text-theme-charcoal"
        : "text-theme-charcoal/55 hover:text-theme-charcoal"
    }`;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 w-full transition-opacity duration-700 ease-out ${
        introActive ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={introActive}
    >
      {/* 1. Announcement bar */}
      <div className="bg-theme-charcoal text-theme-alabaster">
        <Link
          href={ANNOUNCEMENT.href}
          className="block text-center font-mono text-[10px] uppercase tracking-[0.22em] py-2 px-4 hover:text-theme-gold transition-colors duration-300"
        >
          {ANNOUNCEMENT.text}
        </Link>
      </div>

      {/* 2. Masthead. The panel anchors to this full-width box, not to the nav
          row, so it always spans the viewport edge to edge. */}
      <div
        className="relative bg-theme-alabaster/95 backdrop-blur-sm border-b border-theme-charcoal/10"
        onMouseLeave={scheduleClose}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
            {/* Left: quiz on desktop, menu on mobile */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden -ml-2 p-2 text-theme-charcoal hover:text-theme-gold transition-colors"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <List weight="light" className="w-6 h-6" />
              </button>
              <Link
                href="/quiz"
                className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] text-theme-charcoal/55 hover:text-theme-charcoal transition-colors duration-300"
              >
                Find Your Waypoint
              </Link>
            </div>

            {/* Centre: wordmark */}
            <Link href="/" className="flex flex-col items-center justify-center group px-4" aria-label="Tarifé Attär, home">
              <span
                className="text-[20px] md:text-[26px] tracking-[0.38em] md:tracking-[0.42em] uppercase font-semibold text-theme-charcoal leading-none whitespace-nowrap"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                TARIF&Eacute; ATT&Auml;R
              </span>
              <span className="hidden md:block font-mono text-[8px] tracking-[0.3em] uppercase text-theme-charcoal/45 mt-1.5 group-hover:text-theme-gold transition-colors duration-300">
                Modern Apothecary
              </span>
            </Link>

            {/* Right: concierge and satchel */}
            <div className="flex items-center justify-end gap-4 md:gap-7">
              <button
                type="button"
                onClick={openChat}
                className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-charcoal/55 hover:text-theme-charcoal transition-colors duration-300"
                aria-label="Open the concierge"
              >
                <ChatCircle weight="light" className="w-4 h-4" />
                Concierge
              </button>
              <Link
                href="/cart"
                className="relative inline-flex items-center text-theme-charcoal hover:text-theme-gold transition-colors duration-300 -mr-1 p-1"
                aria-label={`Satchel, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              >
                <Handbag weight="light" className="w-6 h-6 md:w-[22px] md:h-[22px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-theme-gold text-theme-charcoal font-mono text-[9px] leading-4 text-center tabular-nums">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* 3. Section links, desktop */}
          <nav
            aria-label="Sections"
            className="hidden md:flex items-center justify-center gap-10 border-t border-theme-charcoal/5"
          >
            {SECTIONS.map((s) => {
              const menu = s.menu;
              const open = menu !== undefined && openMenu === menu;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onMouseEnter={() => showMenu(menu ?? null)}
                  onFocus={() => showMenu(menu ?? null)}
                  aria-haspopup={menu ? "true" : undefined}
                  aria-expanded={menu ? open : undefined}
                  aria-controls={menu ? "site-mega-menu" : undefined}
                  className={`relative ${linkClass(s.href)} ${open ? "!text-theme-charcoal" : ""}`}
                >
                  {s.label}
                  <span
                    aria-hidden
                    className={`absolute left-0 right-0 -bottom-px h-px bg-theme-gold origin-center transition-transform duration-300 ${
                      open ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mega menu: one full-width panel whose contents change with the section */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              id="site-mega-menu"
              key="mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block absolute inset-x-0 top-full z-50 bg-theme-alabaster border-b border-theme-charcoal/10 shadow-[0_30px_60px_-40px_rgba(26,26,26,0.45)]"
              onMouseEnter={cancelClose}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={openMenu}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <MegaPanel menu={MENUS[openMenu]} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Veil over the page while a panel is open; moving onto it closes the panel */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block fixed inset-0 -z-10 bg-theme-charcoal/20"
            onMouseEnter={scheduleClose}
            onClick={() => setOpenMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[3000] bg-theme-charcoal/40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[3001] w-[84vw] max-w-sm bg-theme-alabaster text-theme-charcoal flex flex-col md:hidden"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-theme-charcoal/10">
                <span className="text-base tracking-[0.38em] uppercase font-semibold" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>TARIF&Eacute; ATT&Auml;R</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="-mr-2 p-2 hover:text-theme-gold transition-colors"
                  aria-label="Close menu"
                >
                  <X weight="light" className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Sections">
                <ul className="flex flex-col">
                  {SECTIONS.map((s) => (
                    <li key={s.href} className="border-b border-theme-charcoal/10">
                      <Link
                        href={s.href}
                        className={`block py-4 font-serif text-2xl tracking-tight ${isActive(s.href) ? "text-theme-charcoal" : "text-theme-charcoal/80"}`}
                      >
                        {s.label}
                      </Link>
                      {s.href === "/atlas" && (
                        <ul className="pb-4 -mt-1 grid grid-cols-2 gap-x-6">
                          {TERRITORIES.map((t) => (
                            <li key={t.id}>
                              <Link
                                href={`/atlas?territory=${t.id}`}
                                className="flex items-baseline justify-between py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-charcoal/60 hover:text-theme-charcoal"
                              >
                                <span>{t.name}</span>
                                <span className="text-theme-charcoal/35 normal-case tracking-normal">{t.price}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col mt-8">
                  {DRAWER_EXTRAS.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="block py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-charcoal/60 hover:text-theme-charcoal"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        openChat();
                      }}
                      className="block py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-charcoal/60 hover:text-theme-charcoal"
                    >
                      Concierge
                    </button>
                  </li>
                </ul>
              </nav>

              <div className="px-5 py-5 border-t border-theme-charcoal/10 font-mono text-[9px] uppercase tracking-[0.22em] text-theme-charcoal/45">
                Clean, skin-safe perfume oils for those who travel by scent.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function MegaPanel({ menu }: { menu: (typeof MENUS)[MenuKey] }) {
  return (
    <div className="max-w-[1800px] mx-auto px-8 lg:px-12 py-10 min-h-[360px] grid grid-cols-12 gap-8 lg:gap-12">
      {/* Introduction */}
      <div className="col-span-3 flex flex-col">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-theme-charcoal/45">
          {menu.eyebrow}
        </span>
        <span className="mt-4 font-serif italic text-[34px] leading-none text-theme-charcoal">{menu.title}</span>
        <p className="mt-4 font-serif text-[14px] leading-relaxed text-theme-charcoal/60 max-w-[30ch]">{menu.intro}</p>
        <Link
          href={menu.all.href}
          className="mt-auto pt-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-theme-charcoal hover:text-theme-gold transition-colors duration-300"
        >
          {menu.all.label} <span aria-hidden>&rarr;</span>
        </Link>
      </div>

      {/* Doors into the section */}
      <ul
        className={`col-span-6 grid gap-x-8 content-start border-l border-theme-charcoal/10 pl-8 lg:pl-12 ${
          menu.links.length > 3 ? "grid-cols-2 [&>li:nth-last-child(2)]:border-b-0" : "grid-cols-1"
        }`}
      >
        {menu.links.map((l) => (
          <li key={l.label} className="border-b border-theme-charcoal/10 last:border-b-0">
            <Link href={l.href} className="group/l flex items-start justify-between gap-6 py-5">
              <span className="min-w-0">
                <span className="block font-serif italic text-[22px] leading-tight text-theme-charcoal group-hover/l:text-theme-gold transition-colors duration-300">
                  {l.label}
                </span>
                <span className="mt-1.5 block font-serif text-[13px] leading-snug text-theme-charcoal/55">{l.note}</span>
                {l.meta && (
                  <span className="mt-2.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-theme-charcoal/40">
                    {l.meta}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className="mt-1.5 font-mono text-[11px] text-theme-charcoal/25 -translate-x-1 group-hover/l:translate-x-0 group-hover/l:text-theme-gold transition-all duration-300"
              >
                &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Featured card */}
      <Link
        href={menu.feature.href}
        className="col-span-3 group/f flex flex-col bg-theme-charcoal text-theme-alabaster p-7 min-h-[220px]"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-theme-gold">{menu.feature.eyebrow}</span>
        <span className="mt-4 font-serif italic text-[26px] leading-[1.1]">{menu.feature.title}</span>
        <span className="mt-3 font-serif text-[13px] leading-relaxed text-theme-alabaster/65">{menu.feature.body}</span>
        <span className="mt-auto pt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-theme-alabaster group-hover/f:text-theme-gold transition-colors duration-300">
          {menu.feature.cta} &rarr;
        </span>
      </Link>
    </div>
  );
}

export default SiteHeader;
