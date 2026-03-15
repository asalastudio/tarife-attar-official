/**
 * Etsy Open API v3 Connector
 *
 * Handles all Etsy API operations for inventory,
 * listings, and orders management.
 *
 * Required Environment Variables:
 * - ETSY_API_KEY (Keystring from Etsy Developer Portal)
 * - ETSY_ACCESS_TOKEN (OAuth 2.0 access token)
 * - ETSY_REFRESH_TOKEN (OAuth 2.0 refresh token)
 * - ETSY_SHOP_ID (Your Etsy shop ID)
 *
 * Note: Etsy OAuth tokens expire after 1 hour.
 * The refresh token lasts 90 days.
 */

import type { UnifiedOrder, UnifiedProduct } from '@/types/admin';

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

interface EtsyConfig {
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  shopId: string;
}

interface EtsyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// Token cache (in production, store in database)
let tokenCache: {
  accessToken: string;
  expiresAt: Date;
} | null = null;

function getConfig(): EtsyConfig {
  const apiKey = process.env.ETSY_API_KEY;
  const accessToken = process.env.ETSY_ACCESS_TOKEN;
  const refreshToken = process.env.ETSY_REFRESH_TOKEN;
  const shopId = process.env.ETSY_SHOP_ID;

  if (!apiKey || !accessToken || !refreshToken || !shopId) {
    throw new Error(
      'Missing Etsy configuration. Set ETSY_API_KEY, ETSY_ACCESS_TOKEN, ETSY_REFRESH_TOKEN, and ETSY_SHOP_ID'
    );
  }

  return { apiKey, accessToken, refreshToken, shopId };
}

/**
 * Refresh the Etsy access token using the refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const config = getConfig();

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.apiKey,
      refresh_token: config.refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Etsy access token');
  }

  const data: EtsyTokenResponse = await response.json();

  // Update token cache
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000 - 60000), // 1 minute buffer
  };

  // In production, you would also:
  // 1. Store the new refresh_token (data.refresh_token)
  // 2. Update environment variables or database

  return data.access_token;
}

/**
 * Get a valid access token (refreshing if necessary)
 */
async function getValidAccessToken(): Promise<string> {
  // Check if cached token is still valid
  if (tokenCache && tokenCache.expiresAt > new Date()) {
    return tokenCache.accessToken;
  }

  // Try to refresh
  try {
    return await refreshAccessToken();
  } catch {
    // Fall back to environment token (may be expired)
    const config = getConfig();
    return config.accessToken;
  }
}

async function etsyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getConfig();
  const accessToken = await getValidAccessToken();
  const url = `${ETSY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Etsy API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================
// ETSY CONNECTOR
// ============================================

export const etsyConnector = {
  name: 'etsy' as const,

  /**
   * Test if Etsy connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const config = getConfig();
      if (!config.apiKey || !config.accessToken || !config.shopId) return false;

      await etsyFetch(`/application/shops/${config.shopId}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get inventory level for a SKU
   * Note: Etsy uses listing_id, so we need to look up by SKU
   */
  async getInventory(sku: string): Promise<number | null> {
    try {
      const config = getConfig();

      // Get all active listings and find by SKU
      const response = await etsyFetch<{
        results: Array<{
          listing_id: number;
          sku: string[];
          quantity: number;
        }>;
      }>(`/application/shops/${config.shopId}/listings/active?limit=100`);

      // Find listing with matching SKU
      const listing = response.results.find(
        (l) => l.sku && l.sku.includes(sku)
      );

      if (!listing) {
        return null;
      }

      return listing.quantity;
    } catch (error) {
      console.error(`[Etsy] Failed to get inventory for SKU ${sku}:`, error);
      return null;
    }
  },

  /**
   * Update inventory level for a SKU
   */
  async updateInventory(sku: string, quantity: number): Promise<boolean> {
    try {
      const config = getConfig();

      // First find the listing ID by SKU
      const listingsResponse = await etsyFetch<{
        results: Array<{
          listing_id: number;
          sku: string[];
        }>;
      }>(`/application/shops/${config.shopId}/listings/active?limit=100`);

      const listing = listingsResponse.results.find(
        (l) => l.sku && l.sku.includes(sku)
      );

      if (!listing) {
        console.error(`[Etsy] No listing found for SKU ${sku}`);
        return false;
      }

      // Get current inventory to update it
      const inventoryResponse = await etsyFetch<{
        products: Array<{
          product_id: number;
          sku: string;
          offerings: Array<{
            offering_id: number;
            price: { amount: number; divisor: number };
            quantity: number;
            is_enabled: boolean;
          }>;
        }>;
      }>(`/application/listings/${listing.listing_id}/inventory`);

      // Update each product's quantity
      const updatedProducts = inventoryResponse.products.map((product) => ({
        sku: product.sku,
        offerings: product.offerings.map((offering) => ({
          price: offering.price.amount / offering.price.divisor,
          quantity: quantity, // Update to new quantity
          is_enabled: offering.is_enabled,
        })),
      }));

      // Push updated inventory
      await etsyFetch(`/application/listings/${listing.listing_id}/inventory`, {
        method: 'PUT',
        body: JSON.stringify({ products: updatedProducts }),
      });

      return true;
    } catch (error) {
      console.error(`[Etsy] Failed to update inventory for SKU ${sku}:`, error);
      return false;
    }
  },

  /**
   * Get listing by Etsy listing ID
   */
  async getProduct(listingId: string): Promise<unknown> {
    try {
      const response = await etsyFetch(`/application/listings/${listingId}`);
      return response;
    } catch (error) {
      console.error(`[Etsy] Failed to get listing ${listingId}:`, error);
      return null;
    }
  },

  /**
   * Update listing details
   */
  async updateProduct(
    listingId: string,
    data: Partial<UnifiedProduct>
  ): Promise<boolean> {
    try {
      const config = getConfig();
      const updatePayload: Record<string, unknown> = {};

      if (data.title) {
        updatePayload.title = data.title;
      }

      await etsyFetch(
        `/application/shops/${config.shopId}/listings/${listingId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updatePayload),
        }
      );

      return true;
    } catch (error) {
      console.error(`[Etsy] Failed to update listing ${listingId}:`, error);
      return false;
    }
  },

  /**
   * Update listing description with AI-generated content
   */
  async updateListingContent(
    listingId: string,
    content: {
      title?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<boolean> {
    try {
      const config = getConfig();
      const updatePayload: Record<string, unknown> = {};

      if (content.title) {
        updatePayload.title = content.title;
      }
      if (content.description) {
        updatePayload.description = content.description;
      }
      if (content.tags) {
        // Etsy allows max 13 tags
        updatePayload.tags = content.tags.slice(0, 13);
      }

      await etsyFetch(
        `/application/shops/${config.shopId}/listings/${listingId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updatePayload),
        }
      );

      return true;
    } catch (error) {
      console.error(`[Etsy] Failed to update listing content ${listingId}:`, error);
      return false;
    }
  },

  /**
   * Get receipts (orders) since a given date
   */
  async getOrders(since: Date): Promise<UnifiedOrder[]> {
    try {
      const config = getConfig();
      const minCreated = Math.floor(since.getTime() / 1000);

      const response = await etsyFetch<{
        results: Array<{
          receipt_id: number;
          receipt_type: number;
          buyer_email: string;
          name: string;
          created_timestamp: number;
          updated_timestamp: number;
          subtotal: { amount: number; divisor: number };
          total_shipping_cost: { amount: number; divisor: number };
          total_tax_cost: { amount: number; divisor: number };
          grandtotal: { amount: number; divisor: number };
          status: string;
          is_paid: boolean;
          is_shipped: boolean;
        }>;
      }>(
        `/application/shops/${config.shopId}/receipts?min_created=${minCreated}`
      );

      return response.results.map((receipt) => ({
        id: `etsy_${receipt.receipt_id}`,
        platform: 'etsy' as const,
        platformOrderId: String(receipt.receipt_id),
        orderNumber: `ETSY-${receipt.receipt_id}`,
        customerEmail: receipt.buyer_email,
        customerName: receipt.name,
        subtotal: receipt.subtotal.amount / receipt.subtotal.divisor,
        shipping:
          receipt.total_shipping_cost.amount /
          receipt.total_shipping_cost.divisor,
        tax: receipt.total_tax_cost.amount / receipt.total_tax_cost.divisor,
        total: receipt.grandtotal.amount / receipt.grandtotal.divisor,
        status: mapEtsyStatus(receipt.is_paid, receipt.is_shipped),
        fulfillmentStatus: receipt.is_shipped ? 'shipped' : undefined,
        paymentStatus: receipt.is_paid ? 'paid' : 'pending',
        createdAt: new Date(receipt.created_timestamp * 1000),
        updatedAt: new Date(receipt.updated_timestamp * 1000),
      }));
    } catch (error) {
      console.error('[Etsy] Failed to get orders:', error);
      return [];
    }
  },

  /**
   * Get all active listings
   */
  async getAllListings(): Promise<
    Array<{
      listing_id: number;
      title: string;
      sku: string[];
      quantity: number;
      price: { amount: number; divisor: number };
    }>
  > {
    try {
      const config = getConfig();
      const response = await etsyFetch<{
        results: Array<{
          listing_id: number;
          title: string;
          sku: string[];
          quantity: number;
          price: { amount: number; divisor: number };
        }>;
      }>(`/application/shops/${config.shopId}/listings/active?limit=100`);

      return response.results;
    } catch (error) {
      console.error('[Etsy] Failed to get all listings:', error);
      return [];
    }
  },
};

// Helper function to map Etsy statuses to unified status
function mapEtsyStatus(isPaid: boolean, isShipped: boolean): UnifiedOrder['status'] {
  if (isShipped) return 'shipped';
  if (isPaid) return 'processing';
  return 'pending';
}
