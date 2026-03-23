#!/usr/bin/env node

/**
 * KB Evaluation Pipeline — Step 2 of 3
 * 
 * Scores auto-generated articles against a rubric:
 *   - Relevance (25%) — Does it answer a real, recurring customer question?
 *   - Brand Alignment (25%) — Does it match Tarife Attar's tone?
 *   - Accuracy (25%) — Are facts correct?
 *   - Uniqueness (15%) — Not already covered?
 *   - Clarity (10%) — Well-structured and concise?
 * 
 * Thresholds:
 *   ≥ 80 → auto-publish
 *   60-79 → flagged for human review
 *   < 60 → rejected
 * 
 * Can be run standalone or imported by kb-generate.mjs
 * 
 * Usage:
 *   node scripts/kb-evaluate.mjs              (evaluates all drafts in .kb-pipeline/kb-drafts.json)
 *   node scripts/kb-evaluate.mjs --file path  (evaluates a specific file)
 * 
 * Requires:
 *   GOOGLE_GENERATIVE_AI_API_KEY
 */

import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PIPELINE_DIR = resolve(__dirname, "../.kb-pipeline");

const CONVEX_URL = process.env.CONVEX_URL || "https://admired-duck-737.convex.cloud";
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const BRAND_SLUG = "tarife-attar";

const THRESHOLDS = {
  AUTO_PUBLISH: 80,
  HUMAN_REVIEW: 60,
};

const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Evaluate a single article draft against the rubric.
 * Returns a scored result with verdict.
 */
export async function evaluateArticle(article, { constitution, existingArticles, genai }) {

  const existingTitles = (existingArticles || [])
    .map((a) => `- [${a.category}] ${a.title}`)
    .join("\n");

  const constitutionContext = constitution
    ? `
BRAND CONSTITUTION:
- Mission: ${constitution.missionStatement || "N/A"}
- Personality: ${constitution.agentPersonality || "N/A"}
- Instructions: ${constitution.agentInstructions || "N/A"}
- Never do: ${(constitution.doNotDo || []).join("; ")}
`
    : "";

  const evaluationPrompt = `You are a strict quality evaluator for Tarife Attär's knowledge base.
Score this auto-generated article on 5 criteria. Be honest and critical.

${constitutionContext}

EXISTING KB ARTICLES (check for overlap):
${existingTitles || "(none)"}

ARTICLE TO EVALUATE:
Title: ${article.title}
Category: ${article.category}
Content:
${article.content}

SCORING RUBRIC (score each 0-100):

1. RELEVANCE (25% weight): Does this answer a real, recurring customer question?
   - 90-100: Directly addresses a top customer concern
   - 70-89: Relevant but somewhat niche
   - 50-69: Tangentially relevant
   - Below 50: Not useful to customers

2. BRAND_ALIGNMENT (25% weight): Does the tone match Tarife Attar's voice?
   - Must be: Grounded, Articulate, Warm — like a museum curator
   - Must NOT use: "buy", "purchase", "shop", "sale", "discount", "deal", marketing jargon
   - Must use: evocative, precise language; architectural and sensory terms

3. ACCURACY (25% weight): Are all facts, policies, and product details correct?
   - Cross-reference against the constitution policies
   - Flag any claims that can't be verified

4. UNIQUENESS (15% weight): Is this topic already covered?
   - 90-100: Completely new topic
   - 60-89: Related to existing but adds new value
   - Below 60: Duplicate or near-duplicate

5. CLARITY (10% weight): Is it well-structured, concise, and easy to understand?

RESPOND ONLY with this JSON (no markdown):
{
  "scores": {
    "relevance": { "score": 85, "reasoning": "..." },
    "brandAlignment": { "score": 90, "reasoning": "..." },
    "accuracy": { "score": 75, "reasoning": "..." },
    "uniqueness": { "score": 95, "reasoning": "..." },
    "clarity": { "score": 88, "reasoning": "..." }
  },
  "overallNotes": "Brief summary of strengths and weaknesses",
  "suggestedEdits": ["specific edit 1", "specific edit 2"]
}`;

  const result = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: evaluationPrompt,
  });
  const responseText = result.text.trim();

  let evaluation;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    return {
      ...article,
      evaluation: null,
      error: "Failed to parse evaluation",
      rawResponse: responseText,
      verdict: "rejected",
      weightedScore: 0,
    };
  }

  const weights = {
    relevance: 0.25,
    brandAlignment: 0.25,
    accuracy: 0.25,
    uniqueness: 0.15,
    clarity: 0.10,
  };

  const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (evaluation.scores?.[key]?.score || 0) * weight;
  }, 0);

  let verdict;
  if (weightedScore >= THRESHOLDS.AUTO_PUBLISH) {
    verdict = "auto-publish";
  } else if (weightedScore >= THRESHOLDS.HUMAN_REVIEW) {
    verdict = "needs-review";
  } else {
    verdict = "rejected";
  }

  return {
    ...article,
    evaluation,
    weightedScore: Math.round(weightedScore * 10) / 10,
    verdict,
  };
}

async function main() {
  if (!GEMINI_KEY) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is required");
    process.exit(1);
  }

  const genai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  const args = process.argv.slice(2);
  const customFile = args.find((_, i, a) => a[i - 1] === "--file");
  const inputPath = customFile || resolve(PIPELINE_DIR, "kb-drafts.json");

  if (!existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.log("  Run  node scripts/kb-generate.mjs  first to create drafts.");
    process.exit(1);
  }

  console.log("═══════════════════════════════════════════");
  console.log("  KB EVALUATION PIPELINE");
  console.log("═══════════════════════════════════════════\n");

  const draftsData = JSON.parse(readFileSync(inputPath, "utf-8"));
  const drafts = draftsData.drafts || draftsData;

  if (!Array.isArray(drafts) || drafts.length === 0) {
    console.log("No drafts to evaluate. Exiting.");
    process.exit(0);
  }

  console.log(`→ Found ${drafts.length} drafts to evaluate\n`);

  // Fetch context
  console.log("→ Fetching brand context...");
  const brand = await convex.query("brands:getBrandBySlug", { slug: BRAND_SLUG });
  const brandId = brand?._id;

  let constitution = null;
  let existingArticles = [];

  if (brandId) {
    [constitution, existingArticles] = await Promise.all([
      convex.query("constitution:getByBrand", { brandId }).catch(() => null),
      convex.query("knowledge:listPublished", { brandId }).catch(() => []),
    ]);
  }
  console.log(`  ✓ Constitution: ${constitution ? "loaded" : "not found"}`);
  console.log(`  ✓ Existing articles: ${(existingArticles || []).length}\n`);

  // Evaluate each draft
  const results = {
    autoPublish: [],
    needsReview: [],
    rejected: [],
  };

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    console.log(`  [${i + 1}/${drafts.length}] Evaluating: "${draft.title}"...`);

    const scored = await evaluateArticle(draft, {
      constitution,
      existingArticles,
      genai,
    });

    const emoji = scored.verdict === "auto-publish" ? "✅" : scored.verdict === "needs-review" ? "⚠️" : "❌";
    console.log(`    ${emoji} Score: ${scored.weightedScore}/100 → ${scored.verdict.toUpperCase()}\n`);

    if (scored.verdict === "auto-publish") results.autoPublish.push(scored);
    else if (scored.verdict === "needs-review") results.needsReview.push(scored);
    else results.rejected.push(scored);
  }

  // Save results
  const output = {
    evaluatedAt: new Date().toISOString(),
    brandSlug: BRAND_SLUG,
    thresholds: THRESHOLDS,
    summary: {
      total: drafts.length,
      autoPublish: results.autoPublish.length,
      needsReview: results.needsReview.length,
      rejected: results.rejected.length,
    },
    results,
  };

  const outputPath = resolve(PIPELINE_DIR, "kb-evaluated.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("═══════════════════════════════════════════");
  console.log("  EVALUATION COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  Total evaluated:   ${output.summary.total}`);
  console.log(`  ✅ Auto-publish:   ${output.summary.autoPublish}`);
  console.log(`  ⚠️  Needs review:   ${output.summary.needsReview}`);
  console.log(`  ❌ Rejected:       ${output.summary.rejected}`);
  console.log(`\n  Output: ${outputPath}`);

  if (results.autoPublish.length > 0) {
    console.log(`\n  READY TO PUBLISH:`);
    results.autoPublish.forEach((a, i) => {
      console.log(`    ${i + 1}. ${a.title} (${a.weightedScore}/100)`);
    });
    console.log(`\n  → Next: Run  node scripts/kb-generate.mjs --publish  to push approved articles to Eleanor\n`);
  }

  if (results.needsReview.length > 0) {
    console.log(`\n  NEEDS HUMAN REVIEW:`);
    results.needsReview.forEach((a, i) => {
      console.log(`    ${i + 1}. ${a.title} (${a.weightedScore}/100) — ${a.evaluation?.overallNotes || ""}`);
    });
  }
}

// Only run main if called directly (not imported)
const isDirectRun = process.argv[1]?.includes("kb-evaluate");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
