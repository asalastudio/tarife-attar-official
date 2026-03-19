/**
 * Sync Shopify Products to Atlas Collection — v2 (March 2026 Rebrand)
 *
 * Connects the 28 Atlas waypoints in Sanity to their Shopify product/variant IDs
 * so customers can add products to cart and purchase.
 *
 * Uses the NEW waypoint names (post-rebrand): SAANA, MALABAR, TARIFA, etc.
 *
 * Usage:
 *   node scripts/sync-shopify-atlas-v2.mjs --dry-run    # Preview
 *   node scripts/sync-shopify-atlas-v2.mjs              # Execute
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually (no dotenv dependency)
function loadEnv(filepath) {
  try {
    const content = readFileSync(filepath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* file not found, skip */ }
}

loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

// Shopify handle → Sanity slug for all 28 Atlas waypoints
const SHOPIFY_HANDLE_TO_SLUG = {
  // EMBER (7)
  'aden': 'aden',
  'saana': 'saana',
  'granada': 'granada',
  'malabar': 'malabar',
  'serengeti': 'serengeti',
  'beirut': 'beirut',
  'tarifa': 'tarifa',

  // TIDAL (7)
  'bahia': 'bahia',
  'bahrain': 'bahrain',
  'big-sur': 'big-sur',
  'meishan': 'meishan',
  'monaco': 'monaco',
  'tangiers': 'tangiers',
  'tigris': 'tigris',

  // PETAL (7)
  'carmel': 'carmel',
  'damascus': 'damascus',
  'tobago': 'tobago',
  'kandy': 'kandy',
  'manali': 'manali',
  'medina': 'medina',
  'siwa': 'siwa',

  // TERRA (7)
  'astoria': 'astoria',
  'havana': 'havana',
  'hudson': 'hudson',
  'marrakesh': 'marrakesh',
  'riyadh': 'riyadh',
  'samarkand': 'samarkand',
  'sicily': 'sicily',
};

async function main() {
  console.log('\n  SHOPIFY → ATLAS SYNC v2 (28 Waypoints)\n');
  console.log(isDryRun ? '  MODE: DRY RUN\n' : '  MODE: LIVE\n');

  if (!client.config().token) {
    console.error('  ERROR: No SANITY_WRITE_TOKEN found. Set it in .env or .env.local');
    process.exit(1);
  }

  // 1. Fetch all Atlas products from Sanity
  console.log('  Fetching Atlas products from Sanity...');
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))]{
      _id, title, "slug": slug.current,
      shopifyProductId, shopifyVariantId, shopifyVariant6mlId, shopifyVariant12mlId,
      inStock
    }
  `);
  console.log(`  Found ${atlasProducts.length} Atlas products in Sanity\n`);

  const atlasBySlug = {};
  atlasProducts.forEach((p) => { atlasBySlug[p.slug] = p; });

  // 2. Fetch Shopify products via Admin API
  console.log('  Fetching products from Shopify...');
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
  const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  const res = await fetch(`https://${shopifyDomain}/admin/api/2024-01/products.json?limit=250&status=active`, {
    headers: { 'X-Shopify-Access-Token': shopifyToken },
  });
  const { products: shopifyProducts } = await res.json();
  console.log(`  Found ${shopifyProducts.length} active Shopify products\n`);

  // 3. Match and sync
  const toLink = [];
  const alreadyLinked = [];
  const notMatched = [];
  const missingInSanity = [];

  for (const shopify of shopifyProducts) {
    const slug = SHOPIFY_HANDLE_TO_SLUG[shopify.handle];
    if (!slug) continue; // Not an Atlas product

    const sanityProduct = atlasBySlug[slug];
    if (!sanityProduct) {
      missingInSanity.push({ handle: shopify.handle, title: shopify.title, slug });
      continue;
    }

    const variants = shopify.variants || [];
    const variant6ml = variants.find((v) => v.title === '6ml');
    const variant12ml = variants.find((v) => v.title === '12ml');

    if (!variant6ml || !variant12ml) {
      console.log(`  [!] ${shopify.title}: Missing 6ml or 12ml variant`);
      continue;
    }

    const gid = `gid://shopify/Product/${shopify.id}`;
    const gid6ml = `gid://shopify/ProductVariant/${variant6ml.id}`;
    const gid12ml = `gid://shopify/ProductVariant/${variant12ml.id}`;

    // Check if already fully linked
    if (
      sanityProduct.shopifyProductId === gid &&
      sanityProduct.shopifyVariant6mlId === gid6ml &&
      sanityProduct.shopifyVariant12mlId === gid12ml &&
      sanityProduct.shopifyVariantId === gid6ml
    ) {
      alreadyLinked.push({ title: shopify.title, slug });
      continue;
    }

    toLink.push({
      sanityId: sanityProduct._id,
      title: shopify.title,
      slug,
      currentInStock: sanityProduct.inStock,
      updates: {
        shopifyProductId: gid,
        shopifyVariantId: gid6ml, // Default variant = 6ml
        shopifyVariant6mlId: gid6ml,
        shopifyVariant12mlId: gid12ml,
        shopifyHandle: shopify.handle,
        inStock: true, // These are all active in Shopify
      },
    });
  }

  // 4. Report
  console.log('=' .repeat(65));
  console.log(`\n  TO LINK: ${toLink.length}`);
  for (const item of toLink) {
    console.log(`    ${item.title} → ${item.slug} (currently inStock: ${item.currentInStock})`);
  }

  console.log(`\n  ALREADY LINKED: ${alreadyLinked.length}`);
  for (const item of alreadyLinked) {
    console.log(`    ${item.title} → ${item.slug}`);
  }

  if (missingInSanity.length > 0) {
    console.log(`\n  MISSING IN SANITY: ${missingInSanity.length}`);
    for (const item of missingInSanity) {
      console.log(`    ${item.title} (handle: ${item.handle}) → expected slug: ${item.slug}`);
    }
  }

  // 5. Apply updates
  if (!isDryRun && toLink.length > 0) {
    console.log('\n  APPLYING UPDATES...\n');
    let success = 0;
    let failed = 0;

    for (const item of toLink) {
      try {
        await client.patch(item.sanityId).set(item.updates).commit();
        console.log(`    [OK] ${item.title} → ${item.slug}`);
        success++;
      } catch (error) {
        console.log(`    [X] ${item.title} → ${error.message}`);
        failed++;
      }
    }

    console.log(`\n  DONE: ${success} linked, ${failed} failed\n`);
  } else if (isDryRun) {
    console.log('\n  DRY RUN COMPLETE. Run without --dry-run to apply.\n');
  } else {
    console.log('\n  Nothing to update. All products are connected.\n');
  }
}

main().catch(console.error);
