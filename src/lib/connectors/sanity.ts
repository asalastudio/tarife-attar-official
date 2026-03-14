/**
 * Sanity CMS Connector
 *
 * Handles all Sanity operations for product content,
 * narrative data, and image management.
 *
 * Required Environment Variables:
 * - NEXT_PUBLIC_SANITY_PROJECT_ID
 * - NEXT_PUBLIC_SANITY_DATASET
 * - SANITY_API_TOKEN (for write operations)
 */

import { createClient } from '@sanity/client';
import type { Territory, CollectionType } from '@/types/admin';

interface SanityProduct {
  _id: string;
  _type: 'product';
  title: string;
  slug: { current: string };
  legacyName?: string;
  collectionType: CollectionType;

  // Atlas-specific
  atlasData?: {
    territory: Territory;
    evocationPoint?: {
      location: string;
      coordinates: string;
    };
    evocation?: Array<{ _type: 'block'; children: Array<{ text: string }> }>;
    onSkin?: Array<{ _type: 'block'; children: Array<{ text: string }> }>;
    notes?: {
      top: string[];
      heart: string[];
      base: string[];
    };
  };

  // Relic-specific
  relicData?: {
    distillationYear?: number;
    originRegion?: string;
    gpsCoordinates?: string;
    viscosity?: number;
    museumDescription?: Array<{ _type: 'block'; children: Array<{ text: string }> }>;
  };

  // Shopify sync
  shopifyProductId?: string;
  shopifyVariantId?: string;

  // Images
  featuredImage?: {
    _type: 'image';
    asset: { _ref: string };
  };
}

function getClient(withWriteAccess = false) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: !withWriteAccess,
    token: withWriteAccess ? token : undefined,
  });
}

// ============================================
// SANITY CONNECTOR
// ============================================

export const sanityConnector = {
  name: 'sanity' as const,

  /**
   * Test if Sanity connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = getClient();
      await client.fetch('*[_type == "product"][0]._id');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get all products from Sanity
   */
  async getAllProducts(): Promise<SanityProduct[]> {
    const client = getClient();

    const query = `*[_type == "product"] | order(title asc) {
      _id,
      title,
      slug,
      legacyName,
      collectionType,
      atlasData,
      relicData,
      shopifyProductId,
      shopifyVariantId,
      featuredImage
    }`;

    return client.fetch(query);
  },

  /**
   * Get products by collection type
   */
  async getProductsByCollection(
    collectionType: CollectionType
  ): Promise<SanityProduct[]> {
    const client = getClient();

    const query = `*[_type == "product" && collectionType == $collectionType] | order(title asc) {
      _id,
      title,
      slug,
      legacyName,
      collectionType,
      atlasData,
      relicData,
      shopifyProductId,
      shopifyVariantId,
      featuredImage
    }`;

    return client.fetch(query, { collectionType });
  },

  /**
   * Get products by territory
   */
  async getProductsByTerritory(territory: Territory): Promise<SanityProduct[]> {
    const client = getClient();

    const query = `*[_type == "product" && atlasData.territory == $territory] | order(title asc) {
      _id,
      title,
      slug,
      legacyName,
      collectionType,
      atlasData,
      shopifyProductId,
      shopifyVariantId,
      featuredImage
    }`;

    return client.fetch(query, { territory });
  },

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<SanityProduct | null> {
    const client = getClient();

    const query = `*[_type == "product" && _id == $productId][0] {
      _id,
      title,
      slug,
      legacyName,
      collectionType,
      atlasData,
      relicData,
      shopifyProductId,
      shopifyVariantId,
      featuredImage
    }`;

    return client.fetch(query, { productId });
  },

  /**
   * Get a product by Shopify product ID
   */
  async getProductByShopifyId(
    shopifyProductId: string
  ): Promise<SanityProduct | null> {
    const client = getClient();

    const query = `*[_type == "product" && shopifyProductId == $shopifyProductId][0] {
      _id,
      title,
      slug,
      legacyName,
      collectionType,
      atlasData,
      relicData,
      shopifyProductId,
      shopifyVariantId,
      featuredImage
    }`;

    return client.fetch(query, { shopifyProductId });
  },

  /**
   * Update product content (evocation, onSkin, etc.)
   */
  async updateProductContent(
    productId: string,
    content: {
      evocation?: string[];
      onSkin?: string[];
      notes?: {
        top: string[];
        heart: string[];
        base: string[];
      };
    }
  ): Promise<boolean> {
    try {
      const client = getClient(true);

      const updates: Record<string, unknown> = {};

      if (content.evocation) {
        updates['atlasData.evocation'] = content.evocation.map((text) => ({
          _type: 'block',
          _key: Math.random().toString(36).slice(2),
          children: [{ _type: 'span', _key: 'span1', text }],
        }));
      }

      if (content.onSkin) {
        updates['atlasData.onSkin'] = content.onSkin.map((text) => ({
          _type: 'block',
          _key: Math.random().toString(36).slice(2),
          children: [{ _type: 'span', _key: 'span1', text }],
        }));
      }

      if (content.notes) {
        updates['atlasData.notes'] = content.notes;
      }

      await client.patch(productId).set(updates).commit();

      return true;
    } catch (error) {
      console.error(`[Sanity] Failed to update product ${productId}:`, error);
      return false;
    }
  },

  /**
   * Update Relic product museum description
   */
  async updateRelicContent(
    productId: string,
    content: {
      museumDescription?: string[];
      distillationYear?: number;
      originRegion?: string;
      viscosity?: number;
    }
  ): Promise<boolean> {
    try {
      const client = getClient(true);

      const updates: Record<string, unknown> = {};

      if (content.museumDescription) {
        updates['relicData.museumDescription'] = content.museumDescription.map(
          (text) => ({
            _type: 'block',
            _key: Math.random().toString(36).slice(2),
            children: [{ _type: 'span', _key: 'span1', text }],
          })
        );
      }

      if (content.distillationYear) {
        updates['relicData.distillationYear'] = content.distillationYear;
      }

      if (content.originRegion) {
        updates['relicData.originRegion'] = content.originRegion;
      }

      if (content.viscosity !== undefined) {
        updates['relicData.viscosity'] = content.viscosity;
      }

      await client.patch(productId).set(updates).commit();

      return true;
    } catch (error) {
      console.error(`[Sanity] Failed to update Relic product ${productId}:`, error);
      return false;
    }
  },

  /**
   * Link a Sanity product to Shopify
   */
  async linkToShopify(
    productId: string,
    shopifyProductId: string,
    shopifyVariantId?: string
  ): Promise<boolean> {
    try {
      const client = getClient(true);

      const updates: Record<string, string> = {
        shopifyProductId,
      };

      if (shopifyVariantId) {
        updates.shopifyVariantId = shopifyVariantId;
      }

      await client.patch(productId).set(updates).commit();

      return true;
    } catch (error) {
      console.error(`[Sanity] Failed to link product ${productId} to Shopify:`, error);
      return false;
    }
  },

  /**
   * Create a new product in Sanity
   */
  async createProduct(
    product: Omit<SanityProduct, '_id' | '_type'>
  ): Promise<string | null> {
    try {
      const client = getClient(true);

      const result = await client.create({
        _type: 'product',
        ...product,
      });

      return result._id;
    } catch (error) {
      console.error('[Sanity] Failed to create product:', error);
      return null;
    }
  },

  /**
   * Get inventory audit data (products with Shopify IDs)
   */
  async getInventoryAudit(): Promise<
    Array<{
      _id: string;
      title: string;
      shopifyProductId?: string;
      shopifyVariantId?: string;
      hasShopifyLink: boolean;
    }>
  > {
    const client = getClient();

    const query = `*[_type == "product"] | order(title asc) {
      _id,
      title,
      shopifyProductId,
      shopifyVariantId,
      "hasShopifyLink": defined(shopifyProductId)
    }`;

    return client.fetch(query);
  },
};
