#!/usr/bin/env node

/**
 * KB Analysis Pipeline — Step 1 of 3
 * 
 * Pulls recent conversations from Eleanor (Convex), analyzes them with Gemini,
 * clusters recurring themes, and identifies gaps in the knowledge base.
 * 
 * Output: kb-gaps.json — a list of suggested article topics with supporting evidence.
 * 
 * Usage:
 *   node scripts/kb-analyze.mjs [--days 30] [--min-occurrences 2]
 * 
 * Requires:
 *   CONVEX_URL (or defaults to admired-duck-737)
 *   GOOGLE_GENERATIVE_AI_API_KEY
 */

import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../.kb-pipeline");

const CONVEX_URL = process.env.CONVEX_URL || "https://admired-duck-737.convex.cloud";
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const BRAND_SLUG = "tarife-attar";

const args = process.argv.slice(2);
const daysBack = parseInt(args.find((_, i, a) => a[i - 1] === "--days") || "30");
const minOccurrences = parseInt(args.find((_, i, a) => a[i - 1] === "--min-occurrences") || "2");

if (!GEMINI_KEY) {
  console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);
const genai = new GoogleGenAI({ apiKey: GEMINI_KEY });

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  KB ANALYSIS PIPELINE");
  console.log(`  Looking back ${daysBack} days, min ${minOccurrences} occurrences`);
  console.log("═══════════════════════════════════════════\n");

  // 1) Resolve the brand
  console.log("→ Resolving brand...");
  const brand = await convex.query("brands:getBrandBySlug", { slug: BRAND_SLUG });
  if (!brand?._id) {
    console.error(`❌ Brand "${BRAND_SLUG}" not found in Convex`);
    process.exit(1);
  }
  const brandId = brand._id;
  console.log(`  ✓ Brand: ${brand.name || BRAND_SLUG} (${brandId})\n`);

  // 2) Pull recent tickets
  console.log("→ Fetching recent tickets...");
  const allTickets = await convex.query("tickets:getTicketsByBrand", { brandId });
  const cutoffMs = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const recentTickets = (allTickets || []).filter(
    (t) => (t.createdAt || t._creationTime) > cutoffMs
  );
  console.log(`  ✓ Found ${recentTickets.length} tickets in last ${daysBack} days\n`);

  if (recentTickets.length === 0) {
    console.log("No recent tickets to analyze. Exiting.");
    process.exit(0);
  }

  // 3) Pull messages for each ticket
  console.log("→ Fetching messages for each ticket...");
  const conversations = [];
  for (const ticket of recentTickets) {
    try {
      const messages = await convex.query("tickets:getTicketMessages", { ticketId: ticket._id });
      if (messages && messages.length > 0) {
        const customerMessages = messages
          .filter((m) => m.senderType === "customer")
          .map((m) => m.content)
          .join("\n");

        const agentMessages = messages
          .filter((m) => m.senderType === "agent")
          .map((m) => m.content)
          .join("\n");

        if (customerMessages.trim()) {
          conversations.push({
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            category: ticket.category,
            intent: ticket.intent,
            channel: ticket.channel,
            knowledgeBaseCandidate: ticket.knowledgeBaseCandidate || false,
            customerQuestions: customerMessages,
            agentResponses: agentMessages,
          });
        }
      }
    } catch (err) {
      // Some tickets may not have messages yet
    }
  }
  console.log(`  ✓ Extracted ${conversations.length} conversations with content\n`);

  // 4) Pull existing KB articles to identify what's already covered
  console.log("→ Fetching existing KB articles...");
  const existingArticles = await convex.query("knowledge:listPublished", { brandId });
  const existingTopics = (existingArticles || []).map(
    (a) => `[${a.category}] ${a.title}: ${a.excerpt || a.content?.slice(0, 200)}`
  ).join("\n");
  console.log(`  ✓ ${(existingArticles || []).length} published articles in KB\n`);

  // 5) Send to Gemini for analysis
  console.log("→ Analyzing conversations with Gemini...\n");

  const conversationSummaries = conversations.map((c, i) => 
    `--- Conversation ${i + 1} (${c.channel}, ${c.knowledgeBaseCandidate ? "KB-CANDIDATE" : "standard"}) ---
Subject: ${c.subject || "N/A"}
Category: ${c.category || "N/A"}
Intent: ${c.intent || "N/A"}
Customer: ${c.customerQuestions.slice(0, 500)}
Agent: ${c.agentResponses.slice(0, 300)}`
  ).join("\n\n");

  const analysisPrompt = `You are an expert knowledge base analyst for Tarife Attär, a luxury perfume oil brand.

TASK: Analyze these customer conversations and identify recurring themes, unanswered questions, and knowledge gaps.

EXISTING KNOWLEDGE BASE ARTICLES:
${existingTopics || "(empty — no articles yet)"}

RECENT CUSTOMER CONVERSATIONS:
${conversationSummaries}

INSTRUCTIONS:
1. Identify recurring question themes (questions asked ${minOccurrences}+ times)
2. Find questions the agent struggled to answer or gave vague responses to
3. Identify topics NOT covered by existing KB articles
4. Prioritize conversations already flagged as "KB-CANDIDATE"

OUTPUT FORMAT (respond ONLY with this JSON array, no markdown):
[
  {
    "suggestedTitle": "Article title",
    "category": "product-care|returns|shipping|product-info|orders|brand-story|fragrance-guidance|policies",
    "reason": "Why this article is needed",
    "occurrences": 3,
    "sampleQuestions": ["Exact customer question 1", "Exact customer question 2"],
    "priority": "high|medium|low",
    "existingCoverage": "none|partial|outdated"
  }
]

Only include topics that represent genuine knowledge gaps. If a topic is already well-covered in the KB, skip it.`;

  const result = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: analysisPrompt,
  });
  const responseText = result.text.trim();

  let gaps;
  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    gaps = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (err) {
    console.error("❌ Failed to parse Gemini response as JSON");
    console.log("Raw response:\n", responseText);
    process.exit(1);
  }

  // 6) Filter by minimum occurrences
  const qualifiedGaps = gaps.filter((g) => g.occurrences >= minOccurrences);

  // 7) Save output
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const output = {
    analyzedAt: new Date().toISOString(),
    brandId,
    brandSlug: BRAND_SLUG,
    config: { daysBack, minOccurrences },
    stats: {
      ticketsAnalyzed: recentTickets.length,
      conversationsWithContent: conversations.length,
      existingKBArticles: (existingArticles || []).length,
      gapsIdentified: gaps.length,
      qualifiedGaps: qualifiedGaps.length,
      kbCandidateTickets: conversations.filter((c) => c.knowledgeBaseCandidate).length,
    },
    gaps: qualifiedGaps,
    allGaps: gaps,
  };

  const outputPath = resolve(OUTPUT_DIR, "kb-gaps.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("═══════════════════════════════════════════");
  console.log("  ANALYSIS COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  Tickets analyzed:     ${output.stats.ticketsAnalyzed}`);
  console.log(`  Conversations:        ${output.stats.conversationsWithContent}`);
  console.log(`  KB-Candidate tickets: ${output.stats.kbCandidateTickets}`);
  console.log(`  Existing KB articles: ${output.stats.existingKBArticles}`);
  console.log(`  Gaps found:           ${output.stats.gapsIdentified}`);
  console.log(`  Qualified (≥${minOccurrences}):     ${output.stats.qualifiedGaps}`);
  console.log(`\n  Output: ${outputPath}\n`);

  if (qualifiedGaps.length > 0) {
    console.log("  TOP GAPS:");
    qualifiedGaps
      .sort((a, b) => (b.priority === "high" ? 1 : 0) - (a.priority === "high" ? 1 : 0))
      .slice(0, 5)
      .forEach((g, i) => {
        console.log(`    ${i + 1}. [${g.priority.toUpperCase()}] ${g.suggestedTitle} (${g.occurrences}x)`);
      });
    console.log(`\n  → Next: Run  node scripts/kb-generate.mjs  to draft articles\n`);
  } else {
    console.log("  No qualified gaps found. Knowledge base is up to date!\n");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
