import { sanityFetch } from "@/sanity/lib/client";
import { giftProductsQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { GiftClient } from "./GiftClient";
import { getProductsOffers } from "@/lib/shopify/client";
import { toShopifyProductGid } from "@/lib/product-structured-data";
import { withLiveOffers } from "@/lib/product-offers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'The Gift: Curated Sets & Travel Collections',
  description: 'Curated gift sets and travel collections. Assorted perfume oils, bundled and ready to give.',
  openGraph: {
    title: 'The Gift: Curated Sets & Travel Collections | Tarife Attar',
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
  shopifyProductId?: string | number | null;
}

export default async function GiftPage() {
  const [sanityProducts, placeholderImages] = await Promise.all([
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

  // Price and stock on each card come from Shopify; Sanity's are a logged fallback.
  const live = await getProductsOffers(
    sanityProducts.map((p) => toShopifyProductGid(p.shopifyProductId)).filter((gid): gid is string => !!gid),
  );
  const products = withLiveOffers(sanityProducts, live, { page: "/gift" });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Gift Page] Total products fetched:', products.length);
  }

  return <GiftClient products={products} totalCount={products.length} placeholderImages={placeholderImages} />;
}
