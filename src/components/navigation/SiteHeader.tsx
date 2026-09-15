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
  text: "Six waypoints of the Atlas, now in 3 ml.",
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

const SECTIONS: Array<{ label: string; href: string }> = [
  { label: "The Atlas", href: "/atlas" },
  { label: "The Relic", href: "/relic" },
  { label: "Gift Sets", href: "/gift" },
  { label: "Journal", href: "/journal" },
  { label: "Stockists", href: "/stockists" },
];

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
  const [atlasOpen, setAtlasOpen] = useState(false);

  // Close the drawer on navigation and lock body scroll while it is open.
  useEffect(() => {
    setDrawerOpen(false);
    setAtlasOpen(false);
  }, [pathname]);

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

      {/* 2. Masthead */}
      <div className="bg-theme-alabaster/95 backdrop-blur-sm border-b border-theme-charcoal/10">
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
            className="relative hidden md:flex items-center justify-center gap-10 border-t border-theme-charcoal/5"
            onMouseLeave={() => setAtlasOpen(false)}
          >
            {SECTIONS.map((s) =>
              s.href === "/atlas" ? (
                <div
                  key={s.href}
                  onMouseEnter={() => setAtlasOpen(true)}
                  onFocus={() => setAtlasOpen(true)}
                >
                  <Link
                    href={s.href}
                    className={linkClass(s.href)}
                    aria-haspopup="true"
                    aria-expanded={atlasOpen}
                  >
                    {s.label}
                  </Link>
                </div>
              ) : (
                <Link key={s.href} href={s.href} className={linkClass(s.href)}>
                  {s.label}
                </Link>
              ),
            )}

            {/* Territories panel */}
            <AnimatePresence>
              {atlasOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-full -translate-x-1/2 w-[min(920px,94vw)] bg-theme-alabaster border border-theme-charcoal/10 shadow-[0_24px_60px_-30px_rgba(26,26,26,0.35)] z-50"
                  onMouseEnter={() => setAtlasOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setAtlasOpen(false);
                  }}
                >
                  <div className="px-8 pt-6 pb-2 flex items-baseline justify-between border-b border-theme-charcoal/5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-theme-charcoal/45">
                      Four territories &middot; Twenty-eight waypoints
                    </span>
                    <Link
                      href="/atlas"
                      className="font-mono text-[9px] uppercase tracking-[0.22em] text-theme-gold hover:text-theme-charcoal transition-colors"
                    >
                      View the full Atlas &rarr;
                    </Link>
                  </div>
                  <ul className="grid grid-cols-4 divide-x divide-theme-charcoal/5">
                    {TERRITORIES.map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/atlas?territory=${t.id}`}
                          className="group/t block px-8 py-7 hover:bg-theme-charcoal/[0.03] transition-colors duration-300"
                        >
                          <span className="block font-serif italic text-[26px] leading-none text-theme-charcoal mb-3 group-hover/t:text-theme-gold transition-colors duration-300">
                            {t.name}
                          </span>
                          <span className="block font-serif text-[13px] leading-snug text-theme-charcoal/60 mb-4 min-h-[2.6em]">
                            {t.tagline}
                          </span>
                          <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-theme-charcoal/45">
                            Seven waypoints &middot; {t.price}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </div>

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
              className="fixed inset-0 z-40 bg-theme-charcoal/40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[84vw] max-w-sm bg-theme-alabaster text-theme-charcoal flex flex-col md:hidden"
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

export default SiteHeader;
