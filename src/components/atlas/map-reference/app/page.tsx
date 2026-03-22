'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const AtlasMap = dynamic(() => import('@/components/AtlasMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-[#1a1714] text-[#C4A265] font-serif">
      <p className="text-xl tracking-widest uppercase">Loading Atlas...</p>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="w-full h-screen bg-[#1a1714] overflow-hidden flex flex-col relative">
      <AtlasMap />
    </main>
  );
}
