export interface ShopifyCartAttribute {
  key: string;
  value: string;
}

const ATTRIBUTION_PREFIX = 'ta_';
const MAX_CART_ATTRIBUTES = 250;

function normalizedAttributionAttributes(
  attributes: ShopifyCartAttribute[],
): ShopifyCartAttribute[] {
  const valuesByKey = new Map<string, string>();

  for (const attribute of attributes) {
    if (!attribute.key.startsWith(ATTRIBUTION_PREFIX) || !attribute.value) {
      continue;
    }
    valuesByKey.set(attribute.key, attribute.value);
  }

  return Array.from(valuesByKey.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({ key, value }));
}

function preservedNonAttributionAttributes(
  attributes: ShopifyCartAttribute[],
): ShopifyCartAttribute[] {
  const valuesByKey = new Map<string, string>();

  for (const attribute of attributes) {
    if (!attribute.key || attribute.key.startsWith(ATTRIBUTION_PREFIX)) continue;
    valuesByKey.set(attribute.key, attribute.value);
  }

  return Array.from(valuesByKey.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({ key, value }));
}

export function getAttributionAttributeFingerprint(
  attributes: ShopifyCartAttribute[],
): string {
  return normalizedAttributionAttributes(attributes)
    .map(
      ({ key, value }) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

export function buildAttributionAttributePatch(
  current: ShopifyCartAttribute[],
  desired: ShopifyCartAttribute[],
): ShopifyCartAttribute[] {
  if (
    getAttributionAttributeFingerprint(current) ===
    getAttributionAttributeFingerprint(desired)
  ) {
    return [];
  }

  const desiredAttributes = normalizedAttributionAttributes(desired).slice(
    0,
    MAX_CART_ATTRIBUTES,
  );
  const preservedAttributes = preservedNonAttributionAttributes(current).slice(
    0,
    MAX_CART_ATTRIBUTES - desiredAttributes.length,
  );

  return [...preservedAttributes, ...desiredAttributes].sort(
    ({ key: left }, { key: right }) => left.localeCompare(right),
  );
}
