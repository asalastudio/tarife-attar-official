import { sanityFetch } from "@/sanity/lib/client";
import { relicProductsQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { RelicClient } from "./RelicClient";
import { getProductsOffers } from "@/lib/shopify/client";
import { toShopifyProductGid } from "@/lib/product-structured-data";
import { withLiveOffers } from "@/lib/product-offers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'The Relic: Rare Oud Oils & Vintage Attars',
  description: 'Pure oud oils, aged resins, and vintage attars. Single-origin agarwood specimens preserved in time. Rare, collectible, and authentic.',
  openGraph: {
    title: 'The Relic: Rare Oud Oils & Vintage Attars | Tarife Attar',
    description: 'Pure oud oils, aged resins, and vintage attars. Single-origin specimens preserved in time.',
    url: 'https://tarifeattar.com/relic',
  },
  alternates: {
    canonical: 'https://tarifeattar.com/relic',
  },
};

// Relic categories mapping
// Note: productFormat values must match exactly what's in the Sanity schema
const RELIC_CATEGORIES = [
  {
    id: "pure-oud",
    name: "Pure Oud",
    description: "Single-origin agarwood oils. Aged. Verified. Uncut.",
    productFormat: "Pure Oud", // Must match schema exactly
  },
  {
    id: "pure-distillates",
    name: "Pure Distillates",
    description: "Single-material essential oils. Distilled. Uncut.",
    productFormat: "Pure Distillate", // Must match schema exactly
  },
  {
    id: "aged-resins",
    name: "Aged Resins",
    description: "Fossilized amber, vintage frankincense, and temple-grade myrrh.",
    productFormat: "Aged Resin", // Must match schema exactly
  },
  {
    id: "rare-attars",
    name: "Rare Attars",
    description: "Traditional hydro-distillations from master perfumers.",
    productFormat: "Traditional Attar", // Must match schema exactly
  },
];

interface RelicProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: unknown;
  inStock?: boolean;
  shopifyProductId?: string | number | null;
}

export default async function RelicPage() {
  // Fetch all Relic products and placeholder images
  const [sanityProducts, placeholderImages] = await Promise.all([
    sanityFetch<RelicProduct[]>({
      query: relicProductsQuery,
      tags: ["relic-products"],
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
  const products = withLiveOffers(sanityProducts, live, { page: "/relic" });

  // Debug: Log products to help troubleshoot
  if (process.env.NODE_ENV === 'development') {
    console.log('[Relic Page] Total products fetched:', products.length);
    products.forEach((p) => {
      console.log(`[Relic Page] Product: ${p.title}, Format: ${p.productFormat || 'NONE'}, Published: ${p._id && !p._id.startsWith('drafts.')}`);
    });
  }

  // Group products by category (productFormat)
  const categories = RELIC_CATEGORIES.map((category) => ({
    ...category,
    count: products.filter((p) => p.productFormat === category.productFormat).length,
    products: products.filter((p) => p.productFormat === category.productFormat),
  }));

  // Products without a matching category (including those without productFormat)
  const productsWithoutCategory = products.filter(
    (p) => !p.productFormat || !RELIC_CATEGORIES.some((c) => c.productFormat === p.productFormat)
  );

  // If there are products without a category, add an "Other" category
  // This ensures ALL products are shown, even if they don't have a productFormat set
  if (productsWithoutCategory.length > 0) {
    categories.push({
      id: "other",
      name: "Other Specimens",
      description: "Additional collector-grade materials.",
      productFormat: "Other",
      count: productsWithoutCategory.length,
      products: productsWithoutCategory,
    });
  }

  const totalCount = (products || []).length;

  return <RelicClient categories={categories} totalCount={totalCount} placeholderImages={placeholderImages} />;
}
