import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/support
 *
 * Receives support form submissions from the /support page.
 * Primary path: Forward to Eleanor (Convex) at admired-duck-737.convex.site
 * Fallback: Log to console (visible in Vercel logs) if Convex is unreachable
 */

const CONVEX_SITE_URL = "https://admired-duck-737.convex.site";
const BRAND_SLUG = "tarifeattar";

interface SupportFormData {
  name: string;
  email: string;
  orderNumber?: string;
  platform?: string;
  inquiryType?: string;
  message: string;
  attachmentData?: string;
  attachmentName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SupportFormData = await request.json();

    const { name, email, orderNumber, platform, inquiryType, message, attachmentData, attachmentName } = body;

    // ── Validate required fields ──
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ── Build ticket payload for Eleanor/Convex ──
    const ticketPayload = {
      brand: BRAND_SLUG,
      customerName: name,
      customerEmail: email,
      orderNumber: orderNumber || undefined,
      channel: (platform?.toLowerCase() || "website") as string,
      category: mapInquiryType(inquiryType),
      subject: buildSubject(inquiryType, orderNumber),
      message,
      source: "website-support-form",
      attachments: attachmentData && attachmentName ? [{ name: attachmentName, data: attachmentData }] : undefined,
      metadata: {
        platform: platform || "Website",
        inquiryType: inquiryType || "General",
        submittedAt: new Date().toISOString(),
        userAgent: request.headers.get("user-agent") || "unknown",
        hasAttachment: !!attachmentData,
      },
    };

    // ── Attempt to forward to Eleanor (Convex) ──
    let convexSuccess = false;

    try {
      const convexResponse = await fetch(
        `${CONVEX_SITE_URL}/webhooks/support-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketPayload),
          signal: AbortSignal.timeout(10000), // 10s timeout
        }
      );

      if (convexResponse.ok) {
        convexSuccess = true;
        const result = await convexResponse.json().catch(() => ({}));
        console.log("[Support] Ticket created in Eleanor:", {
          ticketId: result.ticketId,
          customerEmail: email,
        });
      } else {
        console.warn(
          "[Support] Convex responded with:",
          convexResponse.status,
          await convexResponse.text().catch(() => "")
        );
      }
    } catch (convexError) {
      console.warn(
        "[Support] Could not reach Eleanor/Convex:",
        convexError instanceof Error ? convexError.message : "Unknown error"
      );
    }

    // ── Fallback: Log for manual processing ──
    if (!convexSuccess) {
      console.log("[Support] FALLBACK — Ticket logged for manual processing:", {
        timestamp: new Date().toISOString(),
        name,
        email,
        orderNumber: orderNumber || "N/A",
        platform: platform || "Not specified",
        inquiryType: inquiryType || "Not specified",
        messagePreview: message.substring(0, 200),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Support request received successfully",
        forwarded: convexSuccess,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Support API Error]", error);
    return NextResponse.json(
      { error: "Failed to process support request" },
      { status: 500 }
    );
  }
}

// ── Helpers ──

function mapInquiryType(inquiryType?: string): string {
  const mapping: Record<string, string> = {
    "Order Status": "order-status",
    Shipping: "shipping",
    "Returns & Exchanges": "returns",
    "Product Question": "product-inquiry",
    Other: "general",
  };
  return mapping[inquiryType || ""] || "general";
}

function buildSubject(inquiryType?: string, orderNumber?: string): string {
  const parts: string[] = [];

  if (inquiryType && inquiryType !== "Other") {
    parts.push(inquiryType);
  } else {
    parts.push("Support Request");
  }

  if (orderNumber) {
    parts.push(`(Order: ${orderNumber})`);
  }

  return parts.join(" ");
}
