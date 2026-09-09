import { sanityFetch } from "@/sanity/lib/client";
import { giftProductsQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { GiftClient } from "./GiftClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'The Gift — Curated Sets & Travel Collections',
  description: 'Curated gift sets and travel collections. Assorted perfume oils, bundled and ready to give.',
  openGraph: {
    title: 'The Gift — Curated Sets & Travel Collections | Tarife Attar',
    description: 'Curated gift sets and travel collections. Assorted perfume oils, bundled and ready to give.',
    url: 'https://tarifeattar.com/gift',
  },
  alternates: {
    canonical: 'https://tarifeattar.com/gift',
  },
};

interface GiftProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  compareAtPrice?: number;
  volume?: string;
  mainImage?: unknown;
  shopifyPreviewImageUrl?: string;
  shopifyImage?: string;
  inStock?: boolean;
  setSize?: number;
  pieceFormat?: string;
}

export default async function GiftPage() {
  const [products, placeholderImages] = await Promise.all([
    sanityFetch<GiftProduct[]>({
      query: giftProductsQuery,
      tags: ["gift-products"],
      revalidate: 0, // Always fetch fresh data, rely on webhook for revalidation
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ["placeholder-images"],
      revalidate: 0,
    })
  ]);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Gift Page] Total products fetched:', products.length);
  }

  return <GiftClient products={products} totalCount={products.length} placeholderImages={placeholderImages} />;
}
