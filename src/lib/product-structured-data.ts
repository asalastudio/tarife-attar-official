/**
 * Product data for search engines and link previews, built from the live
 * Shopify variants rather than CMS flags: one schema.org Offer per size with
 * its real price and stock, and a padded share image.
 */

export interface OfferVariant {
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

const SIZE_ORDER = ['3ml', '6ml', '12ml'];
// Matches theme-alabaster, so a padded bottle shot reads as one background.
export const SHARE_PAD_COLOR = 'F2F0E9';

export const SHARE_IMAGE = { width: 1200, height: 630 } as const;

export function schemaAvailability(availableForSale: boolean): string {
  return availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

function sizeRank(title: string): number {
  const index = SIZE_ORDER.indexOf(title.trim().toLowerCase());
  return index === -1 ? SIZE_ORDER.length : index;
}

/** Shopify names a single-variant product's only option "Default Title". */
function offerName(variant: OfferVariant, productName: string): string {
  const title = variant.title.trim();
  if (!title || title === 'Default Title') return productName;
  return `${title} Glass Wand Applicator`;
}

export function buildOffers(
  variants: OfferVariant[],
  { productName, url }: { productName: string; url: string },
) {
  return [...variants]
    .sort((a, b) => sizeRank(a.title) - sizeRank(b.title))
    .map((variant) => ({
      '@type': 'Offer',
      name: offerName(variant, productName),
      ...(variant.sku ? { sku: variant.sku } : {}),
      price: Number(variant.price.amount),
      priceCurrency: variant.price.currencyCode,
      availability: schemaAvailability(variant.availableForSale),
      itemCondition: 'https://schema.org/NewCondition',
      url,
      seller: { '@type': 'Organization', name: 'Tarife Attar' },
    }));
}

/**
 * A 1200 x 630 share image from a Shopify CDN URL. The bottle is padded onto
 * the parchment background instead of cropped, so the whole bottle shows.
 */
export function shopifyShareImageUrl(url: string): string {
  const image = new URL(url);
  image.searchParams.set('width', String(SHARE_IMAGE.width));
  image.searchParams.set('height', String(SHARE_IMAGE.height));
  image.searchParams.set('pad_color', SHARE_PAD_COLOR);
  return image.toString();
}

/** Sanity holds Shopify product ids as gids, numeric strings or plain numbers. */
export function toShopifyProductGid(id: string | number | null | undefined): string | null {
  if (id === null || id === undefined || id === '') return null;
  const value = String(id);
  if (value.startsWith('gid://shopify/Product/')) return value;
  return /^\d+$/.test(value) ? `gid://shopify/Product/${value}` : null;
}
