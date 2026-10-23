"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowSquareOut, Check, X } from "@phosphor-icons/react";
import { useShopifyCart } from "@/context";
import { useCheckoutHandoff } from "@/Hooks/useCheckoutHandoff";

const VISIBLE_MS = 6000;

/**
 * SatchelToast - "Added to Satchel" confirmation
 *
 * Appears under the masthead (or at the top edge once the masthead has
 * scrolled away) after Shopify confirms an add. Offers the two next steps (View Satchel,
 * Checkout) and dismisses itself after a few seconds unless hovered or focused.
 * A persistent polite live region announces each add to screen readers.
 */
export function SatchelToast() {
  const { lastAdded, dismissLastAdded, itemCount } = useShopifyCart();
  const { safeCheckoutUrl, canCheckout, handleBeginCheckout } = useCheckoutHandoff();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  // A fresh confirmation starts its own countdown, even if the last one was
  // dismissed while hovered.
  const additionId = lastAdded?.id;
  useEffect(() => {
    setPaused(false);
  }, [additionId]);

  // Measured once per confirmation: just below the masthead while it is on
  // screen, otherwise at the top of the viewport.
  const headerBottom = useMemo(() => {
    if (!additionId || typeof document === "undefined") return 0;
    const header = document.querySelector("[data-site-header]");
    return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
  }, [additionId]);

  useEffect(() => {
    if (!lastAdded || paused) return;
    const timer = setTimeout(dismissLastAdded, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [lastAdded, paused, dismissLastAdded]);

  // A new page is its own context; don't carry the confirmation across.
  useEffect(() => {
    dismissLastAdded();
  }, [pathname, dismissLastAdded]);

  useEffect(() => {
    if (!lastAdded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissLastAdded();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastAdded, dismissLastAdded]);

  // Shopify names the only variant of a single-size product "Default Title".
  const variant =
    lastAdded?.variantTitle && lastAdded.variantTitle !== "Default Title"
      ? lastAdded.variantTitle
      : undefined;
  const announcement = lastAdded
    ? `${lastAdded.title}${variant ? `, ${variant}` : ""} added to your Satchel. ${itemCount} ${itemCount === 1 ? "item" : "items"} in your Satchel.`
    : "";

  return (
    <>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      <AnimatePresence>
        {lastAdded && (
          <motion.div
            key={lastAdded.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="fixed z-[3050] left-3 right-3 md:left-auto md:right-6 md:w-[380px] bg-theme-alabaster text-theme-charcoal border border-theme-charcoal/15 shadow-[0_24px_48px_-24px_rgba(26,26,26,0.45)]"
            style={{
              top: headerBottom > 0 ? `${headerBottom + 8}px` : "max(8px, env(safe-area-inset-top))",
              marginLeft: "env(safe-area-inset-left)",
              marginRight: "env(safe-area-inset-right)",
            }}
          >
            <div className="flex items-start gap-3 pl-4 pt-3">
              {lastAdded.image && (
                <div className="relative w-12 h-14 shrink-0 bg-theme-charcoal/5 overflow-hidden mt-1">
                  <Image src={lastAdded.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-theme-gold">
                  <Check weight="bold" className="w-3.5 h-3.5" aria-hidden />
                  Added to Satchel
                </p>
                <p className="mt-1 font-serif text-lg leading-tight truncate">{lastAdded.title}</p>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-theme-charcoal/70">
                  {variant ? `${variant} · ` : ""}Qty {lastAdded.quantity}
                </p>
              </div>
              <button
                type="button"
                onClick={dismissLastAdded}
                className="shrink-0 w-11 h-11 flex items-center justify-center text-theme-charcoal/60 hover:text-theme-charcoal transition-colors"
                aria-label="Dismiss"
              >
                <X weight="light" className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 pt-3">
              <Link
                href="/cart"
                className="min-h-11 flex items-center justify-center border border-theme-charcoal font-mono text-xs uppercase tracking-[0.2em] hover:bg-theme-charcoal/5 transition-colors"
              >
                View Satchel
              </Link>
              {canCheckout && safeCheckoutUrl ? (
                <a
                  href={safeCheckoutUrl}
                  onClick={handleBeginCheckout}
                  className="min-h-11 flex items-center justify-center gap-2 bg-theme-charcoal text-theme-alabaster font-mono text-xs uppercase tracking-[0.2em] hover:bg-theme-obsidian transition-colors"
                >
                  Checkout
                  <ArrowSquareOut weight="thin" className="w-3.5 h-3.5" aria-hidden />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="min-h-11 flex items-center justify-center bg-theme-charcoal text-theme-alabaster font-mono text-xs uppercase tracking-[0.2em] opacity-50 cursor-not-allowed"
                  title="Checkout is being prepared securely."
                >
                  Checkout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SatchelToast;
