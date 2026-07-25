import { Suspense } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import {
  atlasProductsByTerritoryQuery,
  atlasTerritoryCountsQuery,
  placeholderImagesQuery,
  PlaceholderImagesQueryResult,
} from "@/sanity/lib/queries";
import { AtlasClient } from "./AtlasClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'The Atlas — 28 Perfume Oil Waypoints',
  description: 'Four territories. Twenty-eight waypoints. One atlas. Explore Ember, Tidal, Petal, and Terra — concentrated perfume oils organized by olfactory territory. Oud, musk, amber, rose, jasmine, marine, and woody compositions.',
  openGraph: {
    title: 'The Atlas — 28 Perfume Oil Waypoints | Tarife Attar',
    description: 'Four territories. Twenty-eight waypoints. Explore concentrated perfume oils organized by olfactory territory.',
    url: 'https://tarifeattar.com/atlas',
  },
  alternates: {
    canonical: 'https://tarifeattar.com/atlas',
  },
};

// Territory metadata (static) - Order: Ember, Tidal, Petal, Terra
const TERRITORIES = [
  {
    id: "ember",
    name: "Ember",
    tagline: "Spice. Warmth. The intimacy of ancient routes.",
    description: "Warm, gourmand, and spiced oils inspired by the heat of distant markets and caravan trails.",
    color: "from-amber-900/20 to-transparent",
  },
  {
    id: "tidal",
    name: "Tidal",
    tagline: "Salt. Mist. The pull of open water.",
    description: "Aquatic, fresh, and marine compositions that capture coastal atmospheres and oceanic depths.",
    color: "from-blue-900/20 to-transparent",
  },
  {
    id: "petal",
    name: "Petal",
    tagline: "Bloom. Herb. The exhale of living gardens.",
    description: "Floral and herbaceous compositions drawn from botanical gardens and wild meadows.",
    color: "from-rose-900/20 to-transparent",
  },
  {
    id: "terra",
    name: "Terra",
    tagline: "Wood. Oud. The gravity of deep forests.",
    description: "Woody and exotic oils grounded in ancient forests, rare ouds, and earthen depths.",
    color: "from-stone-900/20 to-transparent",
  },
];

interface AtlasProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: unknown;
  atmosphere: string;
  inStock?: boolean;
}

interface TerritoryCounts {
  tidal: number;
  ember: number;
  petal: number;
  terra: number;
}

export default async function AtlasPage() {
  // Fetch all Atlas products, territory counts, and placeholder images
  const [products, counts, placeholderImages] = await Promise.all([
    sanityFetch<AtlasProduct[]>({
      query: atlasProductsByTerritoryQuery,
      tags: ["atlas-products"],
      revalidate: 0, // Always fetch fresh data, rely on webhook for revalidation
    }),
    sanityFetch<TerritoryCounts>({
      query: atlasTerritoryCountsQuery,
      tags: ["atlas-counts"],
      revalidate: 0, // Always fetch fresh data
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ["placeholder-images"],
      revalidate: 0,
    }),
  ]);

  // Group products by territory
  const productsByTerritory = TERRITORIES.map((territory) => ({
    ...territory,
    count: counts[territory.id as keyof TerritoryCounts] || 0,
    products: products.filter((p) => p.atmosphere === territory.id),
  }));

  // Products without atmosphere (shouldn't happen, but handle gracefully)
  // const productsWithoutTerritory = products.filter((p) => !p.atmosphere || !TERRITORIES.some((t) => t.id === p.atmosphere));

  const totalCount = products.length;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Atlas — 28 Perfume Oil Waypoints',
    url: 'https://tarifeattar.com/atlas',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://tarifeattar.com/product/${p.slug.current}`,
        name: p.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-theme-alabaster" />}>
        <AtlasClient territories={productsByTerritory} totalCount={totalCount} placeholderImages={placeholderImages} />
      </Suspense>
    </>
  );
}
