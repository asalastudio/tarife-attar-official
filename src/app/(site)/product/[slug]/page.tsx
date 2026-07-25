import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
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
    ? `${product.title} — ${product.legacyName} Perfume Oil`
    : `${product.title} Perfume Oil`;

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
    openGraph: {
      title: `${product.title} Perfume Oil | Tarife Attar`,
      description: metaDescription,
      url: `https://tarifeattar.com/product/${slug}`,
      siteName: 'Tarife Attar',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} Perfume Oil | Tarife Attar`,
      description: metaDescription,
    },
    alternates: {
      canonical: `https://tarifeattar.com/product/${slug}`,
    },
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

  // Build JSON-LD Product structured data — priced from the product's actual
  // Sanity/Shopify-synced price fields, not a hardcoded territory lookup.
  const notesStr = buildNotesString(product.notes);

  const priceLow = typeof product.price === 'number' ? product.price : Number(product.price);
  const priceHigh = typeof product.priceMax === 'number' ? product.priceMax : Number(product.priceMax ?? priceLow);
  const hasValidPrice = Number.isFinite(priceLow) && priceLow > 0;
  const hasDualVariant = !!product.shopifyVariant12mlId && Number.isFinite(priceHigh) && priceHigh !== priceLow;

  const availability = product.inStock !== false
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const makeOffer = (name: string, price: number, sku?: string) => ({
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'USD',
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: 'Tarife Attar',
    },
    ...(sku ? { sku } : {}),
  });

  const offers = !hasValidPrice
    ? undefined
    : hasDualVariant
      ? [
          makeOffer('6ml Glass Wand Applicator', priceLow, product.sku6ml),
          makeOffer('12ml Glass Wand Applicator', priceHigh, product.sku12ml),
        ]
      : [makeOffer(`${product.volume || ''} Glass Wand Applicator`.trim(), priceLow, product.sku)];

  // AggregateRating — only emitted when there's real review data AND a
  // matching visible rating is rendered on the page (see ProductDetailClient),
  // per Google's structured-data policy against invisible review markup.
  const ratings: number[] = product.reviews || [];
  const reviewCount = ratings.length;
  const ratingValue = reviewCount > 0
    ? Math.round((ratings.reduce((sum: number, r: number) => sum + r, 0) / reviewCount) * 10) / 10
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.title} Perfume Oil`,
    description: buildScentDescription(product),
    brand: {
      '@type': 'Brand',
      name: 'Tarife Attar',
    },
    category: 'Perfume Oil',
    url: `https://tarifeattar.com/product/${slug}`,
    ...(offers ? { offers } : {}),
    ...(reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
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
