import { Suspense } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery, heroBackgroundsQuery, HeroBackgroundsQueryResult, placeholderImagesQuery, PlaceholderImagesQueryResult, portsOfCallQuery, PortOfCall, giftProductsQuery } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { availableFeaturedProducts } from "@/lib/shopify/featured-products";
import { getFeaturedAvailability } from "@/lib/shopify/client";
import { HomeClient } from "./HomeClient";
import { HomeSections, type GiftProduct } from "./HomeSections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Tarife Attar: Artisanal Perfume Oils & Rare Attars',
  description: 'Navigate by instinct, not itinerary. 28 artisanal perfume oils across four olfactory territories: Ember, Tidal, Petal, Terra. Concentrated, alcohol-free, skin-safe glass wand applicator fragrances.',
  openGraph: {
    title: 'Tarife Attar: Artisanal Perfume Oils & Rare Attars',
    description: 'Navigate by instinct, not itinerary. 28 artisanal perfume oils across four olfactory territories.',
    url: 'https://tarifeattar.com',
  },
  alternates: {
    canonical: 'https://tarifeattar.com',
  },
};

/**
 * The hero is the largest paint on every device, so it renders as soon as its
 * own query returns. The collection queries and the Shopify availability check
 * stream in below it instead of holding the hero (and its image preload) back.
 */
export default async function Home() {
  // Cached briefly so the hero (and its image preload) ships in the first bytes
  // rather than after a Sanity round trip. Hero edits appear within a minute, or
  // at once if the Sanity webhook filter includes heroBackgrounds (the route's
  // default branch revalidates every page).
  const heroBackgrounds = await sanityFetch<HeroBackgroundsQueryResult>({
    query: heroBackgroundsQuery,
    tags: ['hero-backgrounds'],
    revalidate: 60,
  });

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Hero Backgrounds fetched:', heroBackgrounds);
  }

  return (
    <HomeClient heroBackgrounds={heroBackgrounds}>
      <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
        <HomeCollection />
      </Suspense>
    </HomeClient>
  );
}

async function HomeCollection() {
  const [featuredProducts, placeholderImages, portsOfCall, giftProducts] = await Promise.all([
    sanityFetch<Product[]>({
      query: featuredProductsQuery,
      tags: ['featured-products'],
      revalidate: 0, // Always fetch fresh, rely on webhook for revalidation
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ['placeholder-images'],
      revalidate: 0,
    }),
    sanityFetch<PortOfCall[]>({
      query: portsOfCallQuery,
      tags: ['ports-of-call'],
      revalidate: 0,
    }),
    sanityFetch<GiftProduct[]>({
      query: giftProductsQuery,
      tags: ['gift-products'],
      revalidate: 0,
    }),
  ]);

  const availableProducts = await availableFeaturedProducts(featuredProducts || [], getFeaturedAvailability);

  return <HomeSections featuredProducts={availableProducts} placeholderImages={placeholderImages} portsOfCall={portsOfCall || []} giftProducts={giftProducts || []} />;
}
