/**
 * Atlas Collection — Final 28 Waypoints
 *
 * Single source of truth for the Tarife Attar Atlas Collection.
 * 28 waypoints = 28 letters of the Arabic alphabet.
 * Four territories, 7 oils each.
 *
 * Source of truth: ATLAS_MASTER_28.md (March 18, 2026)
 *
 * Used by: migration scripts, redirect generation, Shopify CSV, Sanity sync.
 */

import { EVOCATION_COPY } from './evocation-copy.mjs';

// ============================================================================
// EMBER TERRITORY (7) — Warm · Resinous · Amber
// "Spice. Warmth. The intimacy of ancient routes."
// $28 (6 mL) / $48 (12 mL)
// ============================================================================
export const EMBER_PRODUCTS = [
  {
    atlasName: 'ADEN',
    legacyName: 'Oud Fire',
    slug: 'aden',
    scentNotes: 'Warm oud, fire-roasted amber',
    territory: 'ember',
    mapPin: 'Aden, Yemen',
    lat: 12.7797,
    long: 45.0365,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'SAANA',
    legacyName: 'Honey Oud',
    slug: 'saana',
    scentNotes: 'Honey, oud, desert spice',
    territory: 'ember',
    mapPin: "Sana'a, Yemen",
    lat: 15.3694,
    long: 44.1910,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'GRANADA',
    legacyName: 'Granada Amber',
    slug: 'granada',
    scentNotes: 'Spanish amber, Moorish garden',
    territory: 'ember',
    mapPin: 'Albaicín, Granada, Spain',
    lat: 37.1773,
    long: -3.5986,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MALABAR',
    legacyName: 'Vanilla Sands',
    slug: 'malabar',
    scentNotes: 'Warm vanilla, golden amber, benzoin',
    territory: 'ember',
    mapPin: 'Malabar Coast, India',
    lat: 11.2588,
    long: 75.7804,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'SERENGETI',
    legacyName: 'Black Musk',
    slug: 'serengeti',
    scentNotes: 'Dark musk, ancient resin, deep gravity',
    territory: 'ember',
    mapPin: 'Serengeti, Tanzania',
    lat: -2.3333,
    long: 34.8333,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'BEIRUT',
    legacyName: null,
    slug: 'beirut',
    scentNotes: 'Blood mandarin, cinnamon, leather',
    territory: 'ember',
    mapPin: 'Beirut, Lebanon',
    lat: 33.8938,
    long: 35.5018,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: 'New waypoint — replaces ETHIOPIA',
  },
  {
    atlasName: 'TARIFA',
    legacyName: 'Teeb Musk',
    slug: 'tarifa',
    scentNotes: 'White flowers, jasmine, powdery musk',
    territory: 'ember',
    mapPin: 'Tarifa, Spain',
    lat: 36.0143,
    long: -5.6044,
    price6ml: 28,
    price12ml: 48,
    evocationCopy: null,
    notes: 'Where the Atlas map begins',
  },
];

// ============================================================================
// TIDAL TERRITORY (7) — Fresh · Aquatic · Clean
// "Salt. Mist. The pull of open water."
// $30 (6 mL) / $50 (12 mL)
// ============================================================================
export const TIDAL_PRODUCTS = [
  {
    atlasName: 'BAHIA',
    legacyName: 'Coconut Jasmine',
    slug: 'bahia',
    scentNotes: 'Brazilian coast, jasmine, warm coconut',
    territory: 'tidal',
    mapPin: 'Salvador, Bahia, Brazil',
    lat: -12.9714,
    long: -38.5014,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'BAHRAIN',
    legacyName: 'Blue Oud',
    slug: 'bahrain',
    scentNotes: "Pearl diver's musk, gulf breeze",
    territory: 'tidal',
    mapPin: 'Bahrain Pearl Diving Coast',
    lat: 26.2041,
    long: 50.5515,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'BIG SUR',
    legacyName: 'Del Mar',
    slug: 'big-sur',
    scentNotes: 'Pacific coast, salt mist, wild cliffs',
    territory: 'tidal',
    mapPin: 'Big Sur, California',
    lat: 36.2704,
    long: -121.8081,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MEISHAN',
    legacyName: 'China Rain',
    slug: 'meishan',
    scentNotes: 'Rain-washed tea terraces, white lily',
    territory: 'tidal',
    mapPin: 'Meishan, Sichuan, China',
    lat: 30.0422,
    long: 103.8318,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MONACO',
    legacyName: 'Dubai Musk',
    slug: 'monaco',
    scentNotes: 'Mediterranean luxury, coastal elegance',
    territory: 'tidal',
    mapPin: 'Monaco',
    lat: 43.7384,
    long: 7.4246,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'TANGIERS',
    legacyName: 'Regatta',
    slug: 'tangiers',
    scentNotes: 'Bergamot, vervain, matcha tea, musk',
    territory: 'tidal',
    mapPin: 'Tangier, Morocco',
    lat: 35.7595,
    long: -5.8340,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'TIGRIS',
    legacyName: null,
    slug: 'tigris',
    scentNotes: 'Ancient river, grapefruit, ginger, ambrette',
    territory: 'tidal',
    mapPin: 'Tigris River, Iraq',
    lat: 33.3152,
    long: 44.3661,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: 'New waypoint',
  },
];

// ============================================================================
// PETAL TERRITORY (7) — Floral · Musky · Soft
// "Bloom. Herb. The exhale of living gardens."
// $30 (6 mL) / $50 (12 mL)
// ============================================================================
export const PETAL_PRODUCTS = [
  {
    atlasName: 'CARMEL',
    legacyName: 'White Amber',
    slug: 'carmel',
    scentNotes: 'Soft amber, warm skin scent',
    territory: 'petal',
    mapPin: 'Carmel-by-the-Sea, California',
    lat: 36.5552,
    long: -121.9233,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'DAMASCUS',
    legacyName: 'Turkish Rose',
    slug: 'damascus',
    scentNotes: 'Damask rose, Turkish rosewater',
    territory: 'petal',
    mapPin: 'Isparta, Turkey',
    lat: 37.7556,
    long: 30.5566,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'TOBAGO',
    legacyName: 'Arabian Jasmine',
    slug: 'tobago',
    scentNotes: 'Pure jasmine sambac, tropical bloom',
    territory: 'petal',
    mapPin: 'Tobago',
    lat: 11.1889,
    long: -60.6317,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'KANDY',
    legacyName: 'Peach Memoir',
    slug: 'kandy',
    scentNotes: 'Soft peach, velvety musk',
    territory: 'petal',
    mapPin: 'Kandy, Sri Lanka',
    lat: 7.2906,
    long: 80.6337,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MANALI',
    legacyName: 'Himalayan Musk',
    slug: 'manali',
    scentNotes: 'High-altitude musk, clean skin',
    territory: 'petal',
    mapPin: 'Manali, India',
    lat: 32.2396,
    long: 77.1887,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MEDINA',
    legacyName: 'Musk Tahara',
    slug: 'medina',
    scentNotes: 'Traditional purification musk',
    territory: 'petal',
    mapPin: 'Medina, Saudi Arabia',
    lat: 24.5247,
    long: 39.5692,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'SIWA',
    legacyName: 'White Egyptian Musk',
    slug: 'siwa',
    scentNotes: 'Egyptian oasis, white musk',
    territory: 'petal',
    mapPin: 'Siwa Oasis, Egypt',
    lat: 29.2032,
    long: 25.5195,
    price6ml: 30,
    price12ml: 50,
    evocationCopy: null,
    notes: null,
  },
];

// ============================================================================
// TERRA TERRITORY (7) — Woody · Earthy · Grounded
// "Wood. Oud. The gravity of deep forests."
// $33 (6 mL) / $55 (12 mL)
// ============================================================================
export const TERRA_PRODUCTS = [
  {
    atlasName: 'ASTORIA',
    legacyName: 'Pacific Moss',
    slug: 'astoria',
    scentNotes: 'Mossy forest, fir needle, ancient cedar',
    territory: 'terra',
    mapPin: 'Astoria, Oregon',
    lat: 46.1879,
    long: -123.8313,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'HAVANA',
    legacyName: 'Oud & Tobacco',
    slug: 'havana',
    scentNotes: 'Dark leaf, cured wood, smoky',
    territory: 'terra',
    mapPin: 'Habana Vieja, Cuba',
    lat: 23.1136,
    long: -82.3666,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'HUDSON',
    legacyName: 'Spanish Sandalwood',
    slug: 'hudson',
    scentNotes: 'Cardamom, sandalwood, leather',
    territory: 'terra',
    mapPin: 'Hudson, New York',
    lat: 42.2529,
    long: -73.7910,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'MARRAKESH',
    legacyName: null,
    slug: 'marrakesh',
    scentNotes: 'Moroccan spice market, warm cedar, leather',
    territory: 'terra',
    mapPin: "Jemaa el-Fnaa, Morocco",
    lat: 31.6295,
    long: -7.9811,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'RIYADH',
    legacyName: 'Black Oud',
    slug: 'riyadh',
    scentNotes: 'Arabian oud, noble wood',
    territory: 'terra',
    mapPin: 'Riyadh Oud Souks, Saudi Arabia',
    lat: 24.7136,
    long: 46.6753,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'SAMARKAND',
    legacyName: 'Oud Aura',
    slug: 'samarkand',
    scentNotes: 'Royal oud, ceremonial wood',
    territory: 'terra',
    mapPin: 'Samarkand, Uzbekistan',
    lat: 39.6542,
    long: 66.9597,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
  {
    atlasName: 'SICILY',
    legacyName: 'Sicilian Oudh',
    slug: 'sicily',
    scentNotes: 'Citrus grove, Mediterranean oud',
    territory: 'terra',
    mapPin: 'Mount Etna, Sicily',
    lat: 37.5994,
    long: 14.0154,
    price6ml: 33,
    price12ml: 55,
    evocationCopy: null,
    notes: null,
  },
];

// ============================================================================
// RELIC COLLECTION — Premium/pure materials (priced individually)
// ============================================================================
export const RELIC_PRODUCTS = [
  {
    atlasName: 'MAJMUA',
    legacyName: null,
    slug: 'majmua',
    scentNotes: 'Classic woody/floral/musky blend',
    type: 'Traditional Attar',
    notes: 'Traditional attar',
  },
  {
    atlasName: 'MUKHALLAT EMIRATES',
    legacyName: null,
    slug: 'mukhallat-emirates',
    scentNotes: 'Rose, saffron, oud, amber',
    type: 'Traditional Mukhallat',
    notes: 'Traditional mukhallat',
  },
];

// ============================================================================
// ARCHIVE (Etsy section: "The Archive")
// ============================================================================
export const ARCHIVE_PRODUCTS = [
  { name: 'CAIRO', legacyName: 'Superior Egyptian Musk', reason: 'Archived', sanityId: 'product-ancient' },
  { name: 'KALAHARI', legacyName: 'Black Ambergris', reason: 'Archived', sanityId: 'product-onyx' },
  { name: 'ETHIOPIA', legacyName: 'Frankincense & Myrrh', reason: 'Archived — replaced by BEIRUT' },
];

// ============================================================================
// ALL ATLAS PRODUCTS (Combined — 28 total, with evocation copy attached)
// ============================================================================

function attachEvocation(products) {
  return products.map((p) => ({
    ...p,
    evocationCopy: EVOCATION_COPY[p.slug] || p.evocationCopy,
  }));
}

export const ALL_ATLAS_PRODUCTS = [
  ...attachEvocation(EMBER_PRODUCTS),
  ...attachEvocation(TIDAL_PRODUCTS),
  ...attachEvocation(PETAL_PRODUCTS),
  ...attachEvocation(TERRA_PRODUCTS),
];

// ============================================================================
// SLUG REDIRECT MAP
// Maps old evocative slugs, intermediate names, and legacy Shopify slugs
// to final ATLAS_MASTER_28 geographic slugs.
// Used by next.config.js redirects and migration scripts.
// ============================================================================
export const URL_REDIRECTS = [
  // Old evocative Atlas slugs → final geographic slugs
  { from: '/product/beloved', to: '/product/granada' },
  { from: '/product/caravan', to: '/product/saana' },
  { from: '/product/close', to: '/product/tarifa' },
  { from: '/product/nizwa', to: '/product/tarifa' },
  { from: '/product/rogue', to: '/product/aden' },
  { from: '/product/dune', to: '/product/malabar' },
  { from: '/product/devotion', to: '/product/beirut' },
  { from: '/product/obsidian', to: '/product/serengeti' },
  { from: '/product/clarity', to: '/product/manali' },
  { from: '/product/dubai', to: '/product/monaco' },
  { from: '/product/fathom', to: '/product/bahrain' },
  { from: '/product/delmar', to: '/product/big-sur' },
  { from: '/product/jasmine', to: '/product/tobago' },
  { from: '/product/cherish', to: '/product/kandy' },
  { from: '/product/tahara', to: '/product/medina' },
  { from: '/product/ritual', to: '/product/siwa' },
  { from: '/product/regalia', to: '/product/samarkand' },

  // Intermediate geographic names → final names
  { from: '/product/petra', to: '/product/saana' },
  { from: '/product/zanzibar', to: '/product/malabar' },
  { from: '/product/oman', to: '/product/tarifa' },
  { from: '/product/ethiopia', to: '/product/beirut' },
  { from: '/product/kyoto', to: '/product/meishan' },
  { from: '/product/grasse', to: '/product/tobago' },
  { from: '/product/tulum', to: '/product/hudson' },
  { from: '/product/amer', to: '/product/carmel' },
  { from: '/product/regatta', to: '/product/tangiers' },

  // Dropped/archived products → /atlas
  { from: '/product/ancient', to: '/atlas' },
  { from: '/product/cairo', to: '/atlas' },
  { from: '/product/onyx', to: '/atlas' },
  { from: '/product/kalahari', to: '/atlas' },

  // Legacy Shopify product slugs → final names
  { from: '/product/granada-amber', to: '/product/granada' },
  { from: '/product/honey-oudh', to: '/product/saana' },
  { from: '/product/vanilla-sands', to: '/product/malabar' },
  { from: '/product/teeb-musk', to: '/product/tarifa' },
  { from: '/product/oud-fire', to: '/product/aden' },
  { from: '/product/dubai-musk', to: '/product/monaco' },
  { from: '/product/himalayan-musk', to: '/product/manali' },
  { from: '/product/frankincense-myrrh', to: '/product/beirut' },
  { from: '/product/frankincense-and-myrrh', to: '/product/beirut' },
  { from: '/product/black-musk', to: '/product/serengeti' },
  { from: '/product/cairo-musk', to: '/atlas' },
  { from: '/product/sicilian-oudh', to: '/product/sicily' },
  { from: '/product/oud-tobacco', to: '/product/havana' },
  { from: '/product/oud-and-tobacco', to: '/product/havana' },
  { from: '/product/oud-aura', to: '/product/samarkand' },
  { from: '/product/black-ambergris', to: '/atlas' },
  { from: '/product/arabian-jasmine', to: '/product/tobago' },
  { from: '/product/turkish-rose', to: '/product/damascus' },
  { from: '/product/white-egyptian-musk', to: '/product/siwa' },
  { from: '/product/musk-tahara', to: '/product/medina' },
  { from: '/product/peach-memoir', to: '/product/kandy' },
  { from: '/product/del-mare', to: '/product/big-sur' },
  { from: '/product/blue-oudh', to: '/product/bahrain' },
  { from: '/product/china-rain', to: '/product/meishan' },
  { from: '/product/coconut-jasmine', to: '/product/bahia' },
  { from: '/product/black-oud', to: '/product/riyadh' },
  { from: '/product/spanish-sandalwood', to: '/product/hudson' },
  { from: '/product/white-amber', to: '/product/carmel' },

  // Shopify /products/ paths (plural) — same mappings
  { from: '/products/granada-amber', to: '/product/granada' },
  { from: '/products/honey-oudh', to: '/product/saana' },
  { from: '/products/vanilla-sands', to: '/product/malabar' },
  { from: '/products/dune', to: '/product/malabar' },
  { from: '/products/teeb-musk', to: '/product/tarifa' },
  { from: '/products/oud-fire', to: '/product/aden' },
  { from: '/products/dubai-musk', to: '/product/monaco' },
  { from: '/products/himalayan-musk', to: '/product/manali' },
  { from: '/products/frankincense-myrrh', to: '/product/beirut' },
  { from: '/products/black-musk', to: '/product/serengeti' },
  { from: '/products/cairo-musk', to: '/atlas' },
  { from: '/products/sicilian-oudh', to: '/product/sicily' },
  { from: '/products/marrakesh', to: '/product/marrakesh' },
  { from: '/products/oud-tobacco', to: '/product/havana' },
  { from: '/products/oud-aura', to: '/product/samarkand' },
  { from: '/products/black-ambergris', to: '/atlas' },
  { from: '/products/arabian-jasmine', to: '/product/tobago' },
  { from: '/products/turkish-rose', to: '/product/damascus' },
  { from: '/products/white-egyptian-musk', to: '/product/siwa' },
  { from: '/products/musk-tahara', to: '/product/medina' },
  { from: '/products/peach-memoir', to: '/product/kandy' },
  { from: '/products/del-mare', to: '/product/big-sur' },
  { from: '/products/blue-oudh', to: '/product/bahrain' },
  { from: '/products/china-rain', to: '/product/meishan' },
  { from: '/products/coconut-jasmine', to: '/product/bahia' },
  { from: '/products/regatta', to: '/product/tangiers' },
  { from: '/products/black-oud', to: '/product/riyadh' },
  { from: '/products/spanish-sandalwood', to: '/product/hudson' },
  { from: '/products/white-amber', to: '/product/carmel' },
];

// ============================================================================
// TERRITORY METADATA
// ============================================================================
export const TERRITORIES = {
  ember: {
    name: 'Ember',
    tagline: 'The Intimacy of Ancient Routes',
    description: 'Spice. Warmth. The intimacy of ancient routes.',
    scentFamilies: 'Oriental · Amber · Incense · Resin · Honey',
    price6ml: 28,
    price12ml: 48,
    color: '#d4854a',
  },
  tidal: {
    name: 'Tidal',
    tagline: 'The Pull of Open Water',
    description: 'Salt. Mist. The pull of open water.',
    scentFamilies: 'Marine · Citrus · Green · Rain · Musk',
    price6ml: 30,
    price12ml: 50,
    color: '#5b8fa8',
  },
  petal: {
    name: 'Petal',
    tagline: 'The Exhale of Living Gardens',
    description: 'Bloom. Herb. The exhale of living gardens.',
    scentFamilies: 'Rose · Jasmine · White Musk · Peach · Skin Scent',
    price6ml: 30,
    price12ml: 50,
    color: '#c4788a',
  },
  terra: {
    name: 'Terra',
    tagline: 'The Gravity of Deep Forests',
    description: 'Wood. Oud. The gravity of deep forests.',
    scentFamilies: 'Oud · Leather · Sandalwood · Cedar · Tobacco',
    price6ml: 33,
    price12ml: 55,
    color: '#6b7f5e',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

export function findProductByLegacyName(legacyName) {
  const normalized = legacyName.toLowerCase().trim();
  return ALL_ATLAS_PRODUCTS.find(
    (p) => p.legacyName?.toLowerCase().trim() === normalized
  );
}

export function findProductBySlug(slug) {
  return ALL_ATLAS_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByTerritory(territory) {
  return ALL_ATLAS_PRODUCTS.filter((p) => p.territory === territory);
}

// ============================================================================
// COLLECTION SUMMARY
// ============================================================================
export const COLLECTION_SUMMARY = {
  brandTagline: 'Four Territories. 28 Waypoints. One Atlas.',
  atlas: {
    total: ALL_ATLAS_PRODUCTS.length,
    ember: EMBER_PRODUCTS.length,
    tidal: TIDAL_PRODUCTS.length,
    petal: PETAL_PRODUCTS.length,
    terra: TERRA_PRODUCTS.length,
  },
  relic: {
    total: RELIC_PRODUCTS.length,
  },
  archive: {
    total: ARCHIVE_PRODUCTS.length,
  },
};

if (typeof process !== 'undefined' && process.argv?.[1]?.includes('atlas-rebrand-data')) {
  console.log('Atlas Collection — Final 28 Waypoints');
  console.log(`"${COLLECTION_SUMMARY.brandTagline}"\n`);
  console.log(`Total Atlas Products: ${COLLECTION_SUMMARY.atlas.total}`);
  console.log(`  Ember: ${COLLECTION_SUMMARY.atlas.ember}`);
  console.log(`  Tidal: ${COLLECTION_SUMMARY.atlas.tidal}`);
  console.log(`  Petal: ${COLLECTION_SUMMARY.atlas.petal}`);
  console.log(`  Terra: ${COLLECTION_SUMMARY.atlas.terra}`);
  console.log(`\nRelic Products: ${COLLECTION_SUMMARY.relic.total}`);
  console.log(`Archive: ${COLLECTION_SUMMARY.archive.total}`);
}
