interface FeaturedCandidate {
  slug?: { current: string };
  price?: number | string;
}

export interface FeaturedAvailability {
  handle: string;
  availableForSale: boolean;
  price: number;
}

/** CMS selection is editorial; Shopify decides what can currently be bought. */
export async function availableFeaturedProducts<T extends FeaturedCandidate>(
  candidates: T[],
  loadAvailability: (handles: string[]) => Promise<FeaturedAvailability[]>,
): Promise<T[]> {
  const handles = Array.from(new Set(candidates.map(p => p.slug?.current).filter((h): h is string => !!h)));
  if (!handles.length) return [];
  try {
    const availability = new Map((await loadAvailability(handles)).map(p => [p.handle, p]));
    const seen = new Set<string>();
    return candidates.flatMap(product => {
      const handle = product.slug?.current;
      const live = handle ? availability.get(handle) : undefined;
      if (!handle || seen.has(handle) || !live?.availableForSale || !Number.isFinite(live.price)) return [];
      seen.add(handle);
      return [{ ...product, price: live.price }];
    }).slice(0, 3);
  } catch {
    // An unavailable commerce service must not turn stale CMS stock into a promise.
    return [];
  }
}
