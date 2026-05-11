import 'server-only';

import { contactMatches, ContactInput, toE164US } from '@/lib/voice-agent/contact';

const DEFAULT_ADMIN_API_VERSION = '2026-01';

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyTrackingInfo {
  company?: string | null;
  number?: string | null;
  url?: string | null;
}

interface ShopifyFulfillment {
  status?: string | null;
  trackingInfo?: ShopifyTrackingInfo[] | null;
}

interface ShopifyLineItem {
  title: string;
  quantity: number;
  variantTitle?: string | null;
}

interface ShopifyAddress {
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  country?: string | null;
}

interface ShopifyCustomer {
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ShopifyOrderNode {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  processedAt?: string | null;
  displayFulfillmentStatus?: string | null;
  displayFinancialStatus?: string | null;
  totalPriceSet?: {
    shopMoney?: ShopifyMoney | null;
  } | null;
  customer?: ShopifyCustomer | null;
  shippingAddress?: ShopifyAddress | null;
  billingAddress?: ShopifyAddress | null;
  fulfillments?: ShopifyFulfillment[] | null;
  lineItems?: {
    nodes?: ShopifyLineItem[];
  } | null;
}

export interface VoiceOrderTracking {
  company?: string;
  number?: string;
  url?: string;
}

export interface VoiceOrder {
  id: string;
  name: string;
  customerName?: string;
  email?: string;
  phone?: string;
  processedAt?: string;
  fulfillmentStatus?: string;
  financialStatus?: string;
  total?: ShopifyMoney;
  shippingAddress?: ShopifyAddress;
  billingAddress?: ShopifyAddress;
  fulfillments: ShopifyFulfillment[];
  lineItems: ShopifyLineItem[];
  tracking: VoiceOrderTracking[];
}

const ORDER_LOOKUP_QUERY = `
  query VoiceOrderLookup($query: String!) {
    orders(first: 5, query: $query) {
      nodes {
        id
        name
        email
        phone
        processedAt
        displayFulfillmentStatus
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          displayName
          email
          phone
        }
        shippingAddress {
          name
          phone
          city
          province
          provinceCode
          country
        }
        billingAddress {
          name
          phone
          city
          province
          provinceCode
          country
        }
        fulfillments(first: 10) {
          status
          trackingInfo(first: 10) {
            company
            number
            url
          }
        }
        lineItems(first: 20) {
          nodes {
            title
            quantity
            variantTitle
          }
        }
      }
    }
  }
`;

export async function findShopifyOrderByNumber(orderNumber: string): Promise<VoiceOrder | null> {
  const queries = buildOrderQueries(orderNumber);

  for (const query of queries) {
    const data = await shopifyAdminGraphQL<{ orders?: { nodes?: ShopifyOrderNode[] } }>(
      ORDER_LOOKUP_QUERY,
      { query }
    );
    const order = data.orders?.nodes?.[0];
    if (order) return normalizeOrder(order);
  }

  return null;
}

export function orderContactMatches(order: VoiceOrder, input: ContactInput): boolean {
  return contactMatches(input, {
    emails: [order.email],
    phones: [order.phone, order.shippingAddress?.phone, order.billingAddress?.phone],
  });
}

export function getOrderDestinationPhone(order: VoiceOrder): string | undefined {
  return (
    toE164US(order.phone) ||
    toE164US(order.shippingAddress?.phone) ||
    toE164US(order.billingAddress?.phone)
  );
}

export function buildOrderStatusMessage(order: VoiceOrder): string {
  const status = humanizeStatus(order.fulfillmentStatus || 'unknown');
  const tracking = order.tracking.find((item) => item.url);
  const trackingPart = tracking?.url
    ? ` Tracking: ${tracking.url}`
    : ' Tracking is not available yet.';
  return `Tarife Attar: ${order.name} is ${status}.${trackingPart}`;
}

function normalizeOrder(order: ShopifyOrderNode): VoiceOrder {
  const tracking =
    order.fulfillments?.flatMap((fulfillment) =>
      fulfillment.trackingInfo?.map((item) => ({
        company: item.company || undefined,
        number: item.number || undefined,
        url: item.url || undefined,
      })) || []
    ) || [];

  return {
    id: order.id,
    name: order.name,
    customerName: order.customer?.displayName || order.shippingAddress?.name || undefined,
    email: order.email || order.customer?.email || undefined,
    phone: order.phone || order.customer?.phone || undefined,
    processedAt: order.processedAt || undefined,
    fulfillmentStatus: order.displayFulfillmentStatus || undefined,
    financialStatus: order.displayFinancialStatus || undefined,
    total: order.totalPriceSet?.shopMoney || undefined,
    shippingAddress: order.shippingAddress || undefined,
    billingAddress: order.billingAddress || undefined,
    fulfillments: order.fulfillments || [],
    lineItems: order.lineItems?.nodes || [],
    tracking,
  };
}

function buildOrderQueries(orderNumber: string): string[] {
  const sanitized = orderNumber.trim().replace(/[^a-zA-Z0-9#-]/g, '');
  const withoutHash = sanitized.replace(/^#/, '');
  const withHash = withoutHash ? `#${withoutHash}` : sanitized;
  return Array.from(new Set([`name:${withHash}`, `name:${withoutHash}`, sanitized && `name:${sanitized}`].filter(Boolean) as string[]));
}

async function shopifyAdminGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION || DEFAULT_ADMIN_API_VERSION;

  if (!domain || !token) {
    throw new Error(
      'Shopify Admin API env vars are not configured. Required: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_ACCESS_TOKEN.'
    );
  }

  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    throw new Error(
      json.errors ? JSON.stringify(json.errors) : `Shopify Admin API failed with ${res.status}`
    );
  }

  return json.data as T;
}

function humanizeStatus(status: string): string {
  return status.toLowerCase().replace(/_/g, ' ');
}
