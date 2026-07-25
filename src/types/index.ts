// ============================================
// Tarife Attär - Type Definitions
// ============================================

// Navigation & UI State
export type EntryState = 'idle' | 'atlas' | 'relic';
export type CollectionType = 'atlas' | 'relic';
export type Theme = 'light' | 'dark';

// Shoppable Image System
export interface Hotspot {
  x: number;
  y: number;
  label: string;
  link?: string;
  annotation?: string;
  productReference?: string;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ShoppableImage {
  image: SanityImage;
  alt: string;
  hotspots: Hotspot[];
}

// Museum & Exhibit System
export interface Artifact {
  product: string;
  museumLabel: string;
  coordinates: { x: number; y: number };
}

export interface MuseumExhibit {
  exhibitImage: SanityImage;
  caption: string;
  artifacts: Artifact[];
}

// Field Reports (Atlas Collection)
export interface FieldReport {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  coordinates: string;
}

// Product System
export type ProductFormat =
  | 'Perfume Oil'
  | 'Atmosphere Mist'
  | 'Traditional Attar'
  | 'Pure Distillate'
  | 'Pure Oud'
  | 'Aged Resin'
  | 'Rare Attar';

export type HardwareType =
  | 'Roller'
  | 'Spray'
  | 'Dropper'
  | 'Dip Stick'
  | 'Vial';

// Atlas/Relic sub-objects, shaped to match the productBySlugQuery projection
// in src/sanity/lib/queries.ts (not the full Sanity schema — see convention note below).
export interface AtlasData {
  atmosphere?: 'tidal' | 'ember' | 'petal' | 'terra';
  gpsCoordinates?: string;
  latitude?: number;
  longitude?: number;
  evocationLocation?: string;
  evocationStory?: string[];
  onSkinStory?: string[];
  travelLog?: unknown; // Portable Text
  badges?: string[];
  fieldReport?: ShoppableImage;
}

export interface RelicData {
  distillationYear?: number;
  originRegion?: string;
  gpsCoordinates?: string;
  viscosity?: number;
  museumDescription?: unknown; // Portable Text
  badges?: string[];
  museumExhibit?: MuseumExhibit;
}

export interface Product {
  id?: string; // Legacy ID support
  _id?: string; // Sanity ID
  title: string;
  slug?: { current: string };
  price?: number | string;
  priceMax?: number | string;
  imageUrl?: string;
  mainImage?: SanityImage;
  collectionType?: CollectionType;
  productFormat?: ProductFormat | string;
  volume?: string;
  hardware?: HardwareType;
  inStock?: boolean;

  // Legacy Name System (Rebrand)
  legacyName?: string;
  showLegacyName?: boolean;

  // Rich Content
  fieldReport?: ShoppableImage;
  museumExhibit?: MuseumExhibit;
  description?: string;
  atlasData?: AtlasData;
  relicData?: RelicData;

  // Metadata
  gpsCoordinates?: string;
  scentVibe?: string;
  fieldJournalEntry?: string;
  distillationYear?: string;
  origin?: string;
  materialType?: string;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  perfumer?: string;
  year?: number;
  scarcityNote?: string;
  reviews?: number[]; // Published review ratings (1-5) for this product

  // Shopify linkage — see src/sanity/schema/shopifyFields.ts
  shopifyProductId?: string;
  shopifyHandle?: string;
  shopifyVariantId?: string;
  shopifyVariant6mlId?: string;
  shopifyVariant12mlId?: string;
  sku?: string;
  sku6ml?: string;
  sku12ml?: string;

  // Wholesale
  isWholesaleEnabled?: boolean;
  wholesalePrice?: string;
  caseQuantity?: number;
  leadTime?: string;
  replenishToken?: string;

  // Retail/Kiosk
  kioskBlurb?: string;
  printLabelQr?: string;
}

// Keep this in sync with src/sanity/schema/product.ts (the source schema) and
// the projections in src/sanity/lib/queries.ts (what's actually fetched) —
// there's no generated-type pipeline here, so a field added to a query needs
// a matching field added here by hand. ProductDetailClient.tsx intentionally
// keeps its own local superset interface for the detail page's fuller needs;
// update both when a schema field a query returns changes.

// Cart System
export interface CartItem extends Product {
  quantity: number;
}

