/**
 * Madison Studio "Ghost Writer" Client
 * 
 * Utility script allowing internal tools to push content to Sanity.
 * Handles image pipeline, Portable Text conversion, and draft creation.
 */

import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

// Note: For production, install:
// npm install @sanity/client uuid
// Optional: npm install @portabletext/to-portabletext (for better markdown conversion)

interface MadisonPayload {
  title: string;
  internalName: string;
  collectionType: 'atlas' | 'relic';
  description?: string; // Markdown or HTML — not persisted, see pushDraft()
  imageUrl?: string;
  price?: number;
  volume?: string;
  productFormat?: string;
  // Atlas-specific
  atlasData?: {
    atmosphere: 'tidal' | 'ember' | 'petal' | 'terra';
    gpsCoordinates?: string;
    travelLog?: string; // Markdown
    evocationStory?: string | string[]; // Markdown (split on blank lines) or pre-split paragraphs
    onSkinStory?: string | string[]; // Markdown (split on blank lines) or pre-split paragraphs
  };
  // Relic-specific
  relicData?: {
    distillationYear?: number;
    originRegion?: string;
    viscosity?: number;
    museumDescription?: string; // Markdown
  };
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  // Shopify linkage — optional. Without these, Add-to-Cart stays disabled until
  // a human connects the product to Shopify (see TROUBLESHOOTING_PRODUCTS.md).
  shopifyProductId?: string;
  shopifyHandle?: string;
  shopifyVariantId?: string;
  shopifyVariant6mlId?: string;
  shopifyVariant12mlId?: string;
  sku?: string;
  sku6ml?: string;
  sku12ml?: string;
  // When true, publish immediately instead of leaving a Sanity draft — gated
  // by checkPublishReadiness() below. Defaults to false (current behavior).
  publish?: boolean;
}

interface PortableTextBlock {
  _type: 'block';
  style: string;
  children: Array<{
    _type: 'span';
    text: string;
    marks: unknown[];
  }>;
  markDefs: unknown[];
}

/**
 * Converts markdown/HTML to Sanity Portable Text blocks
 * Simple implementation - for production, use @portabletext/to-portabletext
 */
function markdownToBlocks(text: string): PortableTextBlock[] {
  if (!text) return [];

  // Split by paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  return paragraphs.map((para) => {
    let style = 'normal';
    let content = para.trim();

    // Check for headers
    if (content.startsWith('### ')) {
      style = 'h3';
      content = content.replace('### ', '');
    } else if (content.startsWith('## ')) {
      style = 'h2';
      content = content.replace('## ', '');
    } else if (content.startsWith('# ')) {
      style = 'h1';
      content = content.replace('# ', '');
    } else if (content.startsWith('> ')) {
      style = 'blockquote';
      content = content.replace('> ', '');
    }

    return {
      _type: 'block',
      style: style,
      children: [
        {
          _type: 'span',
          text: content,
          marks: [],
        },
      ],
      markDefs: [],
    };
  });
}

/**
 * Normalizes markdown/raw text or a pre-split array into an array of paragraph
 * strings, matching the schema's `array of string` shape for evocationStory/onSkinStory
 * (these are NOT Portable Text — no markdownToBlocks() conversion here).
 */
function toParagraphArray(input: string | string[] | undefined): string[] | undefined {
  if (!input) return undefined;
  if (Array.isArray(input)) {
    const paragraphs = input.map((p) => p.trim()).filter(Boolean);
    return paragraphs.length > 0 ? paragraphs : undefined;
  }
  const paragraphs = input
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : undefined;
}

/**
 * Checks whether a document has the minimum fields the live site requires
 * before it's safe to publish immediately instead of landing as a draft.
 * This is the safety net behind MadisonPayload.publish — see pushDraft().
 */
function checkPublishReadiness(doc: Record<string, unknown>): { ready: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!doc.title) issues.push('Missing title');
  if (!doc.internalName) issues.push('Missing internalName');
  if (!doc.collectionType) issues.push('Missing collectionType');
  if (!(doc.slug as { current?: string } | undefined)?.current) issues.push('Missing slug');
  if (!doc.shopifyVariantId) issues.push('Missing shopifyVariantId — product would publish live but not be purchasable');

  if (doc.collectionType === 'atlas') {
    const atlasData = doc.atlasData as { atmosphere?: string } | undefined;
    if (!atlasData?.atmosphere) issues.push('Missing atlasData.atmosphere (required for Atlas products)');
  }

  return { ready: issues.length === 0, issues };
}

type SanityClientWithAssets = ReturnType<typeof createClient> & {
  assets: {
    upload: (type: 'image' | 'file', buffer: Buffer, options?: { filename?: string }) => Promise<{ _id: string }>;
  };
}

/**
 * Fetches an image from a URL and uploads it to Sanity
 */
async function uploadImageFromUrl(
  client: SanityClientWithAssets,
  imageUrl: string
): Promise<string | undefined> {
  if (!imageUrl || !imageUrl.startsWith('http')) return undefined;

  try {
    console.log(`[Madison] Fetching image from: ${imageUrl}`);

    // Add a 10-second timeout to the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Madison] Failed to fetch image: ${response.status} ${response.statusText}`);
      return undefined;
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    console.log(`[Madison] Uploading asset to Sanity...`);

    // Upload to Sanity
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg',
    });

    console.log(`[Madison] Asset uploaded successfully: ${asset._id}`);
    return asset._id;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Madison] Image fetch timed out');
    } else {
      console.error('[Madison] Error in image upload pipeline:', error);
    }
    return undefined;
  }
}

/**
 * Main function to push a draft document to Sanity
 */
export async function pushDraft(
  data: MadisonPayload
): Promise<{ id: string; published: boolean; issues: string[] }> {
  // Initialize Sanity client with write token
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN or SANITY_WRITE_TOKEN environment variable is required');
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

  console.log(`[Madison] Initializing client for project: ${projectId}`);

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false, // Always use the API for writes
  }) as SanityClientWithAssets;

  // Generate the document's base ID. Drafts are stored as `drafts.${baseId}`;
  // publishing (see readiness check below) is just dropping that prefix.
  const baseId = uuidv4();
  const draftId = `drafts.${baseId}`;

  // Handle image upload if provided
  let mainImageAssetId: string | undefined;
  if (data.imageUrl) {
    mainImageAssetId = await uploadImageFromUrl(client, data.imageUrl);
  }

  // Build the document
  const document: Record<string, unknown> = {
    _id: draftId,
    _type: 'product',
    generationSource: 'madison-studio',
    collectionType: data.collectionType,
    internalName: data.internalName,
    title: data.title,
    slug: {
      _type: 'slug',
      current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    inStock: true,
  };

  // Add main image if uploaded
  if (mainImageAssetId) {
    document.mainImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: mainImageAssetId,
      },
    };
  }

  // Add price and volume
  if (data.price !== undefined) {
    document.price = data.price;
  }
  if (data.volume) {
    document.volume = data.volume;
  }
  if (data.productFormat) {
    document.productFormat = data.productFormat;
  }

  // Add Shopify linkage fields (optional — without these, Add-to-Cart stays
  // disabled until a human connects the product to Shopify)
  if (data.shopifyProductId) document.shopifyProductId = data.shopifyProductId;
  if (data.shopifyHandle) document.shopifyHandle = data.shopifyHandle;
  if (data.shopifyVariantId) document.shopifyVariantId = data.shopifyVariantId;
  if (data.shopifyVariant6mlId) document.shopifyVariant6mlId = data.shopifyVariant6mlId;
  if (data.shopifyVariant12mlId) document.shopifyVariant12mlId = data.shopifyVariant12mlId;
  if (data.sku) document.sku = data.sku;
  if (data.sku6ml) document.sku6ml = data.sku6ml;
  if (data.sku12ml) document.sku12ml = data.sku12ml;

  // Add notes
  if (data.notes) {
    document.notes = {
      top: data.notes.top || [],
      heart: data.notes.heart || [],
      base: data.notes.base || [],
    };
  }

  // Add collection-specific data
  if (data.collectionType === 'atlas' && data.atlasData) {
    document.atlasData = {
      atmosphere: data.atlasData.atmosphere,
      gpsCoordinates: data.atlasData.gpsCoordinates,
      travelLog: data.atlasData.travelLog
        ? markdownToBlocks(data.atlasData.travelLog)
        : undefined,
      evocationStory: toParagraphArray(data.atlasData.evocationStory),
      onSkinStory: toParagraphArray(data.atlasData.onSkinStory),
    };
  }

  if (data.collectionType === 'relic' && data.relicData) {
    document.relicData = {
      distillationYear: data.relicData.distillationYear,
      originRegion: data.relicData.originRegion,
      viscosity: data.relicData.viscosity,
      museumDescription: data.relicData.museumDescription
        ? markdownToBlocks(data.relicData.museumDescription)
        : undefined,
    };
  }

  // data.description is intentionally not persisted — there is no matching
  // `description` field on the product schema, so writing it produced an
  // orphaned value invisible in Studio and read by no query. Use
  // atlasData.evocationStory/onSkinStory or relicData.museumDescription instead.

  // Gated auto-publish: only skip the draft prefix if the document already
  // has what the live site needs to render and be purchasable. Otherwise it
  // lands as a draft exactly like before, with the reasons why in `issues`.
  let published = false;
  let issues: string[] = [];
  if (data.publish) {
    const readiness = checkPublishReadiness(document);
    issues = readiness.issues;
    if (readiness.ready) {
      document._id = baseId;
      published = true;
    }
  }

  // Create the document
  try {
    console.log(
      `[Madison] Creating product ${published ? 'as published' : 'as draft'} in Sanity...`
    );
    const result = await client.create(document as { _type: string; _id: string; [key: string]: unknown });
    console.log(`✅ [Madison] Product ${published ? 'published' : 'draft'} created: ${result._id}`);
    return { id: result._id, published, issues };
  } catch (error) {
    console.error('[Madison] Sanity creation failed:', error);
    if (typeof error === 'object' && error !== null && 'details' in error) {
      const errorWithDetails = error as { details?: unknown };
      console.error('[Madison] Failure details:', JSON.stringify(errorWithDetails.details, null, 2));
    }
    throw new Error(`Sanity creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===== JOURNAL ENTRY SUPPORT =====

interface JournalPayload {
  title: string;
  content?: string; // Markdown
  body?: string;    // Fallback if Madison Studio sends 'body'
  excerpt?: string;
  coverImageUrl?: string;
  author?: string;
  publishedAt?: string; // ISO date string
  category?: 'field-notes' | 'behind-the-blend' | 'territory-spotlight' | 'collector-archives' | string;
  territory?: 'ember' | 'petal' | 'tidal' | 'terra' | string;
  featured?: boolean;
  seoDescription?: string;
  relatedProductSlugs?: string[]; // Slugs of related products
}

/**
 * Push a journal entry draft to Sanity (from Madison Studio)
 */
export async function pushJournalEntry(data: JournalPayload): Promise<string> {
  // Initialize Sanity client with write token
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN or SANITY_WRITE_TOKEN environment variable is required');
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

  console.log(`[Madison] Initializing journal client for project: ${projectId}`);

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  }) as SanityClientWithAssets;

  // Generate draft ID
  const draftId = `drafts.${uuidv4()}`;

  // Handle cover image upload if provided
  let coverImageAssetId: string | undefined;
  if (data.coverImageUrl) {
    coverImageAssetId = await uploadImageFromUrl(client, data.coverImageUrl);
  }

  // Resolve related products by slug
  let relatedProductRefs: Array<{ _type: string; _ref: string; _key: string }> = [];
  if (data.relatedProductSlugs && data.relatedProductSlugs.length > 0) {
    const productQuery = `*[_type == "product" && slug.current in $slugs && !(_id in path("drafts.**"))]{_id, "slug": slug.current}`;
    interface ProductResult {
      _id: string;
      slug: string;
    }
    const products = await client.fetch<ProductResult[]>(productQuery, { slugs: data.relatedProductSlugs });
    relatedProductRefs = products.map((p, index: number) => ({
      _type: 'reference',
      _ref: p._id,
      _key: `ref-${index}`,
    }));
  }

  // Build the document
  const document: Record<string, unknown> = {
    _id: draftId,
    _type: 'journalEntry',
    generationSource: 'madison-studio',
    title: data.title,
    slug: {
      _type: 'slug',
      current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
    },
    content: markdownToBlocks((data.content || data.body || '') as string),
    publishedAt: data.publishedAt || new Date().toISOString(),
    featured: data.featured || false,
  };

  // Add optional fields
  if (data.excerpt) {
    document.excerpt = data.excerpt;
  }
  if (data.author) {
    document.author = data.author;
  }
  if (data.category) {
    document.category = data.category;
  }
  if (data.territory) {
    document.territory = data.territory;
  }
  if (data.seoDescription) {
    document.seoDescription = data.seoDescription;
  }
  if (relatedProductRefs.length > 0) {
    document.relatedProducts = relatedProductRefs;
  }

  // Add cover image if uploaded
  if (coverImageAssetId) {
    document.coverImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: coverImageAssetId,
      },
    };
  }

  // Create the document
  try {
    console.log(`[Madison] Creating journal draft in Sanity...`);
    const result = await client.create(document as { _type: string; _id: string; [key: string]: unknown });
    console.log(`✅ [Madison] Journal draft created: ${result._id}`);
    return result._id;
  } catch (error) {
    console.error('[Madison] Sanity journal creation failed:', error);
    if (typeof error === 'object' && error !== null && 'details' in error) {
      const errorWithDetails = error as { details?: unknown };
      console.error('[Madison] Failure details:', JSON.stringify(errorWithDetails.details, null, 2));
    }
    throw new Error(`Sanity journal creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===== FIELD JOURNAL SUPPORT (SEO-Rich Editorial Content) =====

interface FieldJournalPayload {
  title: string;
  subtitle?: string;
  content?: string; // Markdown
  body?: string;    // Fallback
  excerpt?: string;
  coverImageUrl?: string;
  author?: 'archivist' | 'quartermaster' | 'navigator' | 'correspondent';
  publishedAt?: string; // ISO date string
  category?: 'dispatch' | 'distillation' | 'material' | 'territory' | 'archive';
  expeditionData?: {
    territory?: 'tidal' | 'ember' | 'petal' | 'terra';
    locationName?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      display: string;
    };
    region?: string;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  featuredProductSlugs?: string[]; // Slugs of featured products
}

/**
 * Push a Field Journal entry draft to Sanity (from Madison Studio)
 * Creates SEO-rich editorial content with expedition data
 */
export async function pushFieldJournal(data: FieldJournalPayload): Promise<string> {
  // Initialize Sanity client with write token
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN or SANITY_WRITE_TOKEN environment variable is required');
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  }) as SanityClientWithAssets;

  // Generate draft ID
  const draftId = `drafts.${uuidv4()}`;

  // Handle cover image upload if provided
  let coverImageAssetId: string | undefined;
  if (data.coverImageUrl) {
    coverImageAssetId = await uploadImageFromUrl(client, data.coverImageUrl);
  }

  // Resolve featured products by slug
  let featuredProductRefs: Array<{ _type: string; _ref: string; _key: string }> = [];
  if (data.featuredProductSlugs && data.featuredProductSlugs.length > 0) {
    const productQuery = `*[_type == "product" && slug.current in $slugs && !(_id in path("drafts.**"))]{_id, "slug": slug.current}`;
    interface ProductResult {
      _id: string;
      slug: string;
    }
    const products = await client.fetch<ProductResult[]>(productQuery, { slugs: data.featuredProductSlugs });
    featuredProductRefs = products.map((p, index: number) => ({
      _type: 'reference',
      _ref: p._id,
      _key: `ref-${index}`,
    }));
  }

  // Build the document
  const document: Record<string, unknown> = {
    _id: draftId,
    _type: 'fieldJournal',
    generationSource: 'madison-studio',
    title: data.title,
    slug: {
      _type: 'slug',
      current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
    },
    body: markdownToBlocks((data.content || data.body || '') as string),
    publishedAt: data.publishedAt || new Date().toISOString(),
  };

  // Add optional fields
  if (data.subtitle) {
    document.subtitle = data.subtitle;
  }
  if (data.excerpt) {
    document.excerpt = data.excerpt;
  }
  if (data.author) {
    document.author = data.author;
  }
  if (data.category) {
    document.category = data.category;
  }

  // Add expedition data
  if (data.expeditionData) {
    document.expeditionData = {
      territory: data.expeditionData.territory,
      locationName: data.expeditionData.locationName,
      gpsCoordinates: data.expeditionData.gpsCoordinates,
      region: data.expeditionData.region,
      season: data.expeditionData.season,
    };
  }

  // Add SEO data
  if (data.seo) {
    document.seo = {
      metaTitle: data.seo.metaTitle,
      metaDescription: data.seo.metaDescription,
      keywords: data.seo.keywords,
    };
  }

  // Add featured products
  if (featuredProductRefs.length > 0) {
    document.featuredProducts = featuredProductRefs;
  }

  // Add cover image if uploaded
  if (coverImageAssetId) {
    document.coverImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: coverImageAssetId,
      },
    };
  }

  // Create the document
  try {
    console.log(`[Madison] Creating Field Journal draft in Sanity...`);
    const result = await client.create(document as { _type: string; _id: string; [key: string]: unknown });
    console.log(`✅ [Madison] Field Journal draft created: ${result._id}`);
    return result._id;
  } catch (error) {
    console.error('[Madison] Sanity Field Journal creation failed:', error);
    if (typeof error === 'object' && error !== null && 'details' in error) {
      const errorWithDetails = error as { details?: unknown };
      console.error('[Madison] Failure details:', JSON.stringify(errorWithDetails.details, null, 2));
    }
    throw new Error(`Sanity Field Journal creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Type exports for external use
 */
export type { MadisonPayload, JournalPayload, FieldJournalPayload };

