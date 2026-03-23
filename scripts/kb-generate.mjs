#!/usr/bin/env node

/**
 * KB Generation Pipeline — Step 3 of 3
 * 
 * Reads kb-gaps.json (from kb-analyze), generates article drafts with Gemini,
 * evaluates them (importing kb-evaluate), and optionally publishes to Convex.
 * 
 * Usage:
 *   node scripts/kb-generate.mjs                 (generate + evaluate drafts)
 *   node scripts/kb-generate.mjs --publish        (also publish approved articles to Eleanor)
 *   node scripts/kb-generate.mjs --publish-all    (publish approved + needs-review articles)
 *   node scripts/kb-generate.mjs --dry-run        (show what would be generated, don't call Gemini)
 * 
 * Requires:
 *   GOOGLE_GENERATIVE_AI_API_KEY
 *   CONVEX_DEPLOY_KEY (only if --publish is used)
 */

import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { evaluateArticle } from "./kb-evaluate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PIPELINE_DIR = resolve(__dirname, "../.kb-pipeline");

const CONVEX_URL = process.env.CONVEX_URL || "https://admired-duck-737.convex.cloud";
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const BRAND_SLUG = "tarife-attar";

const args = process.argv.slice(2);
const shouldPublish = args.includes("--publish") || args.includes("--publish-all");
const publishAll = args.includes("--publish-all");
const dryRun = args.includes("--dry-run");

if (!GEMINI_KEY) {
  console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);
const genai = new GoogleGenAI({ apiKey: GEMINI_KEY });

async function generateArticle(gap, constitution) {
  const constitutionContext = constitution
    ? `
BRAND VOICE RULES:
- Mission: ${constitution.missionStatement || "N/A"}
- Personality: ${constitution.agentPersonality || "N/A"}
- Tone: Grounded, Articulate, Warm — like a knowledgeable museum curator
- NEVER use: ${(constitution.doNotDo || []).join("; ")}
- NEVER use: "buy", "purchase", "shop", "on sale", "discount", "deal", marketing jargon
- Instead use: "acquire", "discover", "explore", "experience", "encounter", "consider"

POLICIES:
${(constitution.policies || []).map((p) => `${p.topic}: ${p.content}`).join("\n")}
`
    : "";

  const prompt = `You are writing a knowledge base article for Tarife Attär, a luxury perfume oil brand.

${constitutionContext}

ARTICLE REQUEST:
Title: ${gap.suggestedTitle}
Category: ${gap.category}
Reason needed: ${gap.reason}
Sample customer questions this should answer:
${(gap.sampleQuestions || []).map((q) => `- "${q}"`).join("\n")}

WRITING GUIDELINES:
1. Write in Tarife Attar's brand voice: grounded, articulate, warm — like a museum curator speaking to a valued guest
2. Be factually precise — no vague marketing promises
3. Structure with a clear opening, detailed body, and concise conclusion
4. Use the Sensory Lexicon where appropriate (architectural terms, emotional states, material references)
5. Keep it 150-400 words — comprehensive but not bloated
6. If referencing policies, match them exactly to the constitution
7. Include practical, actionable information

RESPOND ONLY with this JSON (no markdown):
{
  "title": "Final article title",
  "slug": "url-friendly-slug",
  "category": "${gap.category}",
  "excerpt": "One-sentence summary (max 160 chars)",
  "content": "Full article content",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const result = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const responseText = result.text.trim();

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    return null;
  }
}

async function publishArticle(article, brandId) {
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

    // If it was auto-publish quality, publish it immediately
    if (article.verdict === "auto-publish") {
      await convex.mutation("knowledge:publishArticle", {
        articleId: result._id || result,
      });
    }

    return { success: true, id: result._id || result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  KB GENERATION PIPELINE");
  console.log(`  Mode: ${dryRun ? "DRY RUN" : shouldPublish ? (publishAll ? "GENERATE + PUBLISH ALL" : "GENERATE + PUBLISH APPROVED") : "GENERATE + EVALUATE"}`);
  console.log("═══════════════════════════════════════════\n");

  // 1) Load gaps
  const gapsPath = resolve(PIPELINE_DIR, "kb-gaps.json");
  if (!existsSync(gapsPath)) {
    console.error("❌ kb-gaps.json not found.");
    console.log("  Run  node scripts/kb-analyze.mjs  first.");
    process.exit(1);
  }

  const gapsData = JSON.parse(readFileSync(gapsPath, "utf-8"));
  const gaps = gapsData.gaps || gapsData.qualifiedGaps || [];

  if (gaps.length === 0) {
    console.log("No gaps to generate articles for. Knowledge base is up to date!");
    process.exit(0);
  }

  console.log(`→ Found ${gaps.length} gaps to generate articles for\n`);

  if (dryRun) {
    console.log("  DRY RUN — Would generate articles for:\n");
    gaps.forEach((g, i) => {
      console.log(`    ${i + 1}. [${g.priority}] ${g.suggestedTitle} (${g.category})`);
      console.log(`       Reason: ${g.reason}`);
      console.log(`       Coverage: ${g.existingCoverage}\n`);
    });
    process.exit(0);
  }

  // 2) Fetch brand context
  console.log("→ Fetching brand context...");
  const brand = await convex.query("brands:getBrandBySlug", { slug: BRAND_SLUG });
  const brandId = brand?._id;

  if (!brandId) {
    console.error(`❌ Brand "${BRAND_SLUG}" not found`);
    process.exit(1);
  }

  const [constitution, existingArticles] = await Promise.all([
    convex.query("constitution:getByBrand", { brandId }).catch(() => null),
    convex.query("knowledge:listPublished", { brandId }).catch(() => []),
  ]);

  console.log(`  ✓ Constitution: ${constitution ? "loaded" : "not found"}`);
  console.log(`  ✓ Existing articles: ${(existingArticles || []).length}\n`);

  // 3) Generate articles
  console.log("→ Generating articles with Gemini...\n");
  const drafts = [];

  for (let i = 0; i < gaps.length; i++) {
    const gap = gaps[i];
    console.log(`  [${i + 1}/${gaps.length}] Generating: "${gap.suggestedTitle}"...`);

    const article = await generateArticle(gap, constitution);
    if (article) {
      article.sourceGap = gap;
      drafts.push(article);
      console.log(`    ✓ Generated: "${article.title}" (${article.content?.length || 0} chars)\n`);
    } else {
      console.log(`    ❌ Failed to generate\n`);
    }
  }

  // Save drafts
  if (!existsSync(PIPELINE_DIR)) mkdirSync(PIPELINE_DIR, { recursive: true });
  writeFileSync(
    resolve(PIPELINE_DIR, "kb-drafts.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), drafts }, null, 2)
  );

  // 4) Evaluate each draft
  console.log("→ Evaluating drafts...\n");
  const evaluated = [];

  for (const draft of drafts) {
    console.log(`  Evaluating: "${draft.title}"...`);
    const scored = await evaluateArticle(draft, { constitution, existingArticles, genai });
    evaluated.push(scored);

    const emoji = scored.verdict === "auto-publish" ? "✅" : scored.verdict === "needs-review" ? "⚠️" : "❌";
    console.log(`    ${emoji} Score: ${scored.weightedScore}/100 → ${scored.verdict.toUpperCase()}\n`);
  }

  // Save evaluated results
  const results = {
    autoPublish: evaluated.filter((a) => a.verdict === "auto-publish"),
    needsReview: evaluated.filter((a) => a.verdict === "needs-review"),
    rejected: evaluated.filter((a) => a.verdict === "rejected"),
  };

  writeFileSync(
    resolve(PIPELINE_DIR, "kb-evaluated.json"),
    JSON.stringify({
      evaluatedAt: new Date().toISOString(),
      summary: {
        total: evaluated.length,
        autoPublish: results.autoPublish.length,
        needsReview: results.needsReview.length,
        rejected: results.rejected.length,
      },
      results,
    }, null, 2)
  );

  // 5) Publish if requested
  if (shouldPublish) {
    const toPublish = publishAll
      ? [...results.autoPublish, ...results.needsReview]
      : results.autoPublish;

    if (toPublish.length === 0) {
      console.log("  No articles qualified for publishing.\n");
    } else {
      console.log(`→ Publishing ${toPublish.length} articles to Eleanor...\n`);

      for (const article of toPublish) {
        console.log(`  Publishing: "${article.title}"...`);
        const result = await publishArticle(article, brandId);
        if (result.success) {
          console.log(`    ✓ Published (${result.id})\n`);
        } else {
          console.log(`    ❌ Failed: ${result.error}\n`);
        }
      }
    }
  }

  // Final summary
  console.log("═══════════════════════════════════════════");
  console.log("  GENERATION COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  Articles generated: ${drafts.length}`);
  console.log(`  ✅ Auto-publish:   ${results.autoPublish.length}`);
  console.log(`  ⚠️  Needs review:   ${results.needsReview.length}`);
  console.log(`  ❌ Rejected:       ${results.rejected.length}`);

  if (!shouldPublish && results.autoPublish.length > 0) {
    console.log(`\n  → To publish approved articles, run:`);
    console.log(`    node scripts/kb-generate.mjs --publish\n`);
  }

  console.log(`\n  Pipeline output: ${PIPELINE_DIR}/\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
