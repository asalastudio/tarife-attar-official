/**
 * What a product costs, which sizes it comes in, which Shopify variant the
 * Satchel adds and whether it is in stock: all read from Shopify.
 *
 * Sanity holds the product's content. Its commerce fields (price,
 * compareAtPrice, volume, inStock, shopifyVariantId and
 * shopifyVariant3ml/6ml/12mlId) and the territory price table below are a
 * fallback, used only when Shopify cannot be reached or does not know the
 * product, and every use of the fallback is logged.
 */
import { sizeRank, toShopifyProductGid } from './product-structured-data.ts';
import type { OfferVariant } from './product-structured-data.ts';

export type OfferSource = 'shopify' | 'sanity';

export interface SizeOption {
  /** Shopify ProductVariant gid; null when no variant is known. */
  variantId: string | null;
  /** "3ml", "10ml"; null when the product has no size option ("Default Title"). */
  label: string | null;
  price: number | null;
  /** Only set when it is higher than the price. */
  compareAtPrice: number | null;
  availableForSale: boolean;
}

export interface ProductOffer {
  source: OfferSource;
  /** Ordered 3ml, 6ml, 12ml, then any other size. */
  sizes: SizeOption[];
  /** Index into sizes of the size the page opens on. */
  defaultIndex: number;
}

/** The Sanity fields this module reads. Grid queries flatten atmosphere. */
export interface SanityCommerceFields {
  slug?: { current?: string } | string | null;
  collectionType?: string | null;
  shopifyProductId?: string | number | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  volume?: string | null;
  inStock?: boolean | null;
  shopifyVariantId?: string | null;
  shopifyVariant3mlId?: string | null;
  shopifyVariant6mlId?: string | null;
  shopifyVariant12mlId?: string | null;
  atmosphere?: string | null;
  atlasData?: { atmosphere?: string | null } | null;
}

export type OfferLog = (message: string) => void;

const defaultLog: OfferLog = (message) => console.warn(message);

/**
 * Fallback only: Atlas prices by territory, used when Shopify cannot be
 * reached. Shopify's variant prices are the real ones.
 */
export const FALLBACK_TERRITORY_PRICING: Record<string, { '3ml': number; '6ml': number; '12ml': number }> = {
  ember: { '3ml': 23, '6ml': 28, '12ml': 48 },
  petal: { '3ml': 23, '6ml': 30, '12ml': 50 },
  tidal: { '3ml': 23, '6ml': 30, '12ml': 50 },
  terra: { '3ml': 23, '6ml': 33, '12ml': 55 },
};

/** "$65", "$22.50": whole dollars stay whole, cents only when needed. */
export function formatUsd(amount: number): string {
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function higherThan(compareAt: number | null, price: number | null): number | null {
  return compareAt !== null && price !== null && compareAt > price ? compareAt : null;
}

/** Shopify names a single-variant product's only option "Default Title". */
function sizeLabel(title: string | null | undefined): string | null {
  const label = (title ?? '').trim();
  return label && label !== 'Default Title' ? label : null;
}

function slugOf(product: SanityCommerceFields): string {
  const slug = typeof product.slug === 'string' ? product.slug : product.slug?.current;
  return slug || 'unknown product';
}

/** Sizes as Shopify sells them, in size order. */
export function shopifySizes(variants: OfferVariant[]): SizeOption[] {
  return [...variants]
    .sort((a, b) => sizeRank(a.title) - sizeRank(b.title))
    .map((variant) => {
      const price = toAmount(variant.price?.amount);
      return {
        variantId: variant.id || null,
        label: sizeLabel(variant.title),
        price,
        compareAtPrice: higherThan(toAmount(variant.compareAtPrice?.amount), price),
        availableForSale: variant.availableForSale === true,
      };
    });
}

/**
 * The sizes the page showed before Shopify became the source: Atlas from the
 * territory table and the per-size variant ids, everything else from the
 * single Sanity price, volume and variant id. 3ml appears only with its id.
 */
export function sanityFallbackSizes(product: SanityCommerceFields): SizeOption[] {
  const availableForSale = product.inStock !== false;
  const territory = product.atlasData?.atmosphere ?? product.atmosphere;
  const pricing = product.collectionType === 'atlas' && territory
    ? FALLBACK_TERRITORY_PRICING[territory]
    : undefined;

  if (pricing) {
    const ids = {
      '3ml': product.shopifyVariant3mlId || null,
      '6ml': product.shopifyVariant6mlId || product.shopifyVariantId || null,
      '12ml': product.shopifyVariant12mlId || null,
    };
    return (['3ml', '6ml', '12ml'] as const)
      .filter((size) => size !== '3ml' || ids['3ml'])
      .map((size) => ({
        variantId: ids[size],
        label: size,
        price: pricing[size],
        compareAtPrice: null,
        availableForSale,
      }));
  }

  const price = toAmount(product.price);
  return [{
    variantId: product.shopifyVariantId || null,
    label: product.volume?.trim() || null,
    price,
    compareAtPrice: higherThan(toAmount(product.compareAtPrice), price),
    availableForSale,
  }];
}

/** Open on 6ml when it can be bought, else the first size that can (3ml, then 12ml). */
export function defaultSizeIndex(sizes: SizeOption[]): number {
  const isSix = (size: SizeOption) => size.label?.toLowerCase() === '6ml';
  const sixInStock = sizes.findIndex((size) => isSix(size) && size.availableForSale);
  if (sixInStock !== -1) return sixInStock;
  const firstInStock = sizes.findIndex((size) => size.availableForSale);
  if (firstInStock !== -1) return firstInStock;
  return Math.max(0, sizes.findIndex(isSix));
}

function fallbackReason(product: SanityCommerceFields, variants: OfferVariant[] | null | undefined): string {
  if (!toShopifyProductGid(product.shopifyProductId)) return 'no Shopify product id in Sanity';
  if (variants === null || variants === undefined) return 'Shopify did not answer';
  return 'Shopify returned no variants';
}

/**
 * The product page's offer. `variants` is the live Shopify answer: an array
 * (possibly empty) when Shopify answered, null when it could not be reached.
 */
export function resolveProductOffer(
  product: SanityCommerceFields,
  variants: OfferVariant[] | null | undefined,
  log: OfferLog = defaultLog,
): ProductOffer {
  if (variants && variants.length > 0) {
    const sizes = shopifySizes(variants);
    return { source: 'shopify', sizes, defaultIndex: defaultSizeIndex(sizes) };
  }
  const sizes = sanityFallbackSizes(product);
  log(
    `[product-offers] ${slugOf(product)}: ${fallbackReason(product, variants)}; ` +
      'showing Sanity fallback price, sizes and stock',
  );
  return { source: 'sanity', sizes, defaultIndex: defaultSizeIndex(sizes) };
}

export interface GridOffer {
  /** Lowest price that can be bought now; lowest overall when nothing can. */
  price: number | null;
  compareAtPrice: number | null;
  /** Cheapest and dearest size, in or out of stock. */
  priceRange: { min: number; max: number } | null;
  inStock: boolean;
  offerSource: OfferSource;
}

/** One card's price and stock from a product's sizes. */
export function gridOffer(sizes: SizeOption[], source: OfferSource): GridOffer {
  const priced = sizes.filter((size) => size.price !== null);
  const inStock = priced.filter((size) => size.availableForSale);
  const pool = inStock.length ? inStock : priced;
  const cheapest = pool.reduce<SizeOption | null>(
    (best, size) => (best === null || (size.price as number) < (best.price as number) ? size : best),
    null,
  );
  const prices = priced.map((size) => size.price as number);
  return {
    price: cheapest?.price ?? null,
    compareAtPrice: cheapest?.compareAtPrice ?? null,
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    inStock: sizes.some((size) => size.availableForSale),
    offerSource: source,
  };
}

/** "$23 – $50" across a group of cards, e.g. one Atlas territory. */
export function formatPriceRange(cards: Array<Pick<GridOffer, 'priceRange'>>): string {
  const ranges = cards
    .map((card) => card.priceRange)
    .filter((range): range is { min: number; max: number } => range !== null);
  if (!ranges.length) return '';
  const min = Math.min(...ranges.map((range) => range.min));
  const max = Math.max(...ranges.map((range) => range.max));
  return min === max ? formatUsd(min) : `${formatUsd(min)} – ${formatUsd(max)}`;
}

/**
 * Atlas, Relic and gift grid cards with Shopify's price and stock written over
 * the Sanity values. `live` maps Shopify product gids to their variants, or is
 * null when Shopify could not be reached. Logs once per page.
 */
export function withLiveOffers<T extends SanityCommerceFields>(
  products: T[],
  live: Map<string, OfferVariant[]> | null,
  { page, log = defaultLog }: { page: string; log?: OfferLog },
): Array<Omit<T, keyof GridOffer> & GridOffer> {
  const fellBack: string[] = [];
  const cards = products.map((product) => {
    const gid = toShopifyProductGid(product.shopifyProductId);
    const variants = gid && live ? live.get(gid) : undefined;
    if (variants && variants.length > 0) {
      return { ...product, ...gridOffer(shopifySizes(variants), 'shopify') };
    }
    fellBack.push(slugOf(product));
    return { ...product, ...gridOffer(sanityFallbackSizes(product), 'sanity') };
  });

  if (fellBack.length) {
    const reason = live === null ? 'Shopify did not answer' : 'no Shopify variants';
    log(
      `[product-offers] ${page}: ${reason} for ${fellBack.length} of ${products.length} products ` +
        `(${fellBack.join(', ')}); showing Sanity fallback price and stock`,
    );
  }
  return cards;
}
