/**
 * Import Loox Reviews CSV into Sanity
 *
 * Maps legacy Shopify product handles to current Atlas/Relic/Archive slugs
 * and creates review documents in Sanity.
 *
 * Usage:
 *   node scripts/import-reviews.mjs --dry-run    # Preview
 *   node scripts/import-reviews.mjs              # Execute
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple CSV parser (handles quoted fields with commas and newlines)
function parseCSV(content) {
  const rows = [];
  let headers = null;
  let current = '';
  let inQuotes = false;
  let fields = [];

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else if (ch === '\n' && !inQuotes) {
      fields.push(current);
      current = '';
      if (!headers) {
        headers = fields;
      } else if (fields.length === headers.length) {
        const row = {};
        headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
        rows.push(row);
      }
      fields = [];
    } else if (ch === '\r' && !inQuotes) {
      // skip \r
    } else {
      current += ch;
    }
  }

  // Handle last row
  if (current || fields.length > 0) {
    fields.push(current);
    if (headers && fields.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
      rows.push(row);
    }
  }

  return rows;
}

// Load env
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
  } catch { /* skip */ }
}

loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const sanity = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

// CSV file path
const CSV_PATH = resolve(process.cwd(), 'reviews.N1-5kmLv2c (2).csv');

// ============================================================
// HANDLE MAPPING: Legacy Shopify handle → Sanity product slug
// ============================================================

const HANDLE_TO_SLUG = {
  // ATLAS — EMBER TERRITORY
  'honey-oudh': 'saana',
  'granada-amber': 'granada',
  'vanilla-sands': 'malabar',
  'black-musk': 'serengeti',
  'oud-fire': 'aden',
  'kyoto-musk': 'tarifa',
  // frank-myrrh was Ethiopia (now BEIRUT), but scent changed — map to store-level

  // ATLAS — TIDAL TERRITORY
  'coconut-jasmine': 'bahia',
  'blue-oud-elixir': 'bahrain',
  'del-mare-mediterranean-perfume-oil-by-tarife-attar-oceanic-aquatic-scent-powerful-sillage-24hr-longevity-unisex-fragrance-6ml': 'big-sur',
  'china-rain': 'meishan',

  // ATLAS — PETAL TERRITORY
  'amber-white': 'carmel',
  'turkish-rose': 'damascus',
  'arabian-jasmine': 'tobago',
  'peach-memoir': 'kandy',
  'himalayan-musk': 'manali',
  'musk-tahara': 'medina',
  'white-egyptian-musk': 'siwa',
  'white-egyptian-musk-perfume-oil-by-tarife-attar-premium-attar-oil-clean-minimalistic-soft-florals-alcohol-free-vegan': 'siwa',

  // ATLAS — TERRA TERRITORY
  'oud-tobacco': 'havana',
  'marrakesh': 'marrakesh',
  'black-oudh': 'riyadh',
  'oudh-aura': 'samarkand',
  'silcilian-oudh': 'sicily',

  // New Atlas handles (post-rebrand, 1:1)
  'aden': 'aden',
  'saana': 'saana',
  'granada': 'granada',
  'malabar': 'malabar',
  'serengeti': 'serengeti',
  'beirut': 'beirut',
  'tarifa': 'tarifa',
  'bahia': 'bahia',
  'bahrain': 'bahrain',
  'big-sur': 'big-sur',
  'meishan': 'meishan',
  'monaco': 'monaco',
  'tangiers': 'tangiers',
  'tigris': 'tigris',
  'carmel': 'carmel',
  'damascus': 'damascus',
  'tobago': 'tobago',
  'kandy': 'kandy',
  'manali': 'manali',
  'medina': 'medina',
  'siwa': 'siwa',
  'astoria': 'astoria',
  'havana': 'havana',
  'hudson': 'hudson',
  'riyadh': 'riyadh',
  'samarkand': 'samarkand',
  'sicily': 'sicily',

  // RELIC products
  'kashmiri-saffron': 'kashmiri-saffron',
  'mysore-sandalwood': 'mysore-sandalwood',
  'wild-vetiver': 'wild-vetiver',
  'royal-green-frankincense': 'royal-green-frankincense',
  'hojari-frankincense-myrrh': 'hojari-frankincense-myrrh',

  // Active standalone products (not Atlas/Relic but still in store)
  'egyptian-musk': 'egyptian-musk',
  'indian-patchouli': 'indian-patchouli',
  'sandalwood-rose': 'sandalwood-rose',
  'red-musk': 'red-musk',
  'attar-kush': 'attar-kush',
  'floral-dew': 'floral-dew',
  'musk-gazelle': 'musk-gazelle',
  'mukhallat-al-shifa': 'mukhallat-al-shifa',
  'majmua': 'majmua',
  'oudh-lavender': 'oudh-lavender',
  'taif-rose-by-tarife-attar-premium-perfume-oil-fresh-bright-clean-rose-alcohol-free-vegan': 'taif-rose',
};

// Friendly product names for display (legacy handle → what the customer bought)
const HANDLE_TO_DISPLAY_NAME = {
  'honey-oudh': 'Honey Oudh',
  'granada-amber': 'Granada Amber',
  'vanilla-sands': 'Vanilla Sands',
  'black-musk': 'Black Musk',
  'oud-fire': 'Oudh Fire',
  'kyoto-musk': 'Teeb Musk',
  'coconut-jasmine': 'Coconut Jasmine',
  'blue-oud-elixir': 'Blue Oud Elixir',
  'china-rain': 'China Rain',
  'amber-white': 'White Amber',
  'turkish-rose': 'Turkish Rose',
  'arabian-jasmine': 'Arabian Jasmine',
  'peach-memoir': 'Peach Memoir',
  'himalayan-musk': 'Himalayan Musk',
  'musk-tahara': 'Musk Tahara',
  'white-egyptian-musk': 'White Egyptian Musk',
  'oud-tobacco': 'Oud & Tobacco',
  'marrakesh': 'Marrakesh',
  'black-oudh': 'Black Oudh',
  'oudh-aura': 'Oudh Aura',
  'silcilian-oudh': 'Sicilian Oudh',
  'egyptian-musk': 'Egyptian Musk',
  'frank-myrrh': 'Frankincense & Myrrh',
  'indian-patchouli': 'Indonesian Patchouli',
  'alhambra': 'Alhambra',
  'lily-of-the-valley': 'Lily of the Valley',
  'sandalwood-rose': 'Sandalwood Rose',
  'kashmiri-saffron': 'Kashmiri Saffron',
  'mysore-sandalwood': 'Aged Mysore Sandalwood',
  'wild-vetiver': 'Wild Vetiver (Ruh Khus)',
  'royal-green-frankincense': 'Royal Green Frankincense',
  'red-musk': 'Red Musk',
  'attar-kush': 'Kush',
  'musk-gazelle': 'Musk Gazelle',
  'floral-dew': 'Floral Dew',
};

const BATCH_SIZE = 50;

async function main() {
  console.log('\n  IMPORT LOOX REVIEWS → SANITY\n');
  console.log(isDryRun ? '  MODE: DRY RUN\n' : '  MODE: LIVE\n');

  if (!sanity.config().token) {
    console.error('  ERROR: No SANITY_WRITE_TOKEN found.');
    process.exit(1);
  }

  // 1. Read CSV
  let csvPath = CSV_PATH;
  // Also check Downloads folder
  if (!readFileSync(csvPath, { flag: 'r', encoding: null })) {
    csvPath = resolve(process.env.HOME, 'Downloads', 'reviews.N1-5kmLv2c (2).csv');
  }

  const csvContent = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  console.log(`  CSV loaded: ${rows.length} total reviews`);

  // 2. Filter active reviews only
  const activeReviews = rows.filter((r) => r.status === 'Active');
  console.log(`  Active reviews: ${activeReviews.length}\n`);

  // 3. Fetch all Sanity products to get _id by slug
  console.log('  Fetching Sanity products for reference linking...');
  const products = await sanity.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))]{
      _id, title, "slug": slug.current
    }
  `);
  const productBySlug = {};
  products.forEach((p) => { productBySlug[p.slug] = p; });
  console.log(`  Found ${products.length} products in Sanity\n`);

  // 4. Check for existing reviews (dedup by looxId)
  const existingIds = await sanity.fetch(`*[_type == "review" && defined(looxId)].looxId`);
  const existingSet = new Set(existingIds);
  console.log(`  Existing reviews in Sanity: ${existingIds.length}`);

  // 5. Build review documents
  const toCreate = [];
  let linked = 0;
  let unlinked = 0;
  let skippedDup = 0;

  for (const row of activeReviews) {
    if (existingSet.has(row.id)) {
      skippedDup++;
      continue;
    }

    const handle = row.handle;
    const slug = HANDLE_TO_SLUG[handle];
    const sanityProduct = slug ? productBySlug[slug] : null;

    const displayName = HANDLE_TO_DISPLAY_NAME[handle] || handle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const doc = {
      _type: 'review',
      _id: `review-${row.id}`,
      reviewerName: row.nickname || row.full_name || 'Anonymous',
      rating: parseInt(row.rating, 10),
      body: row.review || '',
      date: row.date || new Date().toISOString(),
      productHandle: handle,
      productNameAtTime: displayName,
      verified: row.verified_purchase === 'true',
      status: 'published',
      looxId: row.id,
    };

    if (row.img) {
      doc.photoUrl = row.img.startsWith('http') ? row.img : `https:${row.img}`;
    }

    if (row.reply) {
      doc.reply = row.reply;
    }

    if (sanityProduct) {
      doc.product = { _type: 'reference', _ref: sanityProduct._id };
      linked++;
    } else {
      unlinked++;
    }

    toCreate.push(doc);
  }

  console.log(`\n  Reviews to import: ${toCreate.length}`);
  console.log(`    Linked to products: ${linked}`);
  console.log(`    Store-level (no product match): ${unlinked}`);
  console.log(`    Skipped (already imported): ${skippedDup}`);

  if (isDryRun) {
    console.log('\n  DRY RUN COMPLETE. Run without --dry-run to import.\n');

    // Show sample
    console.log('  Sample reviews:');
    for (const doc of toCreate.slice(0, 5)) {
      console.log(`    ${'★'.repeat(doc.rating)} ${doc.reviewerName} → ${doc.productNameAtTime} ${doc.product ? '(LINKED)' : '(store-level)'}`);
      console.log(`      "${(doc.body || '').slice(0, 80)}..."\n`);
    }
    return;
  }

  // 6. Batch create in Sanity
  console.log('\n  IMPORTING...\n');
  let created = 0;
  let failed = 0;

  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE);
    const transaction = sanity.transaction();

    for (const doc of batch) {
      transaction.createOrReplace(doc);
    }

    try {
      await transaction.commit();
      created += batch.length;
      const pct = Math.round((created / toCreate.length) * 100);
      console.log(`    [${pct}%] ${created}/${toCreate.length} imported`);
    } catch (err) {
      console.error(`    [X] Batch failed at ${i}: ${err.message}`);
      // Fall back to individual creates
      for (const doc of batch) {
        try {
          await sanity.createOrReplace(doc);
          created++;
        } catch (e) {
          failed++;
          console.error(`    [X] ${doc.reviewerName}: ${e.message}`);
        }
      }
    }
  }

  console.log(`\n  DONE: ${created} imported, ${failed} failed`);
  console.log(`  Total reviews in Sanity: ${existingIds.length + created}\n`);
}

main().catch(console.error);
