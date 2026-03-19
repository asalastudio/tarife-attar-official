"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const TERRITORY_COLORS: Record<string, { pin: string; glow: string; bg: string }> = {
  ember: { pin: "#d4854a", glow: "rgba(212,133,74,0.4)", bg: "rgba(212,133,74,0.12)" },
  tidal: { pin: "#5b8fa8", glow: "rgba(91,143,168,0.4)", bg: "rgba(91,143,168,0.12)" },
  petal: { pin: "#c4788a", glow: "rgba(196,120,138,0.4)", bg: "rgba(196,120,138,0.12)" },
  terra: { pin: "#6b7f5e", glow: "rgba(107,127,94,0.4)", bg: "rgba(107,127,94,0.12)" },
};

export interface MapWaypoint {
  atlasName: string;
  legacyName?: string | null;
  slug: string;
  territory: string;
  scentNotes: string;
  mapPin: string;
  lat: number;
  long: number;
  price6ml: number;
  price12ml: number;
  evocationCopy?: string | null;
}

interface InteractiveMapProps {
  waypoints: MapWaypoint[];
  activeTerritory?: string | null;
  onTerritoryChange?: (territory: string | null) => void;
}

export function InteractiveMap({
  waypoints,
  activeTerritory,
  onTerritoryChange,
}: InteractiveMapProps) {
  const [selectedPin, setSelectedPin] = useState<MapWaypoint | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const filteredWaypoints = useMemo(
    () =>
      activeTerritory
        ? waypoints.filter((w) => w.territory === activeTerritory)
        : waypoints,
    [waypoints, activeTerritory]
  );

  const handlePinClick = useCallback((waypoint: MapWaypoint) => {
    setSelectedPin((prev) => (prev?.slug === waypoint.slug ? null : waypoint));
  }, []);

  const territories = ["ember", "tidal", "petal", "terra"] as const;

  return (
    <div className="relative w-full">
      {/* Territory filter tabs */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => onTerritoryChange?.(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.15em] transition-all ${
            !activeTerritory
              ? "bg-[#c9a96e]/20 text-[#c9a96e] ring-1 ring-[#c9a96e]/40"
              : "text-[#f5f0eb]/50 hover:text-[#f5f0eb]/80"
          }`}
        >
          All ({waypoints.length})
        </button>
        {territories.map((t) => {
          const count = waypoints.filter((w) => w.territory === t).length;
          const colors = TERRITORY_COLORS[t];
          return (
            <button
              key={t}
              onClick={() => onTerritoryChange?.(activeTerritory === t ? null : t)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.15em] transition-all ${
                activeTerritory === t
                  ? "ring-1"
                  : "text-[#f5f0eb]/50 hover:text-[#f5f0eb]/80"
              }`}
              style={
                activeTerritory === t
                  ? { backgroundColor: colors.bg, color: colors.pin, boxShadow: `inset 0 0 0 1px ${colors.pin}` }
                  : undefined
              }
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden bg-[#0f0f0f] border border-[#f5f0eb]/5">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 160 }}
          style={{ width: "100%", height: "auto" }}
          viewBox="0 0 800 450"
        >
          <ZoomableGroup center={[20, 15]} zoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={String(geo.rpiProperties?.name || geo.id || Math.random())}
                    geography={geo}
                    fill="#1a1a1a"
                    stroke="#2a2a2a"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#222" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {filteredWaypoints.map((waypoint) => {
              const colors = TERRITORY_COLORS[waypoint.territory];
              const isSelected = selectedPin?.slug === waypoint.slug;
              const isHovered = hoveredPin === waypoint.slug;
              const pinScale = isSelected ? 1.6 : isHovered ? 1.3 : 1;

              return (
                <Marker
                  key={waypoint.slug}
                  coordinates={[waypoint.long, waypoint.lat]}
                  onClick={() => handlePinClick(waypoint)}
                  onMouseEnter={() => setHoveredPin(waypoint.slug)}
                  onMouseLeave={() => setHoveredPin(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glow ring */}
                  <circle
                    r={isSelected ? 10 : 6}
                    fill="none"
                    stroke={colors.pin}
                    strokeWidth={0.5}
                    opacity={isSelected || isHovered ? 0.5 : 0}
                  />
                  {/* Pin dot */}
                  <circle
                    r={3.5 * pinScale}
                    fill={colors.pin}
                    stroke="#0f0f0f"
                    strokeWidth={1}
                    opacity={activeTerritory && waypoint.territory !== activeTerritory ? 0.2 : 1}
                  />
                  {/* Label */}
                  {(isSelected || isHovered) && (
                    <text
                      textAnchor="middle"
                      y={-12}
                      style={{
                        fontFamily: "EB Garamond, serif",
                        fontSize: "8px",
                        fill: colors.pin,
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                      }}
                    >
                      {waypoint.atlasName}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Flyout card */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 mx-auto max-w-lg rounded-xl border border-[#f5f0eb]/10 bg-[#111]/95 backdrop-blur-sm p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-1"
                  style={{ color: TERRITORY_COLORS[selectedPin.territory]?.pin }}
                >
                  {selectedPin.territory} Territory
                </span>
                <h3 className="text-2xl font-serif text-[#f5f0eb] tracking-wide">
                  {selectedPin.atlasName}
                </h3>
                {selectedPin.legacyName && (
                  <p className="text-xs text-[#f5f0eb]/40 font-mono mt-0.5">
                    You knew it as {selectedPin.legacyName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-[#f5f0eb]/30 hover:text-[#f5f0eb]/70 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-[#f5f0eb]/60 mb-3 italic">
              {selectedPin.scentNotes}
            </p>

            {selectedPin.evocationCopy && (
              <p className="text-sm text-[#f5f0eb]/70 leading-relaxed mb-4 font-serif line-clamp-4">
                {selectedPin.evocationCopy}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#f5f0eb]/40 font-mono">
                {selectedPin.mapPin} &middot; ${selectedPin.price6ml} &ndash; ${selectedPin.price12ml}
              </span>
              <Link
                href={`/product/${selectedPin.slug}`}
                className="px-5 py-2 rounded-full text-xs font-mono uppercase tracking-[0.15em] transition-all"
                style={{
                  backgroundColor: TERRITORY_COLORS[selectedPin.territory]?.pin,
                  color: "#0f0f0f",
                }}
              >
                Shop
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
