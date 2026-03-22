/* eslint-disable */
'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Sparkles, Loader2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

// Waypoints Data
// MAPBOX_TOKEN_HERE (Using Leaflet fallback as requested)
const waypoints = [
  // EMBER TERRITORY
  { id: 'aden', name: 'ADEN', lat: 12.7797, lng: 45.0365, territory: 'EMBER', color: '#C4A265', legacy: 'Oud Fire', evocation: 'The port city exhales in layers: salt-crusted timber, coal smoke curling from dockside braziers, the honeyed amber of frankincense stacked in merchant stalls.', price: '$28/$48' },
  { id: 'saana', name: 'SAANA', lat: 15.3694, lng: 44.1910, territory: 'EMBER', color: '#C4A265', legacy: 'Honey Oud', evocation: 'The old city rises in gingerbread towers above the desert floor, and the air is thick with the sweetness of wild honey and aged agarwood.', price: '$28/$48' },
  { id: 'granada', name: 'GRANADA', lat: 37.1773, lng: -3.5986, territory: 'EMBER', color: '#C4A265', legacy: 'Granada Amber', evocation: 'The Alhambra glows amber at dusk, its walls still warm from the Andalusian sun.', price: '$28/$48' },
  { id: 'malabar', name: 'MALABAR', lat: 11.2588, lng: 75.7804, territory: 'EMBER', color: '#C4A265', legacy: 'Vanilla Sands', evocation: 'The Malabar Coast trades in everything precious: cardamom, pepper, vanilla, and the golden dust of resins carried by monsoon winds.', price: '$28/$48' },
  { id: 'serengeti', name: 'SERENGETI', lat: -2.3333, lng: 34.8333, territory: 'EMBER', color: '#C4A265', legacy: 'Black Musk', evocation: 'The plains stretch beyond comprehension, and the musk rises from the earth itself.', price: '$28/$48' },
  { id: 'beirut', name: 'BEIRUT', lat: 33.8938, lng: 35.5018, territory: 'EMBER', color: '#C4A265', legacy: null, evocation: 'The city rebuilt itself in gold and glass.', price: '$28/$48' },
  { id: 'tarifa', name: 'TARIFA', lat: 36.0143, lng: -5.6044, territory: 'EMBER', color: '#C4A265', legacy: 'Teeb Musk', evocation: 'The southernmost point of Europe, where the Mediterranean meets the Atlantic. This is where the Atlas begins.', price: '$28/$48' },

  // TIDAL TERRITORY
  { id: 'bahia', name: 'BAHIA', lat: -12.9714, lng: -38.5014, territory: 'TIDAL', color: '#6B9DAD', legacy: 'Coconut Jasmine', evocation: 'Salvador da Bahia moves to a rhythm older than the city itself.', price: '$30/$50' },
  { id: 'bahrain', name: 'BAHRAIN', lat: 26.2041, lng: 50.5515, territory: 'TIDAL', color: '#6B9DAD', legacy: 'Blue Oud', evocation: 'Before oil, there was pearl.', price: '$30/$50' },
  { id: 'big-sur', name: 'BIG SUR', lat: 36.2704, lng: -121.8081, territory: 'TIDAL', color: '#6B9DAD', legacy: 'Del Mar', evocation: 'The Pacific crashes against cathedral rocks.', price: '$30/$50' },
  { id: 'meishan', name: 'MEISHAN', lat: 30.0422, lng: 103.8318, territory: 'TIDAL', color: '#6B9DAD', legacy: 'China Rain', evocation: 'Rain falls on bamboo groves and temple roofs.', price: '$30/$50' },
  { id: 'monaco', name: 'MONACO', lat: 43.7384, lng: 7.4246, territory: 'TIDAL', color: '#6B9DAD', legacy: 'Dubai Musk', evocation: 'The harbor catches light like crushed diamonds.', price: '$30/$50' },
  { id: 'tangiers', name: 'TANGIERS', lat: 35.7595, lng: -5.8340, territory: 'TIDAL', color: '#6B9DAD', legacy: 'Regatta', evocation: 'The medina narrows and the light turns blue.', price: '$30/$50' },
  { id: 'tigris', name: 'TIGRIS', lat: 33.3152, lng: 44.3661, territory: 'TIDAL', color: '#6B9DAD', legacy: null, evocation: 'The ancient river carried amber resin downstream for centuries.', price: '$30/$50' },

  // PETAL TERRITORY
  { id: 'carmel', name: 'CARMEL', lat: 36.5552, lng: -121.9233, territory: 'PETAL', color: '#B8866B', legacy: 'White Amber', evocation: 'A town so committed to subtlety it doesn\'t have street addresses.', price: '$30/$50' },
  { id: 'damascus', name: 'DAMASCUS', lat: 37.7556, lng: 30.5566, territory: 'PETAL', color: '#B8866B', legacy: 'Turkish Rose', evocation: 'The rose harvest begins before dawn.', price: '$30/$50' },
  { id: 'tobago', name: 'TOBAGO', lat: 11.1889, lng: -60.6317, territory: 'PETAL', color: '#B8866B', legacy: 'Arabian Jasmine', evocation: 'The island blooms without being asked.', price: '$30/$50' },
  { id: 'kandy', name: 'KANDY', lat: 7.2906, lng: 80.6337, territory: 'PETAL', color: '#B8866B', legacy: 'Peach Memoir', evocation: 'The Temple of the Tooth keeps its sacred relic behind seven golden caskets.', price: '$30/$50' },
  { id: 'manali', name: 'MANALI', lat: 32.2396, lng: 77.1887, territory: 'PETAL', color: '#B8866B', legacy: 'Himalayan Musk', evocation: 'The Himalayan air thins and clears.', price: '$30/$50' },
  { id: 'medina', name: 'MEDINA', lat: 24.5247, lng: 39.5692, territory: 'PETAL', color: '#B8866B', legacy: 'Musk Tahara', evocation: 'The Prophet\'s city carries a particular stillness.', price: '$30/$50' },
  { id: 'siwa', name: 'SIWA', lat: 29.2032, lng: 25.5195, territory: 'PETAL', color: '#B8866B', legacy: 'White Egyptian Musk', evocation: 'The oasis appears like a rumor made real.', price: '$30/$50' },

  // TERRA TERRITORY
  { id: 'astoria', name: 'ASTORIA', lat: 46.1879, lng: -123.8313, territory: 'TERRA', color: '#7A6F5D', legacy: 'Pacific Moss', evocation: 'The Columbia River meets the Pacific and the old-growth forests drip with moss.', price: '$33/$55' },
  { id: 'havana', name: 'HAVANA', lat: 23.1136, lng: -82.3666, territory: 'TERRA', color: '#7A6F5D', legacy: 'Oud & Tobacco', evocation: 'The tobacco leaves hang in the vega barn, curing slowly in Caribbean humidity.', price: '$33/$55' },
  { id: 'hudson', name: 'HUDSON', lat: 42.2529, lng: -73.7910, territory: 'TERRA', color: '#7A6F5D', legacy: 'Spanish Sandalwood', evocation: 'Two hours north of Manhattan, the weekend escape for the creative class.', price: '$33/$55' },
  { id: 'marrakesh', name: 'MARRAKESH', lat: 31.6295, lng: -7.9811, territory: 'TERRA', color: '#7A6F5D', legacy: null, evocation: 'The souk folds around you: leather, cedar, cumin.', price: '$33/$55' },
  { id: 'riyadh', name: 'RIYADH', lat: 24.7136, lng: 46.6753, territory: 'TERRA', color: '#7A6F5D', legacy: 'Black Oud', evocation: 'The palace doors close and the room fills with oud.', price: '$33/$55' },
  { id: 'samarkand', name: 'SAMARKAND', lat: 39.6542, lng: 66.9597, territory: 'TERRA', color: '#7A6F5D', legacy: 'Oud Aura', evocation: 'The Registan\'s turquoise domes shimmer in the Central Asian sun.', price: '$33/$55' },
  { id: 'sicily', name: 'SICILY', lat: 37.5994, lng: 14.0154, territory: 'TERRA', color: '#7A6F5D', legacy: 'Sicilian Oudh', evocation: 'The citrus groves climb the volcanic slopes.', price: '$33/$55' },
];

const createCustomIcon = (color: string, isDimmed: boolean, name: string, territory: string) => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative group cursor-pointer flex items-center justify-center w-6 h-6 transition-transform duration-300 hover:scale-150 ${isDimmed ? 'opacity-20' : 'opacity-100'}">
        <div class="absolute w-3 h-3 rounded-full animate-pulse" style="background-color: ${color}; box-shadow: 0 0 10px ${color}, 0 0 20px ${color};"></div>
        <div class="absolute w-2 h-2 rounded-full bg-white opacity-80"></div>
        
        <!-- Tooltip -->
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div class="bg-[#2C2C2C] text-[#F5F0EB] px-3 py-1.5 rounded border border-[#C4A265]/30 shadow-xl flex flex-col items-center">
            <span class="font-serif text-sm tracking-wider">${name}</span>
            <span class="font-mono text-[9px] uppercase tracking-widest" style="color: ${color}">${territory}</span>
          </div>
          <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2C2C2C] mx-auto"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function CustomZoomControl({ isPanelOpen }: { isPanelOpen: boolean }) {
  const map = useMap();
  
  const stopPropagation = (e: React.MouseEvent | React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`absolute bottom-8 z-[1000] flex flex-col gap-1 bg-[#1a1714]/80 backdrop-blur-md p-1 rounded border border-[#C4A265]/20 shadow-2xl transition-all duration-500 ease-in-out ${
        isPanelOpen ? 'right-8 md:right-[432px] opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'right-8'
      }`}
      onDoubleClick={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      onWheel={stopPropagation}
      onClick={stopPropagation}
      onTouchStart={stopPropagation}
      onTouchEnd={stopPropagation}
    >
      <button 
        onClick={(e) => { stopPropagation(e); map.zoomIn(); }} 
        className="w-8 h-8 flex items-center justify-center text-[#C4A265] hover:bg-[#C4A265]/10 hover:text-[#d4b57e] rounded transition-colors" 
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus size={18} />
      </button>
      <div className="w-5 h-px bg-[#C4A265]/20 mx-auto"></div>
      <button 
        onClick={(e) => { stopPropagation(e); map.zoomOut(); }} 
        className="w-8 h-8 flex items-center justify-center text-[#C4A265] hover:bg-[#C4A265]/10 hover:text-[#d4b57e] rounded transition-colors" 
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus size={18} />
      </button>
    </div>
  );
}

function MapController({ selectedTerritory, selectedWaypoint }: { selectedTerritory: string, selectedWaypoint: typeof waypoints[0] | null }) {
  const map = useMap();
  
  useEffect(() => {
    // Force a resize calculation to ensure the map fills the container
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  useEffect(() => {
    if (selectedWaypoint) {
      // Fly to the waypoint smoothly. Offset slightly to account for the right panel on desktop.
      const isDesktop = window.innerWidth >= 768;
      
      if (isDesktop) {
        // Shift center to the right so the marker appears more to the left, avoiding the 400px panel
        const targetPoint = map.project([selectedWaypoint.lat, selectedWaypoint.lng], 5);
        targetPoint.x += 200; 
        const targetLatLng = map.unproject(targetPoint, 5);
        map.flyTo(targetLatLng, 5, { duration: 1.5, easeLinearity: 0.25 });
      } else {
        map.flyTo([selectedWaypoint.lat, selectedWaypoint.lng], 4, { duration: 1.5, easeLinearity: 0.25 });
      }
    }
  }, [selectedWaypoint, map]);

  return null;
}

export default function AtlasMap() {
  const [selectedTerritory, setSelectedTerritory] = useState<string>('ALL');
  const [selectedWaypoint, setSelectedWaypoint] = useState<typeof waypoints[0] | null>(null);
  const [geminiResponse, setGeminiResponse] = useState<{ text: string; links: { uri: string; title: string }[] } | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  const territories = ['ALL', 'EMBER', 'TIDAL', 'PETAL', 'TERRA'];

  // Reset Gemini state when waypoint changes
  useEffect(() => {
    setGeminiResponse(null);
    setIsLoadingGemini(false);
  }, [selectedWaypoint]);

  const fetchGeminiInfo = async (waypoint: typeof waypoints[0]) => {
    setIsLoadingGemini(true);
    setGeminiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an antique atlas giving a poetic, atmospheric description of the real-world location of ${waypoint.name} at coordinates ${waypoint.lat}, ${waypoint.lng}. What is the geography and atmosphere like today? Keep it brief (2-3 sentences), fitting an antique atlas theme.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });
      
      let text = response.text || "The atlas is silent on this location.";
      
      // Extract URLs from grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links: { uri: string; title: string }[] = [];
      
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ uri: chunk.web.uri, title: chunk.web.title });
        } else if (chunk.maps?.uri && chunk.maps?.title) {
          links.push({ uri: chunk.maps.uri, title: chunk.maps.title });
        }
      });
      
      setGeminiResponse({ text, links });
    } catch (error) {
      console.error("Gemini error:", error);
      setGeminiResponse({ text: "The winds of knowledge are currently blocked. Try again later.", links: [] });
    } finally {
      setIsLoadingGemini(false);
    }
  };

  return (
    <div className="w-full h-full relative font-serif text-[#F5F0EB] overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-6 pointer-events-none flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-[#C4A265] drop-shadow-lg mb-2">THE ATLAS</h1>
        <p className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-[#F5F0EB]/70 drop-shadow-md">
          Four Territories · 28 Waypoints · One Atlas
        </p>
      </div>

      {/* Filter Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-wrap justify-center gap-2 md:gap-4 bg-[#1a1714]/80 backdrop-blur-md p-2 md:p-3 rounded-full border border-[#C4A265]/20 shadow-2xl">
        {territories.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTerritory(t)}
            className={`px-4 py-1.5 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
              selectedTerritory === t 
                ? 'bg-[#C4A265] text-[#1a1714] font-bold shadow-[0_0_15px_rgba(196,162,101,0.4)]' 
                : 'text-[#F5F0EB]/70 hover:text-[#C4A265] hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-[1000] hidden lg:flex flex-col gap-3 bg-[#1a1714]/80 backdrop-blur-md p-5 rounded border border-[#C4A265]/20 shadow-2xl">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F5F0EB]/50 border-b border-[#C4A265]/20 pb-2 mb-1">
          Cartographer's Key
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { name: 'Ember', color: '#C4A265' },
            { name: 'Tidal', color: '#6B9DAD' },
            { name: 'Petal', color: '#B8866B' },
            { name: 'Terra', color: '#7A6F5D' }
          ].map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-3 h-3">
                <div className="absolute w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}` }}></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
              </div>
              <span className="font-serif text-xs text-[#F5F0EB]/80 tracking-wide">{t.name} Territory</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 z-0 bg-[#1a1714]">
        <MapContainer 
          center={[25, 35]} 
          zoom={3} 
          scrollWheelZoom={true}
          zoomControl={false}
          zoomSnap={0.25}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={120}
          fadeAnimation={true}
          markerZoomAnimation={true}
          className="w-full h-full map-antique-filter"
          style={{ background: '#1a1714' }}
        >
          {/* CartoDB Dark Matter No Labels */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={10}
            minZoom={2}
          />
          
          <CustomZoomControl isPanelOpen={!!selectedWaypoint} />
          <MapController selectedTerritory={selectedTerritory} selectedWaypoint={selectedWaypoint} />

          {waypoints.map((wp) => {
            const isDimmed = selectedTerritory !== 'ALL' && selectedTerritory !== wp.territory;
            return (
              <Marker
                key={wp.id}
                position={[wp.lat, wp.lng]}
                icon={createCustomIcon(wp.color, isDimmed, wp.name, wp.territory)}
                eventHandlers={{
                  click: () => setSelectedWaypoint(wp),
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedWaypoint && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#1a1714]/95 backdrop-blur-xl border-l border-[#C4A265]/20 z-[2000] shadow-2xl flex flex-col"
          >
            <div className="p-8 flex-1 overflow-y-auto">
              <button 
                onClick={() => setSelectedWaypoint(null)}
                className="absolute top-6 right-6 text-[#F5F0EB]/50 hover:text-[#C4A265] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mt-12 mb-6">
                <span 
                  className="inline-block px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase mb-4 border"
                  style={{ color: selectedWaypoint.color, borderColor: `${selectedWaypoint.color}40`, backgroundColor: `${selectedWaypoint.color}10` }}
                >
                  {selectedWaypoint.territory} TERRITORY
                </span>
                <h2 className="text-5xl font-serif tracking-wide text-[#F5F0EB] mb-2">
                  {selectedWaypoint.name}
                </h2>
                {selectedWaypoint.legacy && (
                  <p className="font-serif italic text-[#F5F0EB]/50 text-sm mb-6">
                    Formerly known as "{selectedWaypoint.legacy}"
                  </p>
                )}
              </div>

              <div className="w-12 h-px bg-[#C4A265]/30 mb-8"></div>

              <p className="font-serif text-lg leading-relaxed text-[#F5F0EB]/90 mb-10 italic">
                "{selectedWaypoint.evocation}"
              </p>

              <div className="space-y-4 font-mono text-xs tracking-widest text-[#F5F0EB]/60 uppercase mb-10">
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-[#C4A265]" />
                  <span>
                    {Math.abs(selectedWaypoint.lat).toFixed(4)}° {selectedWaypoint.lat >= 0 ? 'N' : 'S'},{' '}
                    {Math.abs(selectedWaypoint.lng).toFixed(4)}° {selectedWaypoint.lng >= 0 ? 'E' : 'W'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 flex items-center justify-center border border-[#C4A265] rounded-full text-[#C4A265] text-[8px]">$</span>
                  <span>{selectedWaypoint.price}</span>
                </div>
              </div>

              {/* Gemini Integration */}
              <div className="bg-[#C4A265]/5 border border-[#C4A265]/20 rounded p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-[#C4A265]" />
                  <h3 className="font-serif text-[#C4A265] tracking-widest text-sm uppercase">Ask the Atlas</h3>
                </div>
                
                {!geminiResponse && !isLoadingGemini && (
                  <div>
                    <p className="font-serif text-sm text-[#F5F0EB]/70 mb-4 italic">
                      Consult the cartographer's notes for the current state of this location.
                    </p>
                    <button 
                      onClick={() => fetchGeminiInfo(selectedWaypoint)}
                      className="px-4 py-2 border border-[#C4A265]/40 text-[#C4A265] hover:bg-[#C4A265]/10 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
                    >
                      Reveal Modern Geography
                    </button>
                  </div>
                )}

                {isLoadingGemini && (
                  <div className="flex items-center gap-3 text-[#C4A265]/70 py-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-serif italic text-sm">Consulting the archives...</span>
                  </div>
                )}

                {geminiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="font-serif text-sm leading-relaxed text-[#F5F0EB]/90">
                      {geminiResponse.text}
                    </p>
                    
                    {geminiResponse.links.length > 0 && (
                      <div className="pt-3 border-t border-[#C4A265]/10">
                        <span className="block font-mono text-[9px] tracking-widest uppercase text-[#C4A265]/70 mb-2">Sources</span>
                        <ul className="space-y-1">
                          {geminiResponse.links.map((link, idx) => (
                            <li key={idx}>
                              <a 
                                href={link.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-serif text-xs text-[#F5F0EB]/60 hover:text-[#C4A265] underline decoration-[#C4A265]/30 underline-offset-2 transition-colors line-clamp-1"
                              >
                                {link.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-[#C4A265]/10 bg-[#1a1714]">
              <a 
                href={`/product/${selectedWaypoint.id}`}
                className="block w-full py-4 text-center font-mono text-xs tracking-[0.2em] uppercase bg-[#C4A265] text-[#1a1714] hover:bg-[#d4b57e] transition-colors rounded-sm font-bold"
              >
                Explore Waypoint
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
