/**
 * Shopify Admin API Connector
 *
 * Handles all Shopify Admin API operations for inventory,
 * products, and orders management.
 *
 * Required Environment Variables:
 * - SHOPIFY_ADMIN_API_ACCESS_TOKEN
 * - SHOPIFY_STORE_DOMAIN (e.g., "tarifeattar.myshopify.com")
 */

import type { UnifiedOrder, UnifiedProduct } from '@/types/admin';

const SHOPIFY_API_VERSION = '2024-01';

interface ShopifyConfig {
  storeDomain: string;
  accessToken: string;
}

function getConfig(): ShopifyConfig {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!storeDomain || !accessToken) {
    throw new Error(
      'Missing Shopify configuration. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_ACCESS_TOKEN'
    );
  }

  return { storeDomain, accessToken };
}

async function shopifyAdminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getConfig();
  const url = `https://${config.storeDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.accessToken,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================
// SHOPIFY CONNECTOR
// ============================================

export const shopifyConnector = {
  name: 'shopify' as const,

  /**
   * Test if Shopify connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const config = getConfig();
      if (!config.storeDomain || !config.accessToken) return false;

      await shopifyAdminFetch('/shop.json');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get inventory level for a SKU
   */
  async getInventory(sku: string): Promise<number | null> {
    try {
      // First, find the variant by SKU
      const response = await shopifyAdminFetch<{
        variants: Array<{
          id: number;
          inventory_item_id: number;
          inventory_quantity: number;
        }>;
      }>(`/variants.json?sku=${encodeURIComponent(sku)}`);

      if (!response.variants || response.variants.length === 0) {
        return null;
      }

      return response.variants[0].inventory_quantity;
    } catch (error) {
      console.error(`[Shopify] Failed to get inventory for SKU ${sku}:`, error);
      return null;
    }
  },

  /**
   * Update inventory level for a SKU
   */
  async updateInventory(sku: string, quantity: number): Promise<boolean> {
    try {
      // First, find the variant and its inventory item ID
      const variantResponse = await shopifyAdminFetch<{
        variants: Array<{
          id: number;
          inventory_item_id: number;
          inventory_quantity: number;
        }>;
      }>(`/variants.json?sku=${encodeURIComponent(sku)}`);

      if (!variantResponse.variants || variantResponse.variants.length === 0) {
        console.error(`[Shopify] No variant found for SKU ${sku}`);
        return false;
      }

      const variant = variantResponse.variants[0];
      const inventoryItemId = variant.inventory_item_id;

      // Get location ID (assuming single location)
      const locationsResponse = await shopifyAdminFetch<{
        locations: Array<{ id: number; active: boolean }>;
      }>('/locations.json');

      const activeLocation = locationsResponse.locations.find((l) => l.active);
      if (!activeLocation) {
        console.error('[Shopify] No active location found');
        return false;
      }

      // Set inventory level
      await shopifyAdminFetch('/inventory_levels/set.json', {
        method: 'POST',
        body: JSON.stringify({
          location_id: activeLocation.id,
          inventory_item_id: inventoryItemId,
          available: quantity,
        }),
      });

      return true;
    } catch (error) {
      console.error(`[Shopify] Failed to update inventory for SKU ${sku}:`, error);
      return false;
    }
  },

  /**
   * Get product by Shopify product ID
   */
  async getProduct(productId: string): Promise<unknown> {
    try {
      const response = await shopifyAdminFetch(`/products/${productId}.json`);
      return response;
    } catch (error) {
      console.error(`[Shopify] Failed to get product ${productId}:`, error);
      return null;
    }
  },

  /**
   * Update product details
   */
  async updateProduct(
    productId: string,
    data: Partial<UnifiedProduct>
  ): Promise<boolean> {
    try {
      const updatePayload: Record<string, unknown> = {};

      if (data.title) {
        updatePayload.title = data.title;
      }

      await shopifyAdminFetch(`/products/${productId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ product: updatePayload }),
      });

      return true;
    } catch (error) {
      console.error(`[Shopify] Failed to update product ${productId}:`, error);
      return false;
    }
  },

  /**
   * Get orders since a given date
   */
  async getOrders(since: Date): Promise<UnifiedOrder[]> {
    try {
      const sinceISO = since.toISOString();
      const response = await shopifyAdminFetch<{
        orders: Array<{
          id: number;
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
          subtotal_price: string;
          total_shipping_price_set: { shop_money: { amount: string } };
          total_tax: string;
          total_price: string;
          financial_status: string;
          fulfillment_status: string | null;
          customer?: { first_name: string; last_name: string };
        }>;
      }>(`/orders.json?created_at_min=${sinceISO}&status=any`);

      return response.orders.map((order) => ({
        id: `shopify_${order.id}`,
        platform: 'shopify' as const,
        platformOrderId: String(order.id),
        orderNumber: order.name,
        customerEmail: order.email,
        customerName: order.customer
          ? `${order.customer.first_name} ${order.customer.last_name}`
          : undefined,
        subtotal: parseFloat(order.subtotal_price),
        shipping: parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0'),
        tax: parseFloat(order.total_tax),
        total: parseFloat(order.total_price),
        status: mapShopifyStatus(order.financial_status, order.fulfillment_status),
        fulfillmentStatus: order.fulfillment_status || undefined,
        paymentStatus: order.financial_status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      }));
    } catch (error) {
      console.error('[Shopify] Failed to get orders:', error);
      return [];
    }
  },

  /**
   * Get all products with inventory
   */
  async getAllProducts(): Promise<
    Array<{
      id: string;
      title: string;
      variants: Array<{
        id: string;
        sku: string;
        price: string;
        inventory_quantity: number;
      }>;
    }>
  > {
    try {
      const response = await shopifyAdminFetch<{
        products: Array<{
          id: number;
          title: string;
          variants: Array<{
            id: number;
            sku: string;
            price: string;
            inventory_quantity: number;
          }>;
        }>;
      }>('/products.json?limit=250');

      return response.products.map((p) => ({
        id: String(p.id),
        title: p.title,
        variants: p.variants.map((v) => ({
          id: String(v.id),
          sku: v.sku,
          price: v.price,
          inventory_quantity: v.inventory_quantity,
        })),
      }));
    } catch (error) {
      console.error('[Shopify] Failed to get all products:', error);
      return [];
    }
  },
};

// Helper function to map Shopify statuses to unified status
function mapShopifyStatus(
  financial: string,
  fulfillment: string | null
): UnifiedOrder['status'] {
  if (financial === 'refunded' || financial === 'voided') return 'cancelled';
  if (fulfillment === 'fulfilled') return 'delivered';
  if (fulfillment === 'partial') return 'shipped';
  if (financial === 'paid') return 'processing';
  return 'pending';
}
