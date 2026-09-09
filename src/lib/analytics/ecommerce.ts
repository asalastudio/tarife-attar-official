export interface CommerceItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  meta_content_id?: string;
  price: number;
  quantity: number;
}

export type EcommerceEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'view_cart'
  | 'begin_checkout';

export interface EcommerceEvent {
  event: EcommerceEventName;
  params: {
    currency: string;
    value: number;
    items: CommerceItem[];
  };
}

function normalizedCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('Commerce currency must be a three-letter code.');
  }
  return normalized;
}

function normalizedItem(item: CommerceItem): CommerceItem {
  const itemId = String(item.item_id || '').trim();
  const itemName = String(item.item_name || '').trim();
  if (!itemId || !itemName) {
    throw new Error('Commerce items require item_id and item_name.');
  }

  const price = Number(item.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Commerce item price must be a non-negative number.');
  }

  const quantity = Number(item.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Commerce item quantity must be a positive integer.');
  }

  const itemVariant =
    item.item_variant === undefined
      ? undefined
      : String(item.item_variant).trim() || undefined;

  return {
    item_id: itemId,
    item_name: itemName,
    ...(itemVariant ? { item_variant: itemVariant } : {}),
    price,
    quantity,
  };
}

function buildEvent(
  event: EcommerceEventName,
  sourceItems: CommerceItem[],
  currency: string,
): EcommerceEvent {
  const items = sourceItems.map(normalizedItem);
  const value = Math.round(
    items.reduce((total, item) => total + item.price * item.quantity, 0) *
      100,
  ) / 100;

  return {
    event,
    params: {
      currency: normalizedCurrency(currency),
      value,
      items,
    },
  };
}

export function buildViewItem(
  item: CommerceItem,
  currency: string,
): EcommerceEvent {
  return buildEvent('view_item', [item], currency);
}

export function buildAddToCart(
  item: CommerceItem,
  currency: string,
): EcommerceEvent {
  return buildEvent('add_to_cart', [item], currency);
}

export function buildViewCart(
  items: CommerceItem[],
  currency: string,
): EcommerceEvent {
  return buildEvent('view_cart', items, currency);
}

export function buildBeginCheckout(
  items: CommerceItem[],
  currency: string,
): EcommerceEvent {
  return buildEvent('begin_checkout', items, currency);
}
