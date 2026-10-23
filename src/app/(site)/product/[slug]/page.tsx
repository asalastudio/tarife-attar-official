import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { shareImageUrlFor, urlForImage } from "@/sanity/lib/image";
import { getProductOffers } from "@/lib/shopify/client";
import {
  SHARE_IMAGE,
  SHARE_PAD_COLOR,
  buildOffers,
  productOpenGraphTags,
  schemaAvailability,
  shopifyShareImageUrl,
  toShopifyProductGid,
} from "@/lib/product-structured-data";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Territory pricing, used for structured data only when Shopify cannot be reached
const territoryPricing: Record<string, { min: number; max: number }> = {
  ember: { min: 28, max: 48 },
  tidal: { min: 30, max: 50 },
  petal: { min: 30, max: 50 },
  terra: { min: 33, max: 55 },
};

// The metadata and the page both need the live offers; fetch them once per request.
const getOffersFor = cache(async (shopifyProductId?: string | number | null) => {
  const gid = toShopifyProductGid(shopifyProductId);
  return gid ? getProductOffers(gid) : null;
});

// Same image the product page shows: the Sanity photo when there is one,
// otherwise the Shopify photo.
function productImages(product: any, featuredImageUrl?: string | null) {
  if (product.mainImage) {
    const share = shareImageUrlFor(product.mainImage, { ...SHARE_IMAGE, bg: SHARE_PAD_COLOR });
    const full = urlForImage(product.mainImage)?.width(1600).url();
    if (share) return { share, full: full ?? share };
  }
  const shopifyUrl = product.shopifyPreviewImageUrl || product.shopifyImage || featuredImageUrl;
  if (!shopifyUrl) return null;
  try {
    return { share: shopifyShareImageUrl(shopifyUrl), full: shopifyUrl as string };
  } catch {
    return null;
  }
}

function fallbackOffers(product: any, productName: string, url: string) {
  const base = {
    '@type': 'Offer',
    priceCurrency: 'USD',
    availability: schemaAvailability(product.inStock !== false),
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@type': 'Organization', name: 'Tarife Attar' },
  };
  if (product.collectionType === 'atlas') {
    const pricing = territoryPricing[product.atlasData?.atmosphere] || territoryPricing.ember;
    return [
      { ...base, name: '6ml Glass Wand Applicator', price: pricing.min },
      { ...base, name: '12ml Glass Wand Applicator', price: pricing.max },
    ];
  }
  const price = Number(product.price);
  return Number.isFinite(price) && price > 0 ? [{ ...base, name: productName, price }] : [];
}

function buildScentDescription(product: any): string {
  const parts: string[] = [];
  if (product.title) parts.push(`${product.title} by Tarife Attar`);
  if (product.legacyName) parts.push(`formerly known as ${product.legacyName}`);

  const territory = product.atlasData?.atmosphere;
  if (territory) {
    const territoryNames: Record<string, string> = {
      ember: 'Ember (warm, spiced)',
      tidal: 'Tidal (fresh, marine)',
      petal: 'Petal (floral, green)',
      terra: 'Terra (woody, oud)',
    };
    parts.push(territoryNames[territory] || territory);
  }

  parts.push('Concentrated perfume oil, glass wand applicator, alcohol-free, skin-safe, cruelty-free');
  return parts.join('. ') + '.';
}

function buildNotesString(notes: any): string {
  if (!notes) return '';
  const parts: string[] = [];
  if (notes.top?.length) parts.push(`Top: ${notes.top.join(', ')}`);
  if (notes.heart?.length) parts.push(`Heart: ${notes.heart.join(', ')}`);
  if (notes.base?.length) parts.push(`Base: ${notes.base.join(', ')}`);
  return parts.join(' | ');
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await sanityFetch<any>({
    query: productBySlugQuery,
    params: { slug },
    tags: [`product-${slug}`],
    revalidate: 60,
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const description = buildScentDescription(product);
  const notesStr = buildNotesString(product.notes);
  const metaDescription = notesStr
    ? `${description} ${notesStr}`.slice(0, 155)
    : description.slice(0, 155);

  const title = product.legacyName
    ? `${product.title}: ${product.legacyName} Perfume Oil`
    : `${product.title} Perfume Oil`;

  const offers = await getOffersFor(product.shopifyProductId);
  const images = productImages(product, offers?.featuredImageUrl);
  const shareImage = images
    ? { url: images.share, ...SHARE_IMAGE, alt: `${product.title} perfume oil by Tarife Attar` }
    : null;

  return {
    title,
    description: metaDescription,
    keywords: [
      'perfume oil',
      product.title?.toLowerCase(),
      product.legacyName?.toLowerCase(),
      'niche fragrance',
      'perfume oil applicator',
      'alcohol free perfume',
      product.atlasData?.atmosphere,
      'tarife attar',
      ...(product.notes?.top || []).map((n: string) => n.toLowerCase()),
      ...(product.notes?.heart || []).map((n: string) => n.toLowerCase()),
      ...(product.notes?.base || []).map((n: string) => n.toLowerCase()),
    ].filter(Boolean),
    // No `type` here: Next only accepts its own og:type values, so
    // og:type=product comes from `other` along with the product price tags.
    openGraph: {
      title: `${product.title} Perfume Oil | Tarife Attar`,
      description: metaDescription,
      url: `https://tarifeattar.com/product/${slug}`,
      siteName: 'Tarife Attar',
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} Perfume Oil | Tarife Attar`,
      description: metaDescription,
      ...(shareImage ? { images: [shareImage.url] } : {}),
    },
    alternates: {
      canonical: `https://tarifeattar.com/product/${slug}`,
    },
    other: productOpenGraphTags(offers?.variants ?? []),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, placeholderImages] = await Promise.all([
    sanityFetch<any>({
      query: productBySlugQuery,
      params: { slug },
      tags: [`product-${slug}`],
      revalidate: 0,
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ["placeholder-images"],
      revalidate: 0,
    })
  ]);

  if (!product) {
    notFound();
  }

  // Build JSON-LD Product structured data from the live Shopify sizes and stock
  const notesStr = buildNotesString(product.notes);
  const productName = `${product.title} Perfume Oil`;
  const productUrl = `https://tarifeattar.com/product/${slug}`;
  const offers = await getOffersFor(product.shopifyProductId);
  const images = productImages(product, offers?.featuredImageUrl);
  const schemaOffers = offers?.variants.length
    ? buildOffers(offers.variants, { productName, url: productUrl })
    : fallbackOffers(product, productName, productUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: buildScentDescription(product),
    brand: {
      '@type': 'Brand',
      name: 'Tarife Attar',
    },
    category: 'Perfume Oil',
    url: productUrl,
    ...(images ? { image: Array.from(new Set([images.full, images.share])) } : {}),
    ...(schemaOffers.length ? { offers: schemaOffers } : {}),
    additionalProperty: [
      ...(product.sillage ? [{ '@type': 'PropertyValue', name: 'Sillage', value: product.sillage }] : []),
      ...(product.longevity ? [{ '@type': 'PropertyValue', name: 'Longevity', value: product.longevity }] : []),
      ...(product.season ? [{ '@type': 'PropertyValue', name: 'Season', value: product.season }] : []),
      ...(notesStr ? [{ '@type': 'PropertyValue', name: 'Fragrance Notes', value: notesStr }] : []),
      { '@type': 'PropertyValue', name: 'Format', value: 'Concentrated Perfume Oil, Glass Wand Applicator' },
      { '@type': 'PropertyValue', name: 'Alcohol Free', value: 'Yes' },
      { '@type': 'PropertyValue', name: 'Cruelty Free', value: 'Yes' },
      { '@type': 'PropertyValue', name: 'Phthalate Free', value: 'Yes' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product as any} placeholderImages={placeholderImages} />
    </>
  );
}
