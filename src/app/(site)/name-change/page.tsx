"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ArrowRight, Sparkles } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

// ─── Territory Data ─────────────────────────────────────────────────────────

interface Fragrance {
  legacyName: string | null; // null = new to the Atlas
  atlasName: string;
  scentNotes: string;
  inspiredBy: string;
}

interface Territory {
  id: string;
  name: string;
  descriptor: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  fragrances: Fragrance[];
}

const TERRITORIES: Territory[] = [
  {
    id: "ember",
    name: "Ember",
    descriptor: "Warm · Resinous · Amber",
    color: "#D4854A",
    borderColor: "border-[#D4854A]",
    bgColor: "bg-[#D4854A]",
    textColor: "text-[#D4854A]",
    fragrances: [
      { legacyName: "Oud Fire", atlasName: "ADEN", scentNotes: "Warm oud, fire-roasted amber", inspiredBy: "Yemen" },
      { legacyName: "Frankincense & Myrrh", atlasName: "ETHIOPIA", scentNotes: "Ethiopian incense, highland spice", inspiredBy: "Ethiopia" },
      { legacyName: "Granada Amber", atlasName: "GRANADA", scentNotes: "Spanish amber, Moorish garden", inspiredBy: "Spain" },
      { legacyName: "Teeb Musk", atlasName: "NIZWA", scentNotes: "Arabian musk, traditional teeb blend", inspiredBy: "Oman" },
      { legacyName: "Honey Oudh", atlasName: "PETRA", scentNotes: "Raw honey, aged oud, desert spice", inspiredBy: "Jordan" },
      { legacyName: "Black Musk", atlasName: "SERENGETI", scentNotes: "Dark musk, ancient resin, deep gravity", inspiredBy: "Tanzania" },
      { legacyName: "Vanilla Sands", atlasName: "ZANZIBAR", scentNotes: "Madagascar vanilla, golden sandalwood", inspiredBy: "Tanzania" },
    ],
  },
  {
    id: "tidal",
    name: "Tidal",
    descriptor: "Fresh · Aquatic · Clean",
    color: "#5B8FA8",
    borderColor: "border-[#5B8FA8]",
    bgColor: "bg-[#5B8FA8]",
    textColor: "text-[#5B8FA8]",
    fragrances: [
      { legacyName: "Coconut Jasmine", atlasName: "BAHIA", scentNotes: "Brazilian coast, jasmine, warm coconut", inspiredBy: "Brazil" },
      { legacyName: "Blue Oud", atlasName: "BAHRAIN", scentNotes: "Pearl diver's musk, gulf breeze", inspiredBy: "Bahrain" },
      { legacyName: "Del Mare", atlasName: "BIG SUR", scentNotes: "Pacific coast, salt mist, wild cliffs", inspiredBy: "California" },
      { legacyName: "China Rain", atlasName: "KYOTO", scentNotes: "Rain-washed stone, green tea", inspiredBy: "Japan" },
      { legacyName: null, atlasName: "MONACO", scentNotes: "Mediterranean luxury, coastal elegance", inspiredBy: "Monaco" },
      { legacyName: "Dubai Musk", atlasName: "TANGIERS", scentNotes: "Airy white musk, mustahara", inspiredBy: "Morocco" },
      { legacyName: null, atlasName: "TIGRIS", scentNotes: "Ancient river, flowing aquatic musk", inspiredBy: "Iraq" },
    ],
  },
  {
    id: "petal",
    name: "Petal",
    descriptor: "Floral · Musky · Soft",
    color: "#C4788A",
    borderColor: "border-[#C4788A]",
    bgColor: "bg-[#C4788A]",
    textColor: "text-[#C4788A]",
    fragrances: [
      { legacyName: "White Amber", atlasName: "AMER", scentNotes: "Soft amber, warm skin scent", inspiredBy: "Rajasthan, India" },
      { legacyName: "Turkish Rose", atlasName: "DAMASCUS", scentNotes: "Damask rose, Turkish rosewater", inspiredBy: "Syria" },
      { legacyName: "Arabian Jasmine", atlasName: "GRASSE", scentNotes: "Pure jasmine sambac", inspiredBy: "France" },
      { legacyName: "Peach Memoir", atlasName: "KANDY", scentNotes: "Soft peach, velvety musk", inspiredBy: "Sri Lanka" },
      { legacyName: "Himalayan Musk", atlasName: "MANALI", scentNotes: "High-altitude musk, clean skin", inspiredBy: "India" },
      { legacyName: "Musk Tahara", atlasName: "MEDINA", scentNotes: "Traditional purification musk", inspiredBy: "Saudi Arabia" },
      { legacyName: "White Egyptian Musk", atlasName: "SIWA", scentNotes: "Egyptian oasis, white musk", inspiredBy: "Egypt" },
    ],
  },
  {
    id: "terra",
    name: "Terra",
    descriptor: "Woody · Earthy · Grounded",
    color: "#6B7F5E",
    borderColor: "border-[#6B7F5E]",
    bgColor: "bg-[#6B7F5E]",
    textColor: "text-[#6B7F5E]",
    fragrances: [
      { legacyName: null, atlasName: "ASTORIA", scentNotes: "Mossy forest, ancient cedar", inspiredBy: "Oregon" },
      { legacyName: "Oud Tobacco", atlasName: "HAVANA", scentNotes: "Dark leaf, cured wood, smoky", inspiredBy: "Cuba" },
      { legacyName: "Marrakesh", atlasName: "MARRAKESH", scentNotes: "Moroccan spice market, warm cedar", inspiredBy: "Morocco" },
      { legacyName: "Black Oud", atlasName: "RIYADH", scentNotes: "Arabian oud, noble wood", inspiredBy: "Saudi Arabia" },
      { legacyName: "Oud Aura", atlasName: "SAMARKAND", scentNotes: "Royal oud, ceremonial wood", inspiredBy: "Uzbekistan" },
      { legacyName: "Sicilian Oudh", atlasName: "SICILY", scentNotes: "Citrus grove, Mediterranean oud", inspiredBy: "Italy" },
      { legacyName: "Spanish Sandalwood", atlasName: "TULUM", scentNotes: "Creamy sandalwood, smooth skin scent", inspiredBy: "Mexico" },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function NameChangePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter fragrances across all territories based on search
  const filteredTerritories = useMemo(() => {
    if (!searchQuery.trim()) return TERRITORIES;

    const q = searchQuery.toLowerCase();
    return TERRITORIES.map((territory) => ({
      ...territory,
      fragrances: territory.fragrances.filter(
        (f) =>
          f.atlasName.toLowerCase().includes(q) ||
          (f.legacyName && f.legacyName.toLowerCase().includes(q)) ||
          f.scentNotes.toLowerCase().includes(q) ||
          f.inspiredBy.toLowerCase().includes(q)
      ),
    })).filter((t) => t.fragrances.length > 0);
  }, [searchQuery]);

  const totalResults = filteredTerritories.reduce(
    (sum, t) => sum + t.fragrances.length,
    0
  );

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Return
          </button>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.6em] opacity-60">
            Atlas Reference
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 md:px-24 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-[0.9] mb-6">
                The Atlas Has Arrived
              </h1>
              <p className="text-xl opacity-90 font-serif leading-relaxed max-w-2xl mx-auto mb-4">
                Same oils. Same formulations. New names inspired by the real
                places that shaped each scent.
              </p>
              <p className="text-base opacity-70 font-mono uppercase tracking-wider font-medium">
                28 fragrances · 4 territories · One atlas
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search */}
        <section className="px-6 md:px-24 pb-12">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-industrial" />
              <input
                type="text"
                placeholder="Search by old name, new name, or scent notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 border border-theme-charcoal/20 rounded-sm font-mono text-base tracking-wide placeholder:text-theme-charcoal/50 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold/30 transition-all font-medium"
              />
              {searchQuery && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-wider text-theme-charcoal/80 font-semibold"
                >
                  {totalResults} {totalResults === 1 ? "result" : "results"}
                </motion.span>
              )}
            </motion.div>
          </div>
        </section>

        {/* Territory Sections */}
        <section className="px-6 md:px-24 pb-24">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {filteredTerritories.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <p className="font-serif text-2xl italic opacity-60">
                    No fragrances match &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 font-mono text-xs font-semibold uppercase tracking-wider text-theme-gold hover:underline"
                  >
                    Clear search
                  </button>
                </motion.div>
              ) : (
                filteredTerritories.map((territory, tIdx) => (
                  <motion.div
                    key={territory.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * tIdx }}
                    className="mb-20 last:mb-0"
                  >
                    {/* Territory Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: territory.color }}
                      />
                      <div>
                        <h2
                          className="text-4xl md:text-5xl font-serif italic tracking-tight"
                          style={{ color: territory.color }}
                        >
                          {territory.name}
                        </h2>
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] opacity-80 mt-2">
                          {territory.descriptor}
                        </p>
                      </div>
                    </div>

                    {/* Fragrance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {territory.fragrances.map((fragrance, fIdx) => (
                        <motion.div
                          key={fragrance.atlasName}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1 * tIdx + 0.05 * fIdx,
                          }}
                          className="group relative bg-white border border-theme-charcoal/10 p-6 hover:shadow-md transition-all duration-300 rounded-sm"
                        >
                          {/* Left accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 rounded-l-sm"
                            style={{ backgroundColor: territory.color }}
                          />

                          {/* Legacy Name */}
                          <div className="mb-3">
                            {fragrance.legacyName ? (
                              <span className="font-mono text-xs uppercase tracking-wider text-theme-charcoal/70 font-medium leading-tight">
                                {fragrance.legacyName}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider leading-tight font-semibold"
                                style={{ color: territory.color }}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                New to the Atlas
                              </span>
                            )}
                          </div>

                          {/* Arrow + Atlas Name */}
                          <div className="flex items-center gap-3 mb-3">
                            {fragrance.legacyName && (
                              <ArrowRight className="w-4 h-4 text-theme-gold opacity-80" />
                            )}
                            <h3 className="text-3xl font-serif italic tracking-wide">
                              {fragrance.atlasName}
                            </h3>
                          </div>

                          {/* Scent Notes */}
                          <p className="text-base opacity-80 leading-relaxed font-serif mb-3">
                            {fragrance.scentNotes}
                          </p>

                          {/* Inspired By */}
                          <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] opacity-60">
                            {fragrance.inspiredBy}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-24 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="border-t border-theme-charcoal/10 pt-12">
              <p className="font-serif text-2xl italic opacity-80 mb-6">
                Ready to explore the collection?
              </p>
              <button
                onClick={() => router.push("/atlas")}
                className="inline-flex items-center gap-3 px-8 py-4 border border-theme-charcoal/30 font-mono text-xs font-semibold uppercase tracking-[0.3em] hover:bg-theme-charcoal hover:text-theme-alabaster transition-all duration-500"
              >
                Browse the Atlas
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
