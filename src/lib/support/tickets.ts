import "server-only";
import { randomBytes } from "crypto";
import { getWriteClient } from "@/sanity/lib/writeClient";

/**
 * Support tickets live in Sanity as `supportTicket` documents and are worked
 * in the Studio under Customer Service. This module is the only writer.
 */

export type TicketChannel = "form" | "concierge" | "email" | "other";

export interface TranscriptLine {
  role: "user" | "assistant";
  content: string;
  at?: string;
}

export interface CreateTicketInput {
  name: string;
  email: string;
  message: string;
  subject?: string;
  inquiryType?: string;
  orderNumber?: string;
  platform?: string;
  channel?: TicketChannel;
  transcript?: TranscriptLine[];
  attachmentData?: string; // data: URL, base64
  attachmentName?: string;
  sourceUrl?: string;
  userAgent?: string;
}

export interface CreatedTicket {
  id: string;
  ticketNumber: string;
}

const INQUIRY_TYPES = new Set([
  "Order Status",
  "Shipping",
  "Returns & Exchanges",
  "Product Question",
  "Other",
]);

/** TA-YYMMDD-XXXX, easy to read back over the phone. */
export function makeTicketNumber(now = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
  const bytes = randomBytes(4);
  let tail = "";
  for (let i = 0; i < 4; i++) tail += alphabet[bytes[i] % alphabet.length];
  return `TA-${yy}${mm}${dd}-${tail}`;
}

export function buildSubject(inquiryType?: string, orderNumber?: string): string {
  const head = inquiryType && inquiryType !== "Other" ? inquiryType : "Support request";
  return orderNumber ? `${head} (Order ${orderNumber})` : head;
}

function key(): string {
  return randomBytes(4).toString("hex");
}

async function uploadAttachment(dataUrl: string, filename: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return undefined;
  const [, contentType, base64] = match;
  if (!contentType.startsWith("image/")) return undefined;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > 3 * 1024 * 1024) return undefined;
  const asset = await getWriteClient().assets.upload("image", buffer, {
    filename,
    contentType,
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

export async function createTicket(input: CreateTicketInput): Promise<CreatedTicket> {
  const client = getWriteClient();
  const now = new Date();
  const ticketNumber = makeTicketNumber(now);
  const inquiryType = input.inquiryType && INQUIRY_TYPES.has(input.inquiryType) ? input.inquiryType : "Other";

  let attachment: unknown = undefined;
  if (input.attachmentData && input.attachmentName) {
    try {
      attachment = await uploadAttachment(input.attachmentData, input.attachmentName);
    } catch (err) {
      // An attachment must never block the ticket itself.
      console.warn("[Support] Attachment upload failed:", err instanceof Error ? err.message : err);
    }
  }

  const transcript = (input.transcript || [])
    .filter((l) => l && (l.role === "user" || l.role === "assistant") && typeof l.content === "string" && l.content.trim())
    .slice(-40)
    .map((l) => ({
      _type: "transcriptLine",
      _key: key(),
      role: l.role,
      content: l.content.slice(0, 4000),
      at: l.at || now.toISOString(),
    }));

  const doc = {
    _type: "supportTicket",
    ticketNumber,
    status: "open",
    priority: "normal",
    subject: (input.subject || buildSubject(inquiryType, input.orderNumber)).slice(0, 200),
    inquiryType,
    message: input.message.slice(0, 20000),
    ...(attachment ? { attachment } : {}),
    ...(transcript.length ? { transcript } : {}),
    customerName: input.name.slice(0, 200),
    customerEmail: input.email.slice(0, 320),
    ...(input.orderNumber ? { orderNumber: input.orderNumber.slice(0, 64) } : {}),
    ...(input.platform ? { platform: input.platform.slice(0, 64) } : {}),
    channel: input.channel || "form",
    createdAt: now.toISOString(),
    ...(input.sourceUrl ? { sourceUrl: input.sourceUrl.slice(0, 2000) } : {}),
    ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 500) } : {}),
  };

  const created = await client.create(doc);
  return { id: created._id, ticketNumber };
}
