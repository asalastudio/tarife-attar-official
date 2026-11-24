import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { shareImageUrlFor, urlForImage } from "@/sanity/lib/image";
import { getProductOffers, getProductsOffers } from "@/lib/shopify/client";
import {
  SHARE_IMAGE,
  SHARE_PAD_COLOR,
  buildOffers,
  productKind,
  schemaAvailability,
  shopifyShareImageUrl,
  toShopifyProductGid,
} from "@/lib/product-structured-data";
import { resolveProductOffer, withLiveOffers, type SizeOption } from "@/lib/product-offers";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

// Structured data from the Sanity fallback sizes, only when Shopify cannot be
// reached. Offers are named the way buildOffers names Shopify's.
function fallbackOffers(
  sizes: SizeOption[],
  { productName, url, applicator }: { productName: string; url: string; applicator: string | null },
) {
  return sizes
    .filter((size) => size.price !== null && size.price > 0)
    .map((size) => ({
      '@type': 'Offer',
      name: !size.label
        ? productName
        : applicator
          ? `${size.label} ${applicator}`
          : `${productName}, ${size.label}`,
      price: size.price,
      priceCurrency: 'USD',
      availability: schemaAvailability(size.availableForSale),
      itemCondition: 'https://schema.org/NewCondition',
      url,
      seller: { '@type': 'Organization', name: 'Tarife Attar' },
    }));
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

  // Essential oils carry a patch-test warning, so they don't get the skin-safe line.
  parts.push(
    productKind(product.productFormat).applicator
      ? 'Concentrated perfume oil, glass wand applicator, alcohol-free, skin-safe, cruelty-free'
      : 'Pure essential oil, alcohol-free, cruelty-free',
  );
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

  const { noun } = productKind(product.productFormat);
  const title = product.legacyName
    ? `${product.title}: ${product.legacyName} ${noun}`
    : `${product.title} ${noun}`;

  const offers = await getOffersFor(product.shopifyProductId);
  const images = productImages(product, offers?.featuredImageUrl);
  const shareImage = images
    ? { url: images.share, ...SHARE_IMAGE, alt: `${product.title} ${noun.toLowerCase()} by Tarife Attar` }
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
    // Price, stock and brand live in the Product JSON-LD, not og:type=product
    // tags: Next 14 rejects that og:type, metadata.other writes `name=` (which
    // Facebook ignores), and <meta> rendered by the page lands in <body>.
    openGraph: {
      title: `${product.title} ${noun} | Tarife Attar`,
      description: metaDescription,
      url: `https://tarifeattar.com/product/${slug}`,
      siteName: 'Tarife Attar',
      type: 'website',
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} ${noun} | Tarife Attar`,
      description: metaDescription,
      ...(shareImage ? { images: [shareImage.url] } : {}),
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

  // Price, sizes, the variant the Satchel adds and stock all come from
  // Shopify; Sanity's commerce fields are only a logged fallback.
  const notesStr = buildNotesString(product.notes);
  const kind = productKind(product.productFormat);
  const productName = `${product.title} ${kind.noun}`;
  const productUrl = `https://tarifeattar.com/product/${slug}`;
  const related: any[] = product.relatedProducts ?? [];
  const relatedGids = related
    .map((p) => toShopifyProductGid(p.shopifyProductId))
    .filter((gid): gid is string => !!gid);
  const [offers, relatedOffers] = await Promise.all([
    getOffersFor(product.shopifyProductId),
    related.length ? getProductsOffers(relatedGids) : Promise.resolve(new Map()),
  ]);
  const offer = resolveProductOffer(product, offers ? offers.variants : null);
  const relatedProducts = related.length
    ? withLiveOffers(related, relatedOffers, { page: `/product/${slug} related products` })
    : product.relatedProducts;
  const images = productImages(product, offers?.featuredImageUrl);
  const schemaOffers = offer.source === 'shopify' && offers
    ? buildOffers(offers.variants, { productName, url: productUrl, applicator: kind.applicator })
    : fallbackOffers(offer.sizes, { productName, url: productUrl, applicator: kind.applicator });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: buildScentDescription(product),
    brand: {
      '@type': 'Brand',
      name: 'Tarife Attar',
    },
    category: kind.noun,
    url: productUrl,
    ...(images ? { image: Array.from(new Set([images.full, images.share])) } : {}),
    ...(schemaOffers.length ? { offers: schemaOffers } : {}),
    additionalProperty: [
      ...(product.sillage ? [{ '@type': 'PropertyValue', name: 'Sillage', value: product.sillage }] : []),
      ...(product.longevity ? [{ '@type': 'PropertyValue', name: 'Longevity', value: product.longevity }] : []),
      ...(product.season ? [{ '@type': 'PropertyValue', name: 'Season', value: product.season }] : []),
      ...(notesStr ? [{ '@type': 'PropertyValue', name: 'Fragrance Notes', value: notesStr }] : []),
      { '@type': 'PropertyValue', name: 'Format', value: kind.format },
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
      <ProductDetailClient
        product={{ ...product, relatedProducts } as any}
        offer={offer}
        placeholderImages={placeholderImages}
      />
    </>
  );
}
