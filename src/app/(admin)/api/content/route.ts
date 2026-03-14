/**
 * AI Content Generation API Route
 *
 * Uses Claude to generate brand-aligned product content
 * based on the Brand Agent System Prompt.
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Brand Agent System Prompt (abbreviated - full version in BRAND_AGENT_SYSTEM_PROMPT.md)
const BRAND_AGENT_SYSTEM = `You are the autonomous Brand Agent for TARIFE ATTÄR, a luxury artisanal fragrance house specializing in alcohol-free perfume oils.

VOICE: 70% J. Peterman (narrative, transportive) / 30% David Ogilvy (factual, precise)

FORBIDDEN TERMS (never use): smell, nice, strong, loud, cheap, good, synthetics, buy, purchase
USE INSTEAD: olfactory profile, sillage, evocative, compelling, tenacious, aromachemicals, acquire, discover

TERRITORIES:
- EMBER: Spice, warmth, incense, amber. "The intimacy of ancient routes."
- PETAL: Bloom, herb, floral, fresh. "The exhale of living gardens."
- TIDAL: Salt, mist, aquatic, marine. "The pull of open water."
- TERRA: Wood, oud, leather, earthy. "The gravity of deep forests."

OUTPUT FORMAT for evocation (3 paragraphs):
1. Geographic/atmospheric anchor - place the reader somewhere
2. Sensory pivot - connect scent to place
3. Connection to wearer - the experience

OUTPUT FORMAT for onSkin (2 paragraphs):
1. Opening notes experience and heart development
2. Base resolution and emotional summary

Always end Atlas products with: "Hand-blended with natural ingredients and modern aromachemicals for depth and longevity."`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, productData } = body;

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    switch (action) {
      case 'generate_evocation': {
        const { title, territory, notes, legacyName, coordinates } = productData;

        const prompt = `Generate a 3-paragraph evocation for this Atlas product:

Product: ${title}
${legacyName ? `Legacy Name: ${legacyName}` : ''}
Territory: ${territory}
${coordinates ? `Coordinates: ${coordinates}` : ''}
Notes:
- Top: ${notes?.top?.join(', ') || 'Not specified'}
- Heart: ${notes?.heart?.join(', ') || 'Not specified'}
- Base: ${notes?.base?.join(', ') || 'Not specified'}

Write in the Peterman style - transportive, cinematic, grounded in place. Each paragraph should be 2-3 sentences.`;

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: BRAND_AGENT_SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        return NextResponse.json({
          success: true,
          content: text,
          type: 'evocation',
        });
      }

      case 'generate_onskin': {
        const { title, territory, notes } = productData;

        const prompt = `Generate a 2-paragraph "On Skin" description for this Atlas product:

Product: ${title}
Territory: ${territory}
Notes:
- Top: ${notes?.top?.join(', ') || 'Not specified'}
- Heart: ${notes?.heart?.join(', ') || 'Not specified'}
- Base: ${notes?.base?.join(', ') || 'Not specified'}

Write intimately - what happens when this fragrance meets skin. Paragraph 1: opening and heart development. Paragraph 2: base resolution and emotional summary.`;

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: BRAND_AGENT_SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        return NextResponse.json({
          success: true,
          content: text,
          type: 'onskin',
        });
      }

      case 'generate_etsy_listing': {
        const { title, territory, notes, evocation } = productData;

        const prompt = `Generate an Etsy listing for this Atlas product:

Product: ${title}
Territory: ${territory}
Notes:
- Top: ${notes?.top?.join(', ') || 'Not specified'}
- Heart: ${notes?.heart?.join(', ') || 'Not specified'}
- Base: ${notes?.base?.join(', ') || 'Not specified'}
${evocation ? `\nExisting Evocation:\n${evocation}` : ''}

Generate:
1. SEO-optimized title (max 140 chars, include "perfume oil", territory keywords)
2. Description (use evocation as base, add practical details, max 300 words)
3. 13 tags (comma-separated, SEO-focused)

Format your response as:
TITLE: [title]
DESCRIPTION: [description]
TAGS: [tag1, tag2, ...]`;

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: BRAND_AGENT_SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        const text = content.type === 'text' ? content.text : '';

        // Parse the response
        const titleMatch = text.match(/TITLE:\s*(.+)/);
        const descMatch = text.match(/DESCRIPTION:\s*([\s\S]+?)(?=TAGS:|$)/);
        const tagsMatch = text.match(/TAGS:\s*(.+)/);

        return NextResponse.json({
          success: true,
          content: {
            title: titleMatch?.[1]?.trim() || '',
            description: descMatch?.[1]?.trim() || '',
            tags: tagsMatch?.[1]?.split(',').map((t: string) => t.trim()) || [],
          },
          type: 'etsy_listing',
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Content API Error]:', error);
    return NextResponse.json(
      { error: 'Content generation failed' },
      { status: 500 }
    );
  }
}
