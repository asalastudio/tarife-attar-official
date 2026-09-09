export interface MetaCommerceItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  meta_content_id?: string;
  price: number;
  quantity: number;
}

export type MetaEventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout';

export interface MetaEvent {
  event: MetaEventName;
  params: {
    content_ids: string[];
    content_name?: string;
    content_type: 'product';
    currency: string;
    value: number;
    num_items?: number;
  };
}

function numericShopifyId(value: string, resource: 'Product' | 'ProductVariant') {
  const normalized = String(value || '').trim();
  if (/^\d+$/.test(normalized)) return normalized;
  return normalized.match(
    new RegExp(`^gid://shopify/${resource}/(\\d+)$`),
  )?.[1] || null;
}

export function buildShopifyCatalogContentId(
  productId: string,
  variantId: string,
  countryCode = 'US',
): string | null {
  const product = numericShopifyId(productId, 'Product');
  const variant = numericShopifyId(variantId, 'ProductVariant');
  const country = String(countryCode || '').trim().toUpperCase();
  if (!product || !variant || !/^[A-Z]{2}$/.test(country)) return null;
  return `shopify_${country}_${product}_${variant}`;
}

function normalizedCurrency(currency: string): string {
  const normalized = String(currency || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('Meta commerce currency must be a three-letter code.');
  }
  return normalized;
}

function normalizedItem(item: MetaCommerceItem): MetaCommerceItem {
  const itemId = String(item.item_id || '').trim();
  const itemName = String(item.item_name || '').trim();
  const price = Number(item.price);
  const quantity = Number(item.quantity);
  if (!itemId || !itemName || !Number.isFinite(price) || price < 0) {
    throw new Error('Meta commerce item data is invalid.');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Meta commerce quantity must be a positive integer.');
  }
  return { ...item, item_id: itemId, item_name: itemName, price, quantity };
}

function contentId(item: MetaCommerceItem): string {
  return String(item.meta_content_id || item.item_id).trim();
}

export function buildMetaViewContent(
  item: MetaCommerceItem,
  currency: string,
): MetaEvent {
  const normalized = normalizedItem(item);
  return {
    event: 'ViewContent',
    params: {
      content_ids: [contentId(normalized)],
      content_name: normalized.item_name,
      content_type: 'product',
      currency: normalizedCurrency(currency),
      value: Math.round(normalized.price * normalized.quantity * 100) / 100,
    },
  };
}

export function buildMetaAddToCart(
  item: MetaCommerceItem,
  currency: string,
): MetaEvent {
  const normalized = normalizedItem(item);
  return {
    event: 'AddToCart',
    params: {
      content_ids: [contentId(normalized)],
      content_name: normalized.item_name,
      content_type: 'product',
      currency: normalizedCurrency(currency),
      value: Math.round(normalized.price * normalized.quantity * 100) / 100,
    },
  };
}

export function buildMetaInitiateCheckout(
  items: MetaCommerceItem[],
  currency: string,
): MetaEvent {
  const normalized = items.map(normalizedItem);
  const value = Math.round(
    normalized.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ) * 100,
  ) / 100;
  return {
    event: 'InitiateCheckout',
    params: {
      content_ids: normalized.map(contentId),
      content_type: 'product',
      currency: normalizedCurrency(currency),
      value,
      num_items: normalized.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    },
  };
}
