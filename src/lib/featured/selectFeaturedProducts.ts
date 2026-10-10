/**
 * Homepage feature slots.
 *
 * BIG SUR, TOBAGO and SERENGETI lead when a size is actually available.
 * Remaining slots take the newest oils that are genuinely in stock.
 * Sanity's `inStock` flag is only the fallback when Shopify cannot be asked:
 * it still says true for waypoints that are sold out in every size.
 */

export const FEATURED_WAYPOINT_SLUGS = ["big-sur", "tobago", "serengeti"] as const;

export const FEATURED_SLOT_COUNT = 3;

export type FeaturedCandidate = {
  _id: string;
  slug?: { current?: string | null } | null;
  inStock?: boolean | null;
  _createdAt?: string | null;
  shopifyVariantId?: string | null;
  shopifyVariant3mlId?: string | null;
  shopifyVariant6mlId?: string | null;
  shopifyVariant12mlId?: string | null;
};

export function variantGidsForFeatured(
  products: readonly Pick<
    FeaturedCandidate,
    "shopifyVariantId" | "shopifyVariant3mlId" | "shopifyVariant6mlId" | "shopifyVariant12mlId"
  >[],
): string[] {
  const ids: string[] = [];
  for (const product of products) {
    ids.push(...variantGids(product));
  }
  return ids;
}

function variantGids(
  product: Pick<
    FeaturedCandidate,
    "shopifyVariantId" | "shopifyVariant3mlId" | "shopifyVariant6mlId" | "shopifyVariant12mlId"
  >,
): string[] {
  return [
    product.shopifyVariant3mlId,
    product.shopifyVariant6mlId,
    product.shopifyVariant12mlId,
    product.shopifyVariantId,
  ].filter((id): id is string => Boolean(id));
}

function isGenuinelyInStock(
  product: FeaturedCandidate,
  availability: ReadonlyMap<string, boolean> | null,
): boolean {
  if (availability) {
    const ids = variantGids(product);
    if (ids.length > 0) {
      return ids.some((id) => availability.get(id) === true);
    }
  }
  return product.inStock === true;
}

export function selectFeaturedProducts<T extends FeaturedCandidate>(
  products: readonly T[],
  availability: ReadonlyMap<string, boolean> | null,
  limit = FEATURED_SLOT_COUNT,
): T[] {
  const eligible = products.filter((product) => isGenuinelyInStock(product, availability));
  const picked: T[] = [];
  const seen = new Set<string>();

  for (const slug of FEATURED_WAYPOINT_SLUGS) {
    const match = eligible.find(
      (product) => product.slug?.current === slug && !seen.has(product._id),
    );
    if (!match) continue;
    picked.push(match);
    seen.add(match._id);
    if (picked.length >= limit) return picked;
  }

  const rest = eligible
    .filter((product) => !seen.has(product._id))
    .sort((a, b) => (b._createdAt ?? "").localeCompare(a._createdAt ?? ""));

  for (const product of rest) {
    if (picked.length >= limit) break;
    picked.push(product);
    seen.add(product._id);
  }

  return picked;
}
