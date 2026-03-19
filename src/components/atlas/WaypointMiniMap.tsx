'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TERRITORY_COLORS: Record<string, string> = {
  ember: '#C4A265',
  tidal: '#6B9DAD',
  petal: '#B8866B',
  terra: '#7A6F5D',
};

const TERRITORY_NAMES: Record<string, string> = {
  ember: 'Ember',
  tidal: 'Tidal',
  petal: 'Petal',
  terra: 'Terra',
};

function createWaypointIcon(color: string) {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="flex items-center justify-center w-5 h-5">
        <div class="absolute w-3 h-3 rounded-full animate-pulse" style="background-color: ${color}; box-shadow: 0 0 12px ${color}, 0 0 24px ${color};"></div>
        <div class="absolute w-2 h-2 rounded-full bg-white opacity-90"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function MapSetup({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

interface WaypointMiniMapProps {
  lat: number;
  lng: number;
  territory: string;
  coordinates?: string;
}

export function WaypointMiniMap({ lat, lng, territory, coordinates }: WaypointMiniMapProps) {
  const color = TERRITORY_COLORS[territory] || '#C4A265';
  const name = TERRITORY_NAMES[territory] || 'Atlas';

  return (
    <div className="relative w-full aspect-[16/9] rounded overflow-hidden border border-theme-charcoal/10">
      <MapContainer
        center={[lat, lng]}
        zoom={7}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        className="w-full h-full atlas-map-antique"
        style={{ background: '#2a2520' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={10}
          minZoom={2}
        />
        <Marker
          position={[lat, lng]}
          icon={createWaypointIcon(color)}
          interactive={false}
        />
        <MapSetup lat={lat} lng={lng} />
      </MapContainer>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
              Origin · {name} Territory
            </span>
          </div>
          {coordinates && (
            <span className="font-mono text-[9px] text-white/40">
              {coordinates}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
