"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Map projection calibrated to atlas-map.jpg
// The parchment border takes ~4% on each side
// Calibrated using reference points:
// - Tarifa, Spain (36°N, 5.6°W) should be ~46% x, ~30% y
// - Big Sur, California (36°N, 121°W) should be ~14% x, ~30% y
// - Meishan, China (30°N, 103°E) should be ~74% x, ~33% y
const MAP_BOUNDS = {
  north: 78,
  south: -62,
  west: -175,
  east: 185,
};

// Offset to account for parchment border (% from edge)
const PADDING = {
  left: 4,
  right: 4,
  top: 3,
  bottom: 5,
};

function latLongToPercent(lat: number, long: number) {
  const rawX = ((long - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const rawY = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;

  // Scale to the usable area within the parchment border
  const usableWidth = 100 - PADDING.left - PADDING.right;
  const usableHeight = 100 - PADDING.top - PADDING.bottom;

  const x = PADDING.left + (rawX / 100) * usableWidth;
  const y = PADDING.top + (rawY / 100) * usableHeight;

  return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
}

interface Waypoint {
  name: string;
  slug: string;
  territory: "ember" | "tidal" | "petal" | "terra";
  lat: number;
  long: number;
  // Manual x/y overrides (percentage) calibrated to atlas-map.jpg
  // When set, these take priority over lat/long projection
  x?: number;
  y?: number;
  legacyName?: string;
  evocation?: string;
}

const TERRITORY_COLORS: Record<string, string> = {
  ember: "#C4A265",
  tidal: "#6B9DAD",
  petal: "#B8866B",
  terra: "#7A6F5D",
};

const TERRITORY_LABELS: Record<string, string> = {
  ember: "EMBER",
  tidal: "TIDAL",
  petal: "PETAL",
  terra: "TERRA",
};

// Waypoints with manually calibrated x/y positions (%) for atlas-map.jpg
// Calibrated against visible landmarks on the map:
// - US West Coast ~14-15% x
// - US East Coast ~22-24% x
// - Caribbean ~24-26% x
// - Brazil ~30-32% x
// - Western Europe ~46-48% x
// - North Africa ~47-50% x
// - Middle East ~55-58% x
// - India ~66-68% x
// - China ~74-76% x
// - Vertical: Europe ~28%, Sahara ~42%, Equator ~50%, S. America ~58%
const WAYPOINTS: Waypoint[] = [
  // EMBER
  { name: "ADEN", slug: "aden", territory: "ember", lat: 12.7797, long: 45.0365, x: 56, y: 50, legacyName: "Oud Fire", evocation: "The port city exhales in layers: salt-crusted timber, coal smoke curling from dockside braziers, the honeyed amber of frankincense stacked in merchant stalls." },
  { name: "SAANA", slug: "saana", territory: "ember", lat: 15.3694, long: 44.1910, x: 55.5, y: 48, legacyName: "Honey Oud", evocation: "The old city rises in gingerbread towers above the desert floor, and the air is thick with the sweetness of wild honey and aged agarwood." },
  { name: "GRANADA", slug: "granada", territory: "ember", lat: 37.1773, long: -3.5986, x: 46.5, y: 30, legacyName: "Granada Amber", evocation: "The Alhambra glows amber at dusk, its walls still warm from the Andalusian sun, and the courtyards carry the memory of Moorish perfumers." },
  { name: "MALABAR", slug: "malabar", territory: "ember", lat: 11.2588, long: 75.7804, x: 67, y: 50, legacyName: "Vanilla Sands", evocation: "The Malabar Coast trades in everything precious: cardamom, pepper, vanilla, and the golden dust of resins carried by monsoon winds." },
  { name: "SERENGETI", slug: "serengeti", territory: "ember", lat: -2.3333, long: 34.8333, x: 53, y: 55, legacyName: "Black Musk", evocation: "The plains stretch beyond comprehension, and the musk rises from the earth itself, dark, ancestral, carrying the weight of a continent." },
  { name: "BEIRUT", slug: "beirut", territory: "ember", lat: 33.8938, long: 35.5018, x: 54, y: 32, evocation: "The city rebuilt itself in gold and glass, and the nightlife carries the magnetism of somewhere that has survived everything and emerged more beautiful." },
  { name: "TARIFA", slug: "tarifa", territory: "ember", lat: 36.0143, long: -5.6044, x: 46, y: 31, legacyName: "Teeb Musk", evocation: "The southernmost point of Europe, where the Mediterranean meets the Atlantic and Africa shimmers across the strait. This is where the Atlas begins." },

  // TIDAL
  { name: "BAHIA", slug: "bahia", territory: "tidal", lat: -12.9714, long: -38.5014, x: 33, y: 58, legacyName: "Coconut Jasmine", evocation: "Salvador da Bahia moves to a rhythm older than the city itself. Coconut oil glistens on sun-warmed skin and jasmine tumbles over colonial balconies." },
  { name: "BAHRAIN", slug: "bahrain", territory: "tidal", lat: 26.2041, long: 50.5515, x: 57.5, y: 38, legacyName: "Blue Oud", evocation: "Before oil, there was pearl. For four thousand years, Bahraini divers descended into the Gulf, hunting oysters in waters so warm they were nearly body-temperature." },
  { name: "BIG SUR", slug: "big-sur", territory: "tidal", lat: 36.2704, long: -121.8081, x: 14, y: 32, legacyName: "Del Mar", evocation: "The Pacific crashes against cathedral rocks and the fog carries salt, kelp, and the mineral breath of a coastline that has never been tamed." },
  { name: "MEISHAN", slug: "meishan", territory: "tidal", lat: 30.0422, long: 103.8318, x: 75, y: 35, legacyName: "China Rain", evocation: "Rain falls on bamboo groves and temple roofs. The green note is immediate, the lily appears like a whisper, and everything dissolves into mist." },
  { name: "MONACO", slug: "monaco", territory: "tidal", lat: 43.7384, long: 7.4246, x: 49, y: 27, legacyName: "Dubai Musk", evocation: "The harbor catches light like crushed diamonds, and the musk that rises from sun-warmed skin carries the particular confidence of effortless wealth." },
  { name: "TANGIERS", slug: "tangiers", territory: "tidal", lat: 35.7595, long: -5.8340, x: 45.5, y: 32, legacyName: "Regatta", evocation: "The medina narrows and the light turns blue. Tangiers sits at the hinge of two seas, two continents, and its scent carries that duality." },
  { name: "TIGRIS", slug: "tigris", territory: "tidal", lat: 33.3152, long: 44.3661, x: 56, y: 34, evocation: "The ancient river carried amber resin downstream for centuries. Water and warmth fused into something that belongs to the cradle of civilization." },

  // PETAL
  { name: "CARMEL", slug: "carmel", territory: "petal", lat: 36.5552, long: -121.9233, x: 14, y: 31, legacyName: "White Amber", evocation: "A town so committed to subtlety it doesn't have street addresses. The amber here is barely there, a warmth that exists just beneath the surface of clean skin." },
  { name: "DAMASCUS", slug: "damascus", territory: "petal", lat: 37.7556, long: 30.5566, x: 53.5, y: 30, legacyName: "Turkish Rose", evocation: "The rose harvest begins before dawn. Hands move through wet petals, heavy-headed Damask roses blooming in a perfection that lasts only hours." },
  { name: "TOBAGO", slug: "tobago", territory: "petal", lat: 11.1889, long: -60.6317, x: 28, y: 48, legacyName: "Arabian Jasmine", evocation: "The island blooms without being asked. White flowers climbing over everything, jasmine so sweet it makes the warm night air tremble." },
  { name: "KANDY", slug: "kandy", territory: "petal", lat: 7.2906, long: 80.6337, x: 68.5, y: 52, legacyName: "Peach Memoir", evocation: "The Temple of the Tooth keeps its sacred relic behind seven golden caskets, and the gardens outside bloom with a sweetness that borders on devotion." },
  { name: "MANALI", slug: "manali", territory: "petal", lat: 32.2396, long: 77.1887, x: 67.5, y: 34, legacyName: "Himalayan Musk", evocation: "The Himalayan air thins and clears. At this altitude, everything unnecessary falls away, leaving only the clean musk of mountain mornings." },
  { name: "MEDINA", slug: "medina", territory: "petal", lat: 24.5247, long: 39.5692, x: 55, y: 40, legacyName: "Musk Tahara", evocation: "The Prophet's city carries a particular stillness. White musk, cotton, the powdery softness of a scent worn for purity rather than performance." },
  { name: "SIWA", slug: "siwa", territory: "petal", lat: 29.2032, long: 25.5195, x: 51, y: 38, legacyName: "White Egyptian Musk", evocation: "The oasis appears like a rumor made real. Date palms, salt lakes, and a silence so complete you can hear the desert breathe." },

  // TERRA
  { name: "ASTORIA", slug: "astoria", territory: "terra", lat: 46.1879, long: -123.8313, x: 13.5, y: 24, legacyName: "Pacific Moss", evocation: "The Columbia River meets the Pacific and the old-growth forests drip with moss. Everything here grows faster than anyone can clear it." },
  { name: "HAVANA", slug: "havana", territory: "terra", lat: 23.1136, long: -82.3666, x: 22, y: 40, legacyName: "Oud & Tobacco", evocation: "The tobacco leaves hang in the vega barn, curing slowly in Caribbean humidity. Dark leaf, sweet wood, the caramel edge of aged rum." },
  { name: "HUDSON", slug: "hudson", territory: "terra", lat: 42.2529, long: -73.7910, x: 24, y: 27, legacyName: "Spanish Sandalwood", evocation: "Two hours north of Manhattan, the weekend escape for the creative class. Antique shops, independent bookstores, converted warehouses." },
  { name: "MARRAKESH", slug: "marrakesh", territory: "terra", lat: 31.6295, long: -7.9811, x: 45.5, y: 35, evocation: "The souk folds around you: leather, cedar, cumin, the metallic ring of hammered brass. A city that assaults the senses and rewards the brave." },
  { name: "RIYADH", slug: "riyadh", territory: "terra", lat: 24.7136, long: 46.6753, x: 57, y: 40, legacyName: "Black Oud", evocation: "The palace doors close and the room fills with oud, not the souvenir variety, but something older, deeper, the kind aged in crystal decanters." },
  { name: "SAMARKAND", slug: "samarkand", territory: "terra", lat: 39.6542, long: 66.9597, x: 63, y: 29, legacyName: "Oud Aura", evocation: "The Registan's turquoise domes shimmer in the Central Asian sun and the Silk Road ghosts are everywhere." },
  { name: "SICILY", slug: "sicily", territory: "terra", lat: 37.5994, long: 14.0154, x: 50, y: 29, legacyName: "Sicilian Oudh", evocation: "The citrus groves climb the volcanic slopes and the air is electric: bergamot, blood orange, the mineral breath of Etna's black soil." },
];

interface AtlasMapProps {
  activeTerritory?: string | null;
  onWaypointClick?: (slug: string) => void;
}

// Territory pricing for the detail panel
const TERRITORY_PRICING: Record<string, string> = {
  ember: "$28 / $48",
  tidal: "$30 / $50",
  petal: "$30 / $50",
  terra: "$33 / $55",
};

export function AtlasMap({ activeTerritory, onWaypointClick }: AtlasMapProps) {
  const [hoveredWaypoint, setHoveredWaypoint] = useState<string | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredWaypoints = activeTerritory
    ? WAYPOINTS.filter((w) => w.territory === activeTerritory)
    : WAYPOINTS;

  return (
    <div className="atlas-map-wrapper">
      <div
        ref={mapRef}
        className="relative w-full aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1] min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden rounded-sm border border-theme-charcoal/10"
      >
      {/* Map Background */}
      <Image
        src="/images/atlas-map.jpg"
        alt="Tarife Attar Atlas Map — 28 waypoints across four territories"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      {/* Overlay to fade map and make waypoints pop */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Waypoint Markers */}
      {WAYPOINTS.map((waypoint) => {
        // Use manual x/y if available, otherwise fall back to projection
        const projected = latLongToPercent(waypoint.lat, waypoint.long);
        const x = waypoint.x ?? projected.x;
        const y = waypoint.y ?? projected.y;
        const isActive = !activeTerritory || waypoint.territory === activeTerritory;
        const isHovered = hoveredWaypoint === waypoint.name;
        const color = TERRITORY_COLORS[waypoint.territory];

        return (
          <div
            key={waypoint.name}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isHovered ? 50 : 10,
            }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 28,
                height: 28,
                left: -10,
                top: -10,
                border: `1.5px solid ${color}`,
                opacity: isActive ? 0.5 : 0,
              }}
              animate={isActive ? {
                scale: [1, 1.6, 1],
                opacity: [0.5, 0, 0.5],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
            />

            {/* Marker dot — padded for easier clicking */}
            <button
              className="block p-3 -m-3"
              onClick={() => {
                setSelectedWaypoint(waypoint);
                if (onWaypointClick) onWaypointClick(waypoint.slug);
              }}
              onMouseEnter={() => setHoveredWaypoint(waypoint.name)}
              onMouseLeave={() => setHoveredWaypoint(null)}
            >
              <motion.div
                className="rounded-full cursor-pointer transition-all"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: color,
                  opacity: isActive ? 1 : 0.2,
                  boxShadow: isHovered
                    ? `0 0 20px ${color}, 0 0 8px ${color}, 0 0 4px white`
                    : `0 0 8px ${color}, 0 0 3px rgba(255,255,255,0.5)`,
                }}
                whileHover={{ scale: 2 }}
                transition={{ duration: 0.2 }}
              />
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 pointer-events-none"
                >
                  <div className="bg-theme-charcoal/95 backdrop-blur-sm px-3 py-2 rounded-sm whitespace-nowrap">
                    <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-theme-alabaster/50 mb-0.5">
                      {TERRITORY_LABELS[waypoint.territory]}
                    </div>
                    <div className="font-serif text-sm text-theme-alabaster tracking-tight">
                      {waypoint.name}
                    </div>
                    {waypoint.legacyName && (
                      <div className="font-mono text-[8px] uppercase tracking-widest text-theme-alabaster/40 mt-0.5">
                        {waypoint.legacyName}
                      </div>
                    )}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="w-2 h-2 bg-theme-charcoal/95 rotate-45 mx-auto -mt-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Territory Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        {Object.entries(TERRITORY_COLORS).map(([territory, color]) => (
          <div
            key={territory}
            className={`flex items-center gap-1.5 transition-opacity ${
              activeTerritory && activeTerritory !== territory ? "opacity-30" : "opacity-80"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/70">
              {territory}
            </span>
          </div>
        ))}
        </div>
      </div>

      {/* Detail Panel - appears below the map when a waypoint is selected */}
      <AnimatePresence mode="wait">
      {selectedWaypoint && (
        <motion.div
          key={selectedWaypoint.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded-sm overflow-hidden"
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Left: Waypoint info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TERRITORY_COLORS[selectedWaypoint.territory] }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  {TERRITORY_LABELS[selectedWaypoint.territory]} Territory
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif italic text-[#f5f0eb] tracking-tight mb-1">
                {selectedWaypoint.name}
              </h3>

              {selectedWaypoint.legacyName && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">
                  Formerly known as {selectedWaypoint.legacyName}
                </p>
              )}

              <p className="font-serif text-sm md:text-base text-white/70 leading-relaxed mb-4">
                {selectedWaypoint.evocation || `A waypoint in the ${TERRITORY_LABELS[selectedWaypoint.territory]} territory. Click below to explore the full composition.`}
              </p>

              <div className="flex items-center gap-6">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                  {TERRITORY_PRICING[selectedWaypoint.territory]}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                  {selectedWaypoint.lat.toFixed(2)}° {selectedWaypoint.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedWaypoint.long).toFixed(2)}° {selectedWaypoint.long >= 0 ? 'E' : 'W'}
                </span>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex flex-col justify-center items-start md:items-end gap-3">
              <Link
                href={`/product/${selectedWaypoint.slug}`}
                className="group flex items-center gap-3 px-6 py-3 border border-[#c9a96e]/40 hover:border-[#c9a96e] hover:bg-[#c9a96e]/10 transition-all"
              >
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c9a96e]">
                  Explore Waypoint
                </span>
                <ArrowRight className="w-4 h-4 text-[#c9a96e] group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setSelectedWaypoint(null)}
                className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

