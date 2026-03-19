'use client';

import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PortOfCall } from '@/sanity/lib/queries';

// Fix Leaflet default icon path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

interface CommunityMapProps {
  ports: PortOfCall[];
}

export function CommunityMap({ ports }: CommunityMapProps) {
  return (
    <div className="w-full h-full relative font-serif text-[#F5F0EB]">
      <MapContainer
        center={[25, 20]}
        zoom={2}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        className="w-full h-full atlas-map-ocean"
        style={{ background: '#0a1628' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/voyager_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={10}
          minZoom={2}
        />

        {ports.map((port, idx) => (
          <CircleMarker
            key={`${port.city}-${port.country}-${idx}`}
            center={[port.latitude, port.longitude]}
            radius={3}
            pathOptions={{
              color: '#C4A265',
              fillColor: '#C4A265',
              fillOpacity: 0.6,
              weight: 0.5,
              opacity: 0.8,
            }}
          >
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Counter overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] text-center">
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#C4A265]/80">
          28 waypoints · {ports.length} {ports.length === 1 ? 'port' : 'ports'} reached · One atlas
        </p>
      </div>
    </div>
  );
}
