import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery, heroBackgroundsQuery, HeroBackgroundsQueryResult, placeholderImagesQuery, PlaceholderImagesQueryResult, portsOfCallQuery, PortOfCall } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { HomeClient } from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Tarife Attar — Artisanal Perfume Oils & Rare Attars',
  description: 'Navigate by instinct, not itinerary. 28 artisanal perfume oils across four olfactory territories — Ember, Tidal, Petal, Terra. Concentrated, alcohol-free, skin-safe glass wand applicator fragrances.',
  openGraph: {
    title: 'Tarife Attar — Artisanal Perfume Oils & Rare Attars',
    description: 'Navigate by instinct, not itinerary. 28 artisanal perfume oils across four olfactory territories.',
    url: 'https://tarifeattar.com',
  },
  alternates: {
    canonical: 'https://tarifeattar.com',
  },
};

export default async function Home() {
  const [featuredProducts, heroBackgrounds, placeholderImages, portsOfCall] = await Promise.all([
    sanityFetch<Product[]>({
      query: featuredProductsQuery,
      tags: ['featured-products'],
      revalidate: 0, // Always fetch fresh, rely on webhook for revalidation
    }),
    sanityFetch<HeroBackgroundsQueryResult>({
      query: heroBackgroundsQuery,
      tags: ['hero-backgrounds'],
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
  ]);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Hero Backgrounds fetched:', heroBackgrounds);
  }

  return <HomeClient featuredProducts={featuredProducts} heroBackgrounds={heroBackgrounds} placeholderImages={placeholderImages} portsOfCall={portsOfCall || []} />;
}
