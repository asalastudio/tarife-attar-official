"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Package, Truck, RotateCcw, Map, HelpCircle, Droplets } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

// ─── FAQ Data ───────────────────────────────────────────────────────────────

interface FAQSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: "shipping",
    title: "Shipping",
    icon: <Truck className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg opacity-90">Orders ship within 1–2 business days via USPS.</p>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-3 border-b border-theme-charcoal/10">
            <span className="font-mono text-sm uppercase tracking-wider text-theme-charcoal/90 shrink-0">
              First Class Mail
            </span>
            <span className="text-base opacity-80">
              $4.50–$5.80 · 2–5 business days
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-theme-gold font-medium">
              Free on orders $35+
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-3 border-b border-theme-charcoal/10">
            <span className="font-mono text-sm uppercase tracking-wider text-theme-charcoal/90 shrink-0">
              Priority Mail
            </span>
            <span className="text-base opacity-80">
              $9.00–$14.00 · 2 business days
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-3 border-b border-theme-charcoal/10">
            <span className="font-mono text-sm uppercase tracking-wider text-theme-charcoal/90 shrink-0">
              Priority Express
            </span>
            <span className="text-base opacity-80">
              $27.95–$29.95 · Next business day
            </span>
          </div>
        </div>
        <p className="text-base opacity-70 italic">
          Orders placed before 1 PM Pacific ship same day.
        </p>
      </div>
    ),
  },
  {
    id: "tracking",
    title: "Order Tracking",
    icon: <Package className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg opacity-90">
          Tracking information is sent via email once your order ships.
        </p>
        <div className="bg-white/60 border border-theme-charcoal/10 p-5 rounded-sm">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">
            To check on Etsy
          </p>
          <ol className="list-decimal list-inside space-y-2 text-base opacity-90">
            <li>Go to <strong>Purchases and Reviews</strong></li>
            <li>Find your order</li>
            <li>Check shipping status</li>
          </ol>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Not Shipped", "Shipped", "In Transit", "Track Package"].map(
            (status) => (
              <span
                key={status}
                className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 border border-theme-charcoal/20 opacity-80"
              >
                {status}
              </span>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    icon: <RotateCcw className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-lg opacity-90">
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Returns accepted within 30 days, unopened with original seals
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Non-returnable: custom blends, sample sets, items discounted beyond 15%
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            <span className="inline-block">
              Contact via Etsy messaging or our{" "}
              <a href="/support" className="text-theme-gold hover:underline font-medium">
                support form
              </a>{" "}
              to start a return
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Refunds within 3–5 business days after inspection
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Exchanges for equal value available
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            International customers responsible for return shipping and customs
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "territories",
    title: "What Are the Territories?",
    icon: <Map className="w-4 h-4" />,
    content: (
      <div className="space-y-5">
        <p className="text-lg opacity-90">
          The Atlas Collection organizes 28 fragrances into four sensory
          landscapes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {[
            {
              name: "Ember",
              desc: "Warm · Resinous · Amber",
              notes: "oud, amber, musk, warmth",
              pricing: "6ml $28 | 12ml $48",
              color: "#D4854A",
            },
            {
              name: "Tidal",
              desc: "Fresh · Aquatic · Clean",
              notes: "marine, citrus, coastal",
              pricing: "6ml $30 | 12ml $50",
              color: "#5B8FA8",
            },
            {
              name: "Petal",
              desc: "Floral · Musky · Soft",
              notes: "florals, soft musks",
              pricing: "6ml $30 | 12ml $50",
              color: "#C4788A",
            },
            {
              name: "Terra",
              desc: "Woody · Earthy · Grounded",
              notes: "wood, leather, earth",
              pricing: "6ml $33 | 12ml $55",
              color: "#6B7F5E",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="relative bg-white border border-theme-charcoal/10 p-5 rounded-sm shadow-sm"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
                style={{ backgroundColor: t.color }}
              />
              <h4
                className="font-serif italic text-2xl mb-1"
                style={{ color: t.color }}
              >
                {t.name}
              </h4>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-theme-charcoal/70 mb-2">
                {t.desc}
              </p>
              <p className="text-base opacity-80 italic mb-3">{t.notes}</p>
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-theme-charcoal/80">
                {t.pricing}
              </p>
            </div>
          ))}
        </div>
        <p className="text-base opacity-70 italic mt-6">
          All fragrances are concentrated perfume oil, alcohol-free, with glass
          wand applicator.
        </p>
      </div>
    ),
  },
  {
    id: "name-change",
    title: "Why Did the Names Change?",
    icon: <HelpCircle className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg opacity-90 leading-relaxed">
          Same oils, same formulations — we renamed each fragrance for the real
          place that inspired it. Every scent you know and love is still here,
          just with a name that tells the story of where it belongs on the
          map.
        </p>
        <a
          href="/name-change"
          className="inline-flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-theme-gold hover:underline mt-2"
        >
          View the complete reference table →
        </a>
      </div>
    ),
  },
  {
    id: "application",
    title: "How to Apply Perfume Oil",
    icon: <Droplets className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-lg opacity-90">
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Apply to pulse points — wrists, neck, behind ears, inner elbows
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Let it bloom 15–30 minutes for full development
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Don&apos;t rub — dab or roll gently
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Layer different territories for a signature blend
          </li>
          <li className="flex gap-3">
            <span className="text-theme-gold mt-1 shrink-0">·</span>
            Store away from direct sunlight and heat
          </li>
        </ul>
      </div>
    ),
  },
];

// ─── Accordion Item ─────────────────────────────────────────────────────────

function AccordionItem({
  section,
  isOpen,
  onToggle,
  index,
}: {
  section: FAQSection;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index }}
      className="border-b border-theme-charcoal/5"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 md:py-8 text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <span
            className={`transition-colors duration-300 ${
              isOpen ? "text-theme-gold" : "text-theme-industrial"
            }`}
          >
            {section.icon}
          </span>
          <h2
            className={`text-xl md:text-2xl font-serif italic tracking-tight transition-colors duration-300 ${
              isOpen ? "text-theme-charcoal" : "text-theme-charcoal/70"
            }`}
          >
            {section.title}
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.85, 0, 0.15, 1] }}
          className={`transition-colors duration-300 ${
            isOpen ? "text-theme-gold" : "text-theme-industrial"
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.85, 0, 0.15, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-8 md:pl-10 pb-8 pr-4 font-serif text-theme-charcoal/90 leading-relaxed text-lg">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function FAQPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] opacity-40">
            Support
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-4">
              Frequently Asked
            </h1>
            <p className="text-sm font-mono uppercase tracking-[0.3em] opacity-60">
              Everything you need to know
            </p>
          </motion.div>

          {/* Accordion */}
          <div className="border-t border-theme-charcoal/5">
            {FAQ_SECTIONS.map((section, index) => (
              <AccordionItem
                key={section.id}
                section={section}
                isOpen={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                index={index}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="font-serif text-2xl italic opacity-80 mb-6">
              Still have questions?
            </p>
            <button
              onClick={() => router.push("/support")}
              className="inline-flex items-center gap-3 px-8 py-4 border border-theme-charcoal/30 font-mono text-xs font-semibold uppercase tracking-[0.3em] hover:bg-theme-charcoal hover:text-theme-alabaster transition-all duration-500"
            >
              Contact Support
            </button>
          </motion.div>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
