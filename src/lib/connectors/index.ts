/**
 * Platform Connectors Index
 * Unified interface for all e-commerce platform integrations
 */

export { shopifyConnector } from './shopify';
export { etsyConnector } from './etsy';
export { sanityConnector } from './sanity';

import { shopifyConnector } from './shopify';
import { etsyConnector } from './etsy';
import { sanityConnector } from './sanity';
import type { Platform, UnifiedProduct, UnifiedOrder } from '@/types/admin';

// ============================================
// UNIFIED PLATFORM MANAGER
// ============================================

export const platformManager = {
  /**
   * Get all connected platforms
   */
  async getConnectedPlatforms(): Promise<Platform[]> {
    const platforms: Platform[] = [];

    if (await shopifyConnector.testConnection()) {
      platforms.push('shopify');
    }
    if (await etsyConnector.testConnection()) {
      platforms.push('etsy');
    }

    return platforms;
  },

  /**
   * Sync inventory to all platforms
   */
  async syncInventoryToAll(sku: string, quantity: number): Promise<{
    shopify: boolean;
    etsy: boolean;
  }> {
    const [shopifyResult, etsyResult] = await Promise.allSettled([
      shopifyConnector.updateInventory(sku, quantity),
      etsyConnector.updateInventory(sku, quantity),
    ]);

    return {
      shopify: shopifyResult.status === 'fulfilled' && shopifyResult.value,
      etsy: etsyResult.status === 'fulfilled' && etsyResult.value,
    };
  },

  /**
   * Get inventory from all platforms for comparison
   */
  async getInventoryFromAll(sku: string): Promise<{
    shopify: number | null;
    etsy: number | null;
  }> {
    const [shopifyQty, etsyQty] = await Promise.allSettled([
      shopifyConnector.getInventory(sku),
      etsyConnector.getInventory(sku),
    ]);

    return {
      shopify: shopifyQty.status === 'fulfilled' ? shopifyQty.value : null,
      etsy: etsyQty.status === 'fulfilled' ? etsyQty.value : null,
    };
  },

  /**
   * Get orders from all platforms
   */
  async getOrdersFromAll(since: Date): Promise<UnifiedOrder[]> {
    const [shopifyOrders, etsyOrders] = await Promise.allSettled([
      shopifyConnector.getOrders(since),
      etsyConnector.getOrders(since),
    ]);

    const orders: UnifiedOrder[] = [];

    if (shopifyOrders.status === 'fulfilled') {
      orders.push(...shopifyOrders.value);
    }
    if (etsyOrders.status === 'fulfilled') {
      orders.push(...etsyOrders.value);
    }

    // Sort by date descending
    return orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Push product content to a platform
   */
  async pushProductContent(
    platform: Platform,
    remoteId: string,
    data: Partial<UnifiedProduct>
  ): Promise<boolean> {
    switch (platform) {
      case 'shopify':
        return shopifyConnector.updateProduct(remoteId, data);
      case 'etsy':
        return etsyConnector.updateProduct(remoteId, data);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  },
};
