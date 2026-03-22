/**
 * Sync Shopify Products to Atlas Collection — Final 28 Waypoints
 *
 * Links Shopify product data (IDs, variant IDs) to Atlas Collection products
 * so they can be added to cart and purchased.
 *
 * Usage:
 *   node scripts/sync-shopify-to-atlas.mjs --dry-run    # Preview
 *   node scripts/sync-shopify-to-atlas.mjs              # Execute
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

// Shopify title → Atlas slug (final 28 geographic waypoints)
const SHOPIFY_TO_ATLAS_MAP = {
  // EMBER (7)
  'Oudh Fire': 'aden',
  'Oud Fire': 'aden',
  'Frankincense & Myrrh': 'ethiopia',
  'Granada Amber': 'granada',
  'Teeb Musk': 'oman',
  'Honey Oudh': 'petra',
  'Black Musk': 'serengeti',
  'Vanilla Sands': 'zanzibar',

  // TIDAL (7)
  'Coconut Jasmine': 'bahia',
  'Blue Oud Elixir': 'bahrain',
  'Blue Oud': 'bahrain',
  'Del Mare': 'big-sur',
  'China Rain': 'kyoto',
  'Dubai Musk': 'tangiers',

  // PETAL (7)
  'White Amber': 'amer',
  'Turkish Rose': 'damascus',
  'Arabian Jasmine': 'grasse',
  'Peach Memoir': 'kandy',
  'Himalayan Musk': 'manali',
  'Musk Tahara': 'medina',
  'White Egyptian Musk': 'siwa',

  // TERRA (7)
  'Oud & Tobacco': 'havana',
  'Marrakesh': 'marrakesh',
  'Black Oudh': 'riyadh',
  'Black Oud': 'riyadh',
  'Oudh Aura': 'samarkand',
  'Oud Aura': 'samarkand',
  'Sicilian Oudh': 'sicily',
  'Spanish Sandalwood': 'tulum',

  // Already-migrated title matches
  'ADEN': 'aden',
  'ETHIOPIA': 'ethiopia',
  'GRANADA': 'granada',
  'OMAN': 'oman',
  'NIZWA': 'oman',
  'PETRA': 'petra',
  'SERENGETI': 'serengeti',
  'ZANZIBAR': 'zanzibar',
  'BAHIA': 'bahia',
  'BAHRAIN': 'bahrain',
  'BIG SUR': 'big-sur',
  'KYOTO': 'kyoto',
  'MONACO': 'monaco',
  'TANGIERS': 'tangiers',
  'TIGRIS': 'tigris',
  'AMER': 'amer',
  'DAMASCUS': 'damascus',
  'GRASSE': 'grasse',
  'KANDY': 'kandy',
  'MANALI': 'manali',
  'MEDINA': 'medina',
  'SIWA': 'siwa',
  'ASTORIA': 'astoria',
  'HAVANA': 'havana',
  'MARRAKESH': 'marrakesh',
  'RIYADH': 'riyadh',
  'SAMARKAND': 'samarkand',
  'SICILY': 'sicily',
  'TULUM': 'tulum',
};

const RELIC_PRODUCTS = [
  'Kashmiri Saffron',
  'Mukhallat Emirates',
  'Majmua Attar',
  'Hojari Frankincense & Yemeni Myrrh',
  'Royal Green Frankincense',
  'Aged Mysore Sandalwood',
  'Wild Vetiver (Ruh Khus)',
];

const SPECIAL_PRODUCTS = [
  'Elegant Queen Collection-10-Piece Luxury Set',
  'Exalted King Collection- 10-Piece Luxury Fragrance Gift Set [Limited Availability]',
  'Silk Road Discovery Set',
  '25/6ml -Tarife Attär Chest',
  'TARIFE ATTAR GIFT CARD',
  'Hojari Frankincense Essential Oil',
];

// Dropped from Atlas — these should NOT be synced
const DROPPED_ATLAS_SLUGS = ['ancient', 'cairo', 'regatta', 'onyx'];

async function main() {
  console.log('\n  SHOPIFY -> ATLAS SYNC (Final 28)\n');
  console.log(isDryRun ? '  DRY RUN MODE\n' : '  LIVE MODE\n');

  console.log('  Fetching Shopify products...');
  const shopifyProducts = await client.fetch(`
    *[_type == "product" && defined(store.id)]{
      _id,
      "shopifyTitle": store.title,
      "shopifyId": store.id,
      "shopifyGid": store.gid,
      "status": store.status,
      "priceRange": store.priceRange,
      "variants": store.variants[]->{ 
        _id, "title": store.title, "price": store.price, "gid": store.gid, "sku": store.sku
      }
    }
  `);
  console.log(`  Found ${shopifyProducts.length} Shopify products\n`);

  console.log('  Fetching Atlas Collection products...');
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas"]{
      _id, title, legacyName, "slug": slug.current,
      shopifyProductId, shopifyVariantId, shopifyVariant6mlId, shopifyVariant12mlId
    }
  `);
  console.log(`  Found ${atlasProducts.length} Atlas products\n`);

  const atlasBySlug = {};
  atlasProducts.forEach((p) => { atlasBySlug[p.slug] = p; });

  const linked = [];
  const alreadyLinked = [];
  const notMapped = [];
  const relicList = [];
  const specialList = [];

  for (const shopify of shopifyProducts) {
    const title = shopify.shopifyTitle;

    if (RELIC_PRODUCTS.includes(title)) { relicList.push(shopify); continue; }
    if (SPECIAL_PRODUCTS.includes(title)) { specialList.push(shopify); continue; }

    const atlasSlug = SHOPIFY_TO_ATLAS_MAP[title];

    if (atlasSlug) {
      if (DROPPED_ATLAS_SLUGS.includes(atlasSlug)) continue;

      const atlasProduct = atlasBySlug[atlasSlug];
      if (!atlasProduct) {
        console.log(`  [!] Atlas product not found for slug: ${atlasSlug} (Shopify: "${title}")`);
        continue;
      }

      if (atlasProduct.shopifyProductId && atlasProduct.shopifyVariant6mlId && atlasProduct.shopifyVariant12mlId) {
        alreadyLinked.push({ shopify, atlas: atlasProduct });
        continue;
      }

      const variants = shopify.variants || [];
      const variant6ml = variants.find((v) => v.title === '6ml' || v.title?.includes('6'));
      const variant12ml = variants.find((v) => v.title === '12ml' || v.title?.includes('12'));
      const defaultVariant = variant6ml || variants[0];

      linked.push({
        shopify,
        atlas: atlasProduct,
        updates: {
          shopifyProductId: shopify.shopifyGid,
          shopifyVariantId: defaultVariant?.gid,
          shopifyVariant6mlId: variant6ml?.gid,
          shopifyVariant12mlId: variant12ml?.gid,
        },
      });
    } else {
      notMapped.push(shopify);
    }
  }

  console.log('='.repeat(65));
  console.log(`\n  TO LINK: ${linked.length}`);
  for (const item of linked) {
    console.log(`    ${item.shopify.shopifyTitle} -> ${item.atlas.title} (${item.atlas.slug})`);
  }

  console.log(`\n  ALREADY LINKED: ${alreadyLinked.length}`);
  for (const item of alreadyLinked) {
    console.log(`    ${item.shopify.shopifyTitle} -> ${item.atlas.title}`);
  }

  console.log(`\n  RELIC: ${relicList.length} | SPECIAL: ${specialList.length} | UNMAPPED: ${notMapped.length}`);
  if (notMapped.length > 0) {
    console.log('  Unmapped:');
    for (const p of notMapped) console.log(`    - ${p.shopifyTitle}`);
  }

  if (!isDryRun && linked.length > 0) {
    console.log('\n  APPLYING UPDATES...\n');
    for (const item of linked) {
      try {
        const updateData = { shopifyProductId: item.updates.shopifyProductId, shopifyVariantId: item.updates.shopifyVariantId };
        if (item.updates.shopifyVariant6mlId) updateData.shopifyVariant6mlId = item.updates.shopifyVariant6mlId;
        if (item.updates.shopifyVariant12mlId) updateData.shopifyVariant12mlId = item.updates.shopifyVariant12mlId;
        await client.patch(item.atlas._id).set(updateData).commit();
        console.log(`    [OK] ${item.atlas.title}`);
      } catch (error) {
        console.log(`    [X] ${item.atlas.title} - ${error.message}`);
      }
    }
    console.log('\n  Sync complete!');
  } else if (isDryRun) {
    console.log('\n  DRY RUN COMPLETE — run without --dry-run to apply.');
  }
}

main().catch(console.error);
