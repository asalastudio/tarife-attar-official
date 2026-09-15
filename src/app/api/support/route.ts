import { NextRequest, NextResponse } from "next/server";
import { createTicket, type TicketChannel, type TranscriptLine } from "@/lib/support/tickets";

/**
 * POST /api/support
 *
 * Files a customer request as a `supportTicket` in Sanity, where it is worked
 * in the Studio under Customer Service. Used by the /support form and by the
 * concierge's "leave a message for the team" handoff.
 *
 * If Sanity cannot be written to, the request is logged in full to the server
 * log so nothing is lost, and the customer still receives a reference.
 */

export const runtime = "nodejs";

interface SupportRequestBody {
  name?: string;
  email?: string;
  message?: string;
  orderNumber?: string;
  platform?: string;
  inquiryType?: string;
  subject?: string;
  channel?: string;
  transcript?: TranscriptLine[];
  attachmentData?: string;
  attachmentName?: string;
  sourceUrl?: string;
}

const CHANNELS: TicketChannel[] = ["form", "concierge", "email", "other"];

export async function POST(request: NextRequest) {
  let body: SupportRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const channel: TicketChannel = CHANNELS.includes(body.channel as TicketChannel)
    ? (body.channel as TicketChannel)
    : "form";

  const input = {
    name,
    email,
    message,
    subject: body.subject?.trim() || undefined,
    inquiryType: body.inquiryType?.trim() || undefined,
    orderNumber: body.orderNumber?.trim() || undefined,
    platform: body.platform?.trim() || undefined,
    channel,
    transcript: Array.isArray(body.transcript) ? body.transcript : undefined,
    attachmentData: body.attachmentData || undefined,
    attachmentName: body.attachmentName || undefined,
    sourceUrl: body.sourceUrl || request.headers.get("referer") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };

  try {
    const ticket = await createTicket(input);
    console.log("[Support] Ticket filed:", { ticketNumber: ticket.ticketNumber, channel, email });
    return NextResponse.json(
      { success: true, ticketNumber: ticket.ticketNumber, stored: true },
      { status: 201 },
    );
  } catch (error) {
    // Never lose a customer's message. Log everything and still answer.
    console.error("[Support] Could not write ticket to Sanity:", error instanceof Error ? error.message : error);
    console.log("[Support] FALLBACK, request logged in full:", {
      at: new Date().toISOString(),
      channel,
      name,
      email,
      orderNumber: input.orderNumber || null,
      platform: input.platform || null,
      inquiryType: input.inquiryType || null,
      message,
      transcript: input.transcript || null,
    });
    return NextResponse.json(
      { success: true, ticketNumber: null, stored: false },
      { status: 202 },
    );
  }
}
