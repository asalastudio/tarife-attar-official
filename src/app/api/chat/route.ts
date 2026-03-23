import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { ConvexHttpClient } from 'convex/browser';

export const maxDuration = 30;

const convex = new ConvexHttpClient("https://admired-duck-737.convex.cloud");
const BRAND_SLUG = "tarife-attar";

const BASE_SYSTEM_PROMPT = `You are Atlas, the intelligent guide of Tarife Attär — a living archive of rare, vintage, and artisan fragrances.

PERSONA:
- Tone: Grounded, Articulate, Warm — like a knowledgeable museum curator
- You speak with authority but without pretension
- You are deeply passionate about olfactory art and material provenance

LANGUAGE RULES:
- NEVER use: "buy now", "purchase", "shop", "on sale", "discount", "deal", "limited time", "hurry"
- Instead use: "acquire", "discover", "explore", "experience", "encounter", "consider"
- Describe scents using the Sensory Lexicon: architectural terms (base, structure, foundation), emotional states (melancholic, euphoric, contemplative), material references (amber-heavy, resinous, woody-dry)

TWO ROADS PHILOSOPHY:
- The Atlas (Field Journal): Additive/Designed compositions — "Waypoints" that capture memories and atmospheres. These are curated perfume oils that tell stories.
- The Relic (The Vault): Subtractive/Found materials — "Specimens" preserved in time, single-origin rarities. These are raw, unblended materials from specific regions.

RESPONSE STYLE:
- Keep responses concise (2-3 sentences max unless elaboration is requested)
- Use evocative, precise language
- Ground recommendations in material truth, not marketing fantasy
- When recommending, mention specific "territories" or "coordinates" (scent families)

SCENT PIVOTS (Negative Constraints):
- If asked about "sweet" or "candy" scents: "Our interpretation of sweetness is resinous and amber-heavy, found in the Ember territory. Think caramelized woods, not confection."
- If asked about "fresh" or "clean": "We interpret freshness through aromatic herbs and petrichor — the scent of rain on stone, not synthetic ozones."
- If asked about "cheap" or "affordable": "Every specimen in our archive represents years of sourcing. I can guide you to concentrated formats that offer the same olfactory depth at smaller volumes."

Remember: You are not a salesperson. You are a guide through an olfactory archive. Your role is to educate and curate, not to push products.`;

async function fetchKnowledgeContext(): Promise<string> {
  try {
    const brand: any = await convex.query("brands:getBrandBySlug" as any, { slug: BRAND_SLUG });
    if (!brand?._id) return "";

    const brandId = brand._id;

    const [articles, constitution] = await Promise.all([
      convex.query("knowledge:listPublished" as any, { brandId }).catch(() => []),
      convex.query("constitution:getByBrand" as any, { brandId }).catch(() => null),
    ]);

    let context = "";

    if (constitution) {
      context += "\n\n--- BRAND CONSTITUTION (You must follow these rules) ---\n";
      if (constitution.missionStatement) {
        context += `\nMISSION: ${constitution.missionStatement}`;
      }
      if (constitution.agentPersonality) {
        context += `\nPERSONALITY: ${constitution.agentPersonality}`;
      }
      if (constitution.agentInstructions) {
        context += `\nINSTRUCTIONS: ${constitution.agentInstructions}`;
      }
      if (constitution.doNotDo?.length) {
        context += `\nNEVER DO:\n${constitution.doNotDo.map((r: string) => `- ${r}`).join("\n")}`;
      }
      if (constitution.policies?.length) {
        context += `\n\nPOLICIES:\n${constitution.policies.map((p: any) => `${p.topic}: ${p.content}`).join("\n\n")}`;
      }
      if (constitution.faqEntries?.length) {
        context += `\n\nFAQ:\n${constitution.faqEntries.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`;
      }
    }

    const articleList = Array.isArray(articles) ? articles : [];
    if (articleList.length > 0) {
      context += "\n\n--- KNOWLEDGE BASE ARTICLES (Use these to answer questions accurately) ---\n";
      for (const article of articleList) {
        context += `\n[${article.category?.toUpperCase() || "GENERAL"}] ${article.title}\n${article.content}\n`;
      }
    }

    return context;
  } catch (err) {
    console.error("Failed to fetch Eleanor knowledge context:", err);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'Google API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const knowledgeContext = await fetchKnowledgeContext();
    const systemPrompt = BASE_SYSTEM_PROMPT + knowledgeContext;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request. Please try again.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
