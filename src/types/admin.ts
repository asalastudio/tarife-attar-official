/**
 * Tarife Attar Admin Dashboard Types
 * Unified data models for multi-platform inventory and order management
 */

// ============================================
// PRODUCT TYPES
// ============================================

export type Territory = 'ember' | 'petal' | 'tidal' | 'terra';
export type CollectionType = 'atlas' | 'relic';
export type Platform = 'shopify' | 'etsy';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'out_of_sync';

export interface UnifiedProduct {
  id: string;
  sku: string;
  title: string;
  legacyName?: string;
  territory?: Territory;
  collectionType: CollectionType;

  // Pricing
  costPrice: number;      // What we pay
  retailPrice: number;    // What we sell for

  // Platform IDs (for API calls)
  shopifyProductId?: string;
  shopifyVariantId?: string;
  etsyListingId?: string;
  sanityId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: '3ml' | '5ml' | '6ml' | '10ml' | '12ml';

  // Pricing per variant
  costPrice: number;
  retailPrice: number;

  // Platform variant IDs
  shopifyVariantId?: string;
  etsyListingId?: string;  // Etsy uses separate listings per variant
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;

  // Unified quantity (source of truth)
  quantity: number;
  lowStockThreshold: number;

  // Platform quantities (for sync comparison)
  shopifyQuantity?: number;
  etsyQuantity?: number;

  // Sync status
  syncStatus: SyncStatus;
  lastSyncedAt?: Date;
  syncError?: string;
}

export interface InventoryAdjustment {
  id: string;
  inventoryItemId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustmentType: 'manual' | 'sale' | 'restock' | 'sync' | 'po_received';
  reason?: string;
  createdAt: Date;
  createdBy?: string;
}

// ============================================
// PLATFORM SYNC TYPES
// ============================================

export interface PlatformSyncRecord {
  id: string;
  productId: string;
  platform: Platform;
  remoteId: string;          // shopifyVariantId or etsyListingId
  remoteQuantity: number;
  localQuantity: number;
  syncStatus: SyncStatus;
  lastSyncedAt: Date;
  lastSyncError?: string;
}

export interface SyncJob {
  id: string;
  platform: Platform;
  jobType: 'full_sync' | 'inventory_push' | 'inventory_pull' | 'orders_pull';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  itemsProcessed: number;
  itemsFailed: number;
  errorLog?: string[];
}

// ============================================
// ORDER TYPES
// ============================================

export interface UnifiedOrder {
  id: string;
  platform: Platform;
  platformOrderId: string;
  orderNumber: string;

  // Customer
  customerEmail?: string;
  customerName?: string;

  // Financials
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;

  // Status
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  fulfillmentStatus?: string;
  paymentStatus?: string;

  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLineItem {
  id: string;
  orderId: string;
  productId?: string;       // Link to unified product
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice?: number;       // For profit calculation
}

// ============================================
// PURCHASE ORDER TYPES
// ============================================

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierContact?: string;

  // Status
  status: 'draft' | 'submitted' | 'confirmed' | 'partial' | 'received' | 'cancelled';

  // Dates
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;

  // Financials
  subtotal: number;
  shipping: number;
  total: number;

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  variantId?: string;
  sku: string;
  title: string;

  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SalesMetrics {
  period: 'today' | 'week' | 'month' | 'year';

  // Revenue
  totalRevenue: number;
  shopifyRevenue: number;
  etsyRevenue: number;

  // Orders
  totalOrders: number;
  shopifyOrders: number;
  etsyOrders: number;

  // Averages
  averageOrderValue: number;

  // Units
  unitsSold: number;

  // Profit (if cost data available)
  grossProfit?: number;
  profitMargin?: number;

  // Comparison
  previousPeriodRevenue?: number;
  revenueChangePercent?: number;
}

export interface ProductSalesMetrics {
  productId: string;
  sku: string;
  title: string;
  territory?: Territory;

  unitsSold: number;
  revenue: number;
  profit?: number;

  // Platform breakdown
  shopifyUnits: number;
  etsyUnits: number;
}

export interface TerritoryMetrics {
  territory: Territory;
  unitsSold: number;
  revenue: number;
  percentOfTotal: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// PLATFORM CONNECTOR TYPES
// ============================================

export interface PlatformConnector {
  name: Platform;
  isConnected: boolean;

  // Inventory operations
  getInventory(sku: string): Promise<number | null>;
  updateInventory(sku: string, quantity: number): Promise<boolean>;

  // Product operations
  getProduct(remoteId: string): Promise<unknown>;
  updateProduct(remoteId: string, data: Partial<UnifiedProduct>): Promise<boolean>;

  // Order operations
  getOrders(since: Date): Promise<UnifiedOrder[]>;

  // Sync operations
  testConnection(): Promise<boolean>;
}
