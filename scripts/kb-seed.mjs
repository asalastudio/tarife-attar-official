#!/usr/bin/env node

/**
 * KB Seed Script — Comprehensive Knowledge Base Seeder
 * 
 * Reads all existing Tarife Attar brand data from the codebase,
 * synthesizes it into polished KB articles via Gemini (in brand voice),
 * and publishes them to Eleanor via Convex.
 * 
 * Sources:
 *   - BRAND_BRAIN.md (brand essence, philosophy, Two Roads, territories)
 *   - ATLAS_MASTER_28.md (product catalog, pricing, notes)
 *   - Etsy-FAQ-Formatted.md (shipping, tracking, application, territories)
 *   - Return-Policy-Formatted.md (return/exchange policy)
 *   - THE_CARTOGRAPHER_NARRATIVE.md (brand story)
 *   - BRAND_AGENT_SYSTEM_PROMPT.md (voice/tone rules)
 *   - scripts/evocation-copy.mjs (scent storytelling)
 *   - scripts/onskin-copy.mjs (wear experience)
 *   - scripts/atlas-rebrand-data.mjs (product data truth)
 * 
 * Usage:
 *   node scripts/kb-seed.mjs                    (generate + preview articles)
 *   node scripts/kb-seed.mjs --publish           (generate + publish to Eleanor)
 *   node scripts/kb-seed.mjs --dry-run           (show article plan without calling Gemini)
 *   node scripts/kb-seed.mjs --category policies (only seed one category)
 * 
 * Requires:
 *   GOOGLE_GENERATIVE_AI_API_KEY
 */

import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const OUTPUT_DIR = resolve(PROJECT_ROOT, ".kb-pipeline");

const CONVEX_URL = process.env.CONVEX_URL || "https://admired-duck-737.convex.cloud";
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const BRAND_SLUG = "tarife-attar";

const args = process.argv.slice(2);
const shouldPublish = args.includes("--publish");
const dryRun = args.includes("--dry-run");
const categoryFilter = args.find((_, i, a) => a[i - 1] === "--category");

if (!GEMINI_KEY && !dryRun) {
  console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is required (or use --dry-run)");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

function readSource(filename) {
  const path = resolve(PROJECT_ROOT, filename);
  if (!existsSync(path)) {
    console.warn(`  ⚠ Source not found: ${filename}`);
    return "";
  }
  return readFileSync(path, "utf-8");
}

function truncate(text, maxLen = 6000) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "\n... [truncated]";
}

// ─────────────────────────────────────────────────────────
// Article Plan — each entry becomes one KB article
// ─────────────────────────────────────────────────────────

const ARTICLE_PLAN = [
  // ── POLICIES ──
  {
    id: "return-policy",
    title: "Returns & Exchanges",
    category: "policies",
    tags: ["returns", "exchanges", "refunds", "policy"],
    sources: ["Return-Policy-Formatted.md"],
    instructions: "Convert the raw return policy into a warm, curator-voiced KB article. Keep all factual details (30 days, unopened, etc.) but rewrite in Tarife Attar's brand voice. Do NOT use Unicode formatting — write in clean, plain text with natural paragraphs.",
  },
  {
    id: "shipping-info",
    title: "Shipping & Delivery",
    category: "policies",
    tags: ["shipping", "delivery", "tracking", "USPS", "international"],
    sources: ["Etsy-FAQ-Formatted.md"],
    instructions: "Extract all shipping information (domestic tiers, pricing, free threshold, processing times, express cutoff) and write a comprehensive shipping article. Include tracking instructions. Plain text, brand voice.",
  },
  {
    id: "product-authenticity",
    title: "Our Quality Promise",
    category: "policies",
    tags: ["authenticity", "quality", "cruelty-free", "phthalate-free", "skin-safe"],
    sources: ["BRAND_BRAIN.md"],
    instructions: "Write an article about Tarife Attar's quality commitments: phthalate-free, skin-safe, cruelty-free, small-batch, no synthetic fillers. Draw from the Non-Negotiable Values and Brand Boundaries sections. This should feel like a curator's guarantee, not marketing copy.",
  },

  // ── PRODUCT CARE ──
  {
    id: "how-to-apply",
    title: "How to Apply Perfume Oil",
    category: "product-care",
    tags: ["application", "glass wand", "pulse points", "layering", "tips"],
    sources: ["Etsy-FAQ-Formatted.md"],
    instructions: "Extract the 'How to Apply' FAQ and expand it into a detailed guide. Cover pulse points, bloom time, rubbing vs dabbing, layering across territories, and storage. Make it feel like a curator teaching a guest how to experience the archive.",
  },
  {
    id: "perfume-oil-vs-spray",
    title: "Why Perfume Oil? Understanding Concentration",
    category: "product-care",
    tags: ["perfume oil", "alcohol-free", "concentration", "longevity", "comparison"],
    sources: ["Etsy-FAQ-Formatted.md", "BRAND_BRAIN.md"],
    instructions: "Write an educational article explaining why Tarife Attar uses concentrated perfume oils instead of alcohol-based sprays. Cover: longevity, skin chemistry interaction, projection style, concentration difference (70-80% alcohol in sprays vs pure oil), and how oils develop differently on each person. Draw from the FAQ 'Why Perfume Oil?' section and Brand Brain.",
  },
  {
    id: "bottle-longevity",
    title: "How Long Does a Bottle Last?",
    category: "product-care",
    tags: ["longevity", "bottle life", "6ml", "12ml", "daily use", "value"],
    sources: ["BRAND_BRAIN.md", "Etsy-FAQ-Formatted.md"],
    instructions: "Write about how long 6ml and 12ml bottles last with daily use (3-6 months for 6ml). Explain why concentrated oils last longer than sprays by volume. Help customers understand the value proposition without using sales language.",
  },

  // ── BRAND STORY ──
  {
    id: "our-philosophy",
    title: "Scent as Destination — Our Philosophy",
    category: "brand-story",
    tags: ["philosophy", "brand story", "modern apothecary", "founding"],
    sources: ["BRAND_BRAIN.md", "THE_CARTOGRAPHER_NARRATIVE.md"],
    instructions: "Write the definitive brand story article. Cover the founding premise ('bridge the gap between mass-market and artisanal'), the 'Scent as Destination' philosophy, and the soul statement. This should read like a museum's 'About' plaque — authoritative, evocative, and grounded.",
  },
  {
    id: "two-roads",
    title: "Two Roads — The Atlas & The Relic",
    category: "brand-story",
    tags: ["atlas", "relic", "two roads", "waypoints", "specimens", "philosophy"],
    sources: ["BRAND_BRAIN.md"],
    instructions: "Explain the Two Roads philosophy in detail. Atlas = Additive/Designed (Waypoints, Field Journal, compositions capturing memories). Relic = Subtractive/Found (Specimens, The Vault, single-origin rarities preserved in time). Explain why the boundary is sacred and they never blur. Use the exact terminology: Waypoints, Specimens, Compositions, Heritage Distillations.",
  },
  {
    id: "name-change-guide",
    title: "Why Did the Names Change?",
    category: "brand-story",
    tags: ["rebrand", "atlas", "name change", "legacy names", "transition"],
    sources: ["Etsy-FAQ-Formatted.md", "ATLAS_MASTER_28.md"],
    instructions: "Write a warm, reassuring article about the rebrand. Key message: every fragrance is still here, same oils, same formulations — just renamed for the real places that inspired them. Include 8-10 example mappings (Honey Oud → SAANA, Turkish Rose → DAMASCUS, etc.). Mention the free Atlas Collection Guide.",
  },

  // ── FRAGRANCE GUIDANCE ──
  {
    id: "territories-overview",
    title: "The Four Territories — Your Sensory Map",
    category: "fragrance-guidance",
    tags: ["territories", "ember", "tidal", "petal", "terra", "scent families"],
    sources: ["Etsy-FAQ-Formatted.md", "BRAND_BRAIN.md", "ATLAS_MASTER_28.md"],
    instructions: "Write a comprehensive guide to the four territories. For each: name, essence, description, scent families, all 7 waypoints by name, and pricing. Ember (fire + resin), Tidal (water + mineral), Petal (bloom + skin), Terra (root + stone). This should feel like a map legend.",
  },
  {
    id: "ember-territory",
    title: "Ember Territory — Where Fire Meets Resin",
    category: "fragrance-guidance",
    tags: ["ember", "oud", "amber", "musk", "warm", "spiced", "territory"],
    sources: ["ATLAS_MASTER_28.md", "BRAND_BRAIN.md"],
    instructions: "Deep dive into the Ember territory. Cover its essence ('The intimacy of ancient routes'), the 7 waypoints (ADEN, SAANA, GRANADA, MALABAR, SERENGETI, BEIRUT, TARIFA) with a 1-2 sentence personality for each. Include pricing ($28/6ml, $48/12ml). Who is this territory for? What occasions?",
  },
  {
    id: "tidal-territory",
    title: "Tidal Territory — Where Water Meets Mineral",
    category: "fragrance-guidance",
    tags: ["tidal", "marine", "citrus", "fresh", "aquatic", "territory"],
    sources: ["ATLAS_MASTER_28.md", "BRAND_BRAIN.md"],
    instructions: "Deep dive into the Tidal territory. Cover its essence ('The pull of open water'), the 7 waypoints (BAHIA, BAHRAIN, BIG SUR, MEISHAN, MONACO, TANGIERS, TIGRIS) with 1-2 sentence personalities. Pricing ($30/6ml, $50/12ml). Who and when.",
  },
  {
    id: "petal-territory",
    title: "Petal Territory — Where Bloom Meets Skin",
    category: "fragrance-guidance",
    tags: ["petal", "floral", "musk", "rose", "jasmine", "territory"],
    sources: ["ATLAS_MASTER_28.md", "BRAND_BRAIN.md"],
    instructions: "Deep dive into the Petal territory. Cover its essence ('The exhale of living gardens'), the 7 waypoints (CARMEL, DAMASCUS, TOBAGO, KANDY, MANALI, MEDINA, SIWA) with 1-2 sentence personalities. Pricing ($30/6ml, $50/12ml). Who and when.",
  },
  {
    id: "terra-territory",
    title: "Terra Territory — Where Root Meets Stone",
    category: "fragrance-guidance",
    tags: ["terra", "wood", "oud", "leather", "earthy", "territory"],
    sources: ["ATLAS_MASTER_28.md", "BRAND_BRAIN.md"],
    instructions: "Deep dive into the Terra territory. Cover its essence ('The gravity of deep forests'), the 7 waypoints (ASTORIA, HAVANA, HUDSON, MARRAKESH, RIYADH, SAMARKAND, SICILY) with 1-2 sentence personalities. Pricing ($33/6ml, $55/12ml). Who and when.",
  },
  {
    id: "layering-guide",
    title: "The Art of Layering — Creating Your Signature",
    category: "fragrance-guidance",
    tags: ["layering", "blending", "signature scent", "combinations", "tips"],
    sources: ["Etsy-FAQ-Formatted.md", "BRAND_BRAIN.md"],
    instructions: "Write a layering guide. Explain how perfume oils layer beautifully because they don't have alcohol competing. Suggest cross-territory combinations (e.g., Petal + Ember for warmth with bloom, Terra + Tidal for depth with freshness). 3-4 specific pairing suggestions. Encourage experimentation.",
  },

  // ── PRODUCT INFO ──
  {
    id: "sizes-pricing",
    title: "Sizes, Pricing & What's Included",
    category: "product-info",
    tags: ["pricing", "sizes", "6ml", "12ml", "glass wand", "packaging"],
    sources: ["ATLAS_MASTER_28.md", "BRAND_BRAIN.md"],
    instructions: "Write a clear guide to product sizes and pricing. Cover: 6ml and 12ml formats, glass wand applicator, territory-based pricing (Ember $28/$48, Tidal $30/$50, Petal $30/$50, Terra $33/$55), what's in the box, and why pricing varies by territory (ingredient complexity and sourcing).",
  },
  {
    id: "ingredients-sourcing",
    title: "Ingredients & Sourcing Transparency",
    category: "product-info",
    tags: ["ingredients", "sourcing", "natural", "transparency", "phthalate-free"],
    sources: ["BRAND_BRAIN.md"],
    instructions: "Write about Tarife Attar's commitment to ingredient transparency. Cover: phthalate-free formulations, skin-safe, cruelty-free, small-batch production, and how ingredients are sourced. Reference the Radical Transparency value. Mention the fragrance pyramid (top/heart/base). Do NOT make specific claims about 'all natural' unless the source material explicitly says so.",
  },
  {
    id: "glass-wand-applicator",
    title: "The Glass Wand Applicator",
    category: "product-info",
    tags: ["glass wand", "applicator", "roll-on", "application method"],
    sources: ["Etsy-FAQ-Formatted.md"],
    instructions: "Write about the glass wand applicator — what it is, how to use it, why it's preferred over roll-on for concentrated oils (precision, hygiene, ritual), and that roll-on is also available. Frame it as an intentional design choice, not an inconvenience.",
  },

  // ── ORDERS ──
  {
    id: "order-tracking",
    title: "Tracking Your Order",
    category: "orders",
    tags: ["tracking", "order status", "USPS", "shipping notification"],
    sources: ["Etsy-FAQ-Formatted.md"],
    instructions: "Extract the order tracking FAQ and rewrite as a clean KB article. Cover: shipping notification emails, how to check status in your account, status meanings (Not Shipped, Shipped, In Transit), and expected delivery windows.",
  },
  {
    id: "processing-times",
    title: "Order Processing & Fulfillment",
    category: "orders",
    tags: ["processing", "fulfillment", "hand-packed", "small-batch", "timeline"],
    sources: ["Etsy-FAQ-Formatted.md", "BRAND_BRAIN.md"],
    instructions: "Write about the order fulfillment process. Orders are hand-packed and shipped within 1-2 business days. Mention the small-batch, artisanal nature of fulfillment. Cover the express shipping cutoff (1 PM Pacific). Frame it as care and craftsmanship, not a limitation.",
  },

  // ── THE RELIC ──
  {
    id: "relic-collection",
    title: "The Relic — Rare Materials from The Vault",
    category: "product-info",
    tags: ["relic", "vault", "oud", "attar", "rare", "specimens", "heritage"],
    sources: ["BRAND_BRAIN.md"],
    instructions: "Write about The Relic collection. Cover: the 'Found/Subtractive' philosophy, what Specimens are (pure ouds, aged resins, traditional attars), the types (Pure Oud, Rare Attar, Aged Resin, Pure Distillate, Traditional Attar), pricing range ($45-$450), volumes (3ml-10ml), and the heritage distillation sub-type. Explain GPS coordinates mean provenance (exact harvest site). Include the viscosity scale concept. This should feel like entering a museum vault.",
  },
];

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  TARIFE ATTAR — KNOWLEDGE BASE SEEDER");
  console.log(`  Mode: ${dryRun ? "DRY RUN" : shouldPublish ? "GENERATE + PUBLISH" : "GENERATE + PREVIEW"}`);
  if (categoryFilter) console.log(`  Category filter: ${categoryFilter}`);
  console.log("═══════════════════════════════════════════════════════\n");

  let plan = ARTICLE_PLAN;
  if (categoryFilter) {
    plan = plan.filter((a) => a.category === categoryFilter);
  }

  console.log(`→ ${plan.length} articles planned across ${[...new Set(plan.map(a => a.category))].length} categories\n`);

  if (dryRun) {
    const grouped = {};
    for (const article of plan) {
      if (!grouped[article.category]) grouped[article.category] = [];
      grouped[article.category].push(article);
    }
    for (const [cat, articles] of Object.entries(grouped)) {
      console.log(`  ── ${cat.toUpperCase()} ──`);
      for (const a of articles) {
        console.log(`    • ${a.title}`);
        console.log(`      Sources: ${a.sources.join(", ")}`);
        console.log(`      Tags: ${a.tags.join(", ")}\n`);
      }
    }
    console.log("  Run without --dry-run to generate articles.\n");
    process.exit(0);
  }

  // 1) Load all source material
  console.log("→ Loading source material...");
  const sourceCache = {};
  const allSources = [...new Set(plan.flatMap((a) => a.sources))];
  for (const src of allSources) {
    sourceCache[src] = readSource(src);
    const size = sourceCache[src].length;
    console.log(`  ${size > 0 ? "✓" : "✗"} ${src} (${(size / 1024).toFixed(1)}KB)`);
  }
  console.log();

  // 2) Resolve brand
  console.log("→ Resolving brand in Convex...");
  let brandId = null;
  let constitution = null;
  try {
    const brand = await convex.query("brands:getBrandBySlug", { slug: BRAND_SLUG });
    brandId = brand?._id;
    if (brandId) {
      console.log(`  ✓ Brand: ${brand.name || BRAND_SLUG} (${brandId})`);
      constitution = await convex.query("constitution:getByBrand", { brandId }).catch(() => null);
      console.log(`  ✓ Constitution: ${constitution ? "loaded" : "not found"}`);
    } else {
      console.log("  ⚠ Brand not found — articles will be saved locally only");
    }
  } catch (err) {
    console.log(`  ⚠ Convex unavailable — articles will be saved locally only`);
  }
  console.log();

  // 3) Build voice context from constitution + brand brain
  const brandBrain = truncate(sourceCache["BRAND_BRAIN.md"] || "", 3000);
  const voiceContext = `
BRAND VOICE (You must write in this voice):
${constitution?.agentPersonality || "Grounded, Articulate, Warm — like a museum curator speaking to a valued guest."}
${constitution?.agentInstructions || ""}

NEVER USE: ${(constitution?.doNotDo || ["buy now", "purchase", "shop", "on sale", "discount", "deal", "limited time", "hurry", "smell", "nice", "strong", "cheap", "good"]).join(", ")}
INSTEAD USE: acquire, discover, explore, experience, encounter, consider

BRAND IDENTITY:
${brandBrain.slice(0, 2000)}
`;

  // 4) Generate articles
  console.log("→ Generating articles with Gemini...\n");
  const genai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  const generated = [];

  for (let i = 0; i < plan.length; i++) {
    const article = plan[i];
    console.log(`  [${i + 1}/${plan.length}] "${article.title}" (${article.category})...`);

    const sourceMaterial = article.sources
      .map((src) => truncate(sourceCache[src] || "", 5000))
      .join("\n\n---\n\n");

    const prompt = `You are writing a knowledge base article for Tarife Attär's Help Desk.

${voiceContext}

ARTICLE TO WRITE:
- Title: ${article.title}
- Category: ${article.category}
- Tags: ${article.tags.join(", ")}

SPECIFIC INSTRUCTIONS:
${article.instructions}

SOURCE MATERIAL (use this as your factual foundation):
${sourceMaterial}

WRITING RULES:
1. Write in Tarife Attar's brand voice: grounded, articulate, warm — like a museum curator
2. Be factually precise — only state what the source material supports
3. Use plain text with natural paragraphs — NO Unicode formatting, NO markdown headers, NO bullet lists with special characters
4. Use simple bullet points (with dashes) only where genuinely helpful for lists
5. Keep it 200-500 words — comprehensive but scannable
6. The article will be read by customers on the Help Desk page, so write directly to them
7. NEVER use salesy language or urgency tactics

TWO ROADS VOCABULARY (CRITICAL — NEVER MIX):
- Atlas products are "waypoints," "perfume oils," "compositions," or "fragrances" — NEVER call them "specimens" or "liquid specimens"
- Only Relic products (not yet available) are called "specimens," "materials," or "heritage distillations"
- The word "specimen" must NEVER appear in any article about Atlas products, application, shipping, returns, territories, or general brand content
- Use "perfume oil" or "fragrance" when referring to what the customer receives

RESPOND ONLY with this JSON (no markdown, no code fences):
{
  "title": "${article.title}",
  "slug": "${article.id}",
  "category": "${article.category}",
  "excerpt": "One-sentence summary under 160 characters",
  "content": "Full article content here",
  "tags": ${JSON.stringify(article.tags)}
}`;

    try {
      const result = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const responseText = result.text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

      generated.push({
        ...parsed,
        planId: article.id,
        source: "auto-extracted",
      });

      console.log(`    ✓ Generated (${parsed.content?.length || 0} chars)\n`);
    } catch (err) {
      console.log(`    ❌ Failed: ${err.message}\n`);
      generated.push({
        title: article.title,
        slug: article.id,
        category: article.category,
        tags: article.tags,
        content: "",
        error: err.message,
        planId: article.id,
        source: "auto-extracted",
      });
    }

    // Brief pause to avoid rate limits
    if (i < plan.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 5) Save locally
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = resolve(OUTPUT_DIR, "kb-seed-articles.json");
  writeFileSync(outputPath, JSON.stringify({
    seededAt: new Date().toISOString(),
    brandSlug: BRAND_SLUG,
    totalPlanned: plan.length,
    totalGenerated: generated.filter((a) => a.content).length,
    articles: generated,
  }, null, 2));
  console.log(`→ Saved to ${outputPath}\n`);

  // 6) Publish if requested
  if (shouldPublish && brandId) {
    const toPublish = generated.filter((a) => a.content && !a.error);
    console.log(`→ Publishing ${toPublish.length} articles to Eleanor...\n`);

    let published = 0;
    let failed = 0;

    for (const article of toPublish) {
      try {
        const result = await convex.mutation("knowledge:createArticle", {
          brandId,
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || "",
          category: article.category,
          tags: article.tags || [],
          source: "auto-extracted",
        });

        const articleId = result?._id || result;

        // Publish immediately
        await convex.mutation("knowledge:publishArticle", {
          articleId,
        });

        console.log(`  ✓ Published: "${article.title}" (${articleId})`);
        published++;
      } catch (err) {
        console.log(`  ❌ Failed: "${article.title}" — ${err.message}`);
        failed++;
      }
    }

    console.log(`\n  Published: ${published} | Failed: ${failed}\n`);
  } else if (shouldPublish && !brandId) {
    console.log("  ⚠ Cannot publish — brand not found in Convex\n");
  }

  // Final summary
  const successful = generated.filter((a) => a.content && !a.error);
  const byCategory = {};
  for (const a of successful) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("  SEED COMPLETE");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Total planned:     ${plan.length}`);
  console.log(`  Generated:         ${successful.length}`);
  console.log(`  Failed:            ${generated.length - successful.length}`);
  console.log();
  console.log("  BY CATEGORY:");
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`    ${cat}: ${count} articles`);
  }

  if (!shouldPublish) {
    console.log(`\n  → Preview articles: ${outputPath}`);
    console.log(`  → To publish:  node scripts/kb-seed.mjs --publish\n`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
