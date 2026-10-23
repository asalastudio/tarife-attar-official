import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ChatLayoutWrapper } from "@/components/chat/ChatLayoutWrapper";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import "../globals.css";

// Primary serif font - elegant, editorial
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Technical mono font - industrial, precise. System monospace fallbacks share
// its 0.6em advance, so labels keep their width (and line breaks) when the web
// font swaps in; the default metric-adjusted Arial fallback re-wrapped them.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "700"],
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

// Metadata export removed as it's now in the root layout or handled by pages

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${ebGaramond.variable} ${jetbrainsMono.variable} min-h-screen bg-theme-alabaster text-theme-charcoal antialiased font-serif overflow-x-hidden cursor-none`}>
      <Providers>
        <ChatLayoutWrapper>
          <SiteHeader />
          {children}
        </ChatLayoutWrapper>
      </Providers>
    </div>
  );
}
