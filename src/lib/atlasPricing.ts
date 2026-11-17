/**
 * Atlas list prices by territory, as sold in Shopify. 3 ml exists only on the
 * waypoints that carry a 3 ml variant ID in Sanity (shopifyVariant3mlId).
 * Cards show the sizes in words so a single "from" price never reads as the
 * price of the 6 ml (e.g. SAMARKAND: 3 ml $23 / 6 ml $33).
 */
export const ATLAS_PRICING: Record<string, { '3ml': number; '6ml': number; '12ml': number }> = {
  ember: { '3ml': 23, '6ml': 28, '12ml': 48 },
  petal: { '3ml': 23, '6ml': 30, '12ml': 50 },
  tidal: { '3ml': 23, '6ml': 30, '12ml': 50 },
  terra: { '3ml': 23, '6ml': 33, '12ml': 55 },
};

export function atlasCardPriceLabel(territory: string | undefined, has3ml: boolean | undefined, fallbackPrice?: number | string): string | null {
  const p = territory ? ATLAS_PRICING[territory] : undefined;
  if (!p) return fallbackPrice ? `$${fallbackPrice}` : null;
  return has3ml ? `3 ml $${p['3ml']} / 6 ml $${p['6ml']}` : `6 ml $${p['6ml']}`;
}
