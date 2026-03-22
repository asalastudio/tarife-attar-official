"use client";

import { ReactNode } from "react";
import { ShopifyCartProvider, WishlistProvider } from "@/context";
import { CompassProvider } from "@/components/navigation/CompassProvider";
import { ChatProvider } from "@/context/ChatContext";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize to your Eleanor instance
const convex = new ConvexReactClient("https://admired-duck-737.convex.site");

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ConvexProvider client={convex}>
      <ChatProvider>
        <ShopifyCartProvider>
          <WishlistProvider>
            <CompassProvider>
              {children}
            </CompassProvider>
          </WishlistProvider>
        </ShopifyCartProvider>
      </ChatProvider>
    </ConvexProvider>
  );
}
