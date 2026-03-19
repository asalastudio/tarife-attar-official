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

// Territory pricing for structured data
const territoryPricing: Record<string, { min: number; max: number }> = {
  ember: { min: 28, max: 48 },
  tidal: { min: 30, max: 50 },
  petal: { min: 30, max: 50 },
  terra: { min: 33, max: 55 },
};

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

  parts.push('Concentrated roll-on perfume oil, alcohol-free, skin-safe, cruelty-free');
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
      'roll on perfume',
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

  // Build JSON-LD Product structured data
  const territory = product.atlasData?.atmosphere || 'ember';
  const pricing = territoryPricing[territory] || { min: 28, max: 48 };
  const notesStr = buildNotesString(product.notes);

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
    offers: [
      {
        '@type': 'Offer',
        name: '6ml Roll-On',
        price: pricing.min,
        priceCurrency: 'USD',
        availability: product.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Tarife Attar',
        },
      },
      {
        '@type': 'Offer',
        name: '12ml Roll-On',
        price: pricing.max,
        priceCurrency: 'USD',
        availability: product.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Tarife Attar',
        },
      },
    ],
    additionalProperty: [
      ...(product.sillage ? [{ '@type': 'PropertyValue', name: 'Sillage', value: product.sillage }] : []),
      ...(product.longevity ? [{ '@type': 'PropertyValue', name: 'Longevity', value: product.longevity }] : []),
      ...(product.season ? [{ '@type': 'PropertyValue', name: 'Season', value: product.season }] : []),
      ...(notesStr ? [{ '@type': 'PropertyValue', name: 'Fragrance Notes', value: notesStr }] : []),
      { '@type': 'PropertyValue', name: 'Format', value: 'Concentrated Perfume Oil, Roll-On' },
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
