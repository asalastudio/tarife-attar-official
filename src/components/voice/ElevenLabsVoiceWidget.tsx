"use client";

import Script from "next/script";
import { createElement } from "react";

export function ElevenLabsVoiceWidget() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ELEVENLABS_WIDGET === "true";

  if (!enabled || !agentId) return null;

  return (
    <>
      {/*
        ElevenLabs requires the custom element to be present in the body and
        the embed script to load client-side. The public agent itself should be
        domain-allowlisted in ElevenLabs before this flag is enabled.
      */}
      {createElement("elevenlabs-convai", {
        "agent-id": agentId,
        "action-text": "Talk with Nida",
        "start-call-text": "Begin",
        "end-call-text": "End",
        "expand-text": "Open voice concierge",
        "markdown-link-allowed-hosts": "tarifeattar.com,www.tarifeattar.com",
      })}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
