"use client";

import Link from 'next/link';
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { Product } from "@/types";
import { urlForImage } from "@/sanity/lib/image";
import { getPlaceholderImageUrl } from "@/lib/placeholder-image";
import { LegacyName } from "@/components/product/LegacyName";
import { PlaceholderImagesQueryResult, PortOfCall } from "@/sanity/lib/queries";

const CommunityMap = dynamic(
  () => import("@/components/atlas/CommunityMap").then(mod => ({ default: mod.CommunityMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[50vh] flex items-center justify-center bg-[#1a1714] text-[#C4A265] font-serif">
        <p className="text-sm tracking-widest uppercase opacity-50">Loading...</p>
      </div>
    ),
  }
);

export interface GiftProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  compareAtPrice?: number;
  mainImage?: unknown;
  shopifyPreviewImageUrl?: string;
  shopifyImage?: string;
  setSize?: number;
  inStock?: boolean;
}

export interface HomeSectionsProps {
    featuredProducts: (Product & {
      atlasImage?: unknown;
      relicImage?: unknown;
      shopifyPreviewImageUrl?: string;
      shopifyImage?: string;
    })[];
    placeholderImages?: PlaceholderImagesQueryResult | null;
    portsOfCall?: PortOfCall[];
    giftProducts?: GiftProduct[];
}

/**
 * Everything below the homepage hero: the featured collection, quiz and gift
 * invitations, and the community map. Streamed after the hero (see page.tsx),
 * so the hero image is discovered without waiting on these queries or the
 * Shopify availability check.
 */
export function HomeSections({ featuredProducts, placeholderImages, portsOfCall = [], giftProducts = [] }: HomeSectionsProps) {
    const router = useRouter();
    // Leaflet is the heaviest script on the page and the map sits last, so it
    // loads as the section approaches rather than during first paint.
    const mapRef = useRef<HTMLDivElement>(null);
    const mapNear = useInView(mapRef, { once: true, margin: "600px 0px" });

    const handleNavigate = (path: string) => {
        router.push(`/${path}`);
    };

    const giftHighlight = giftProducts.find((p) => p.inStock !== false) ?? giftProducts[0];

    const handleProductClick = (product: Product) => {
        if (product.slug?.current) {
            router.push(`/product/${product.slug.current}`);
        }
    };

    return (
        <>
            {/* Featured Grid Section */}
            <section className="py-20 md:py-48 px-4 sm:px-6 md:px-24">
                <header className="mb-12 md:mb-24 flex flex-col md:flex-row justify-between items-baseline border-b border-theme-charcoal/5 pb-8 md:pb-12 gap-4 md:gap-8">
                    <h2 className="text-3xl md:text-6xl font-serif italic tracking-tight text-theme-charcoal leading-none">
                        From the collection
                    </h2>
                    <button
                        onClick={() => handleNavigate('atlas')}
                        className="inline-flex items-center min-h-11 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                        Explore the Atlas →
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 md:gap-20">
                    {featuredProducts && featuredProducts.length > 0 ? (
                        featuredProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                whileHover={{ y: -10 }}
                                onClick={() => handleProductClick(product)}
                                className="group cursor-pointer flex flex-col space-y-6 md:space-y-10"
                            >
                                <div className="relative w-full aspect-[4/5] bg-[#F8F7F2] overflow-hidden shadow-sm border border-theme-charcoal/5">
                                    {(() => {
                                        // Try Sanity images first
                                        const displayImage = product.atlasImage || product.relicImage || product.mainImage;
                                        const imageUrl = displayImage ? urlForImage(displayImage)?.width(800)?.height(1000)?.url() : null;
                                        
                                        // Fallback to Shopify image
                                        const shopifyImageUrl = product.shopifyPreviewImageUrl || product.shopifyImage;
                                        
                                        if (imageUrl) {
                                            return (
                                                <Image
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                                />
                                            );
                                        }
                                        
                                        // Use Shopify image as fallback
                                        if (shopifyImageUrl) {
                                            return (
                                                <Image
                                                    src={shopifyImageUrl}
                                                    alt={product.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                                />
                                            );
                                        }
                                        
                                        // Use placeholder image for products without images
                                        return (
                                            <Image
                                                src={getPlaceholderImageUrl(product.collectionType as 'relic' | 'atlas' | undefined, placeholderImages)}
                                                alt={`${product.title} - Coming soon`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-1000"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-theme-charcoal/5"><span class="font-mono text-xs uppercase tracking-widest opacity-20">Coming Soon</span></div>';
                                                    }
                                                }}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xl md:text-2xl font-serif italic text-theme-charcoal leading-none group-hover:tracking-tighter transition-all">
                                                {product.title}
                                            </h3>
                                            {product.price && (
                                                <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-70 tabular-nums">
                                                    From ${product.price}
                                                </p>
                                            )}
                                        </div>
                                        <LegacyName
                                            legacyName={product.legacyName}
                                            showLegacyName={product.showLegacyName}
                                            className="text-[10px] !text-theme-charcoal/70"
                                        />
                                    </div>
                                    <p className="font-mono text-[8px] uppercase tracking-widest opacity-70">
                                        {product.collectionType === 'atlas' ? 'ATLAS COLLECTION' : 'RELIC VAULT'}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-40 font-mono text-sm">
                            <Link href="/atlas" className="underline underline-offset-4">Explore the Atlas for current availability.</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Territory Quiz CTA */}
            <section className="py-16 md:py-24 px-4 sm:px-6 md:px-24 bg-theme-charcoal/[0.02]">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4">
                        Find Your Signature
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-theme-charcoal leading-tight mb-4">
                        Discover Your Territory
                    </h2>
                    <p className="font-serif text-lg md:text-xl text-theme-charcoal/70 mb-8 max-w-xl mx-auto">
                        Four olfactory worlds. Five questions. One path that speaks to your soul.
                    </p>
                    <button
                        onClick={() => handleNavigate('quiz')}
                        className="inline-flex items-center gap-3 bg-theme-charcoal text-theme-alabaster px-8 py-4 rounded-full font-mono text-xs uppercase tracking-[0.2em] hover:bg-theme-charcoal/90 transition-colors"
                    >
                        Take the Quiz
                        <span>→</span>
                    </button>
                </div>
            </section>

            {/* Gift Sets CTA */}
            {giftHighlight && (
                <section className="py-16 md:py-24 px-4 sm:px-6 md:px-24 bg-theme-charcoal/[0.02]">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                            {/* Product thumbnail */}
                            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-[#F8F7F2] overflow-hidden border border-theme-charcoal/5 shadow-sm">
                                {giftHighlight.compareAtPrice && giftHighlight.price && giftHighlight.compareAtPrice > giftHighlight.price && (
                                    <div className="absolute top-2 left-2 z-10 bg-theme-charcoal text-theme-alabaster px-2 py-1">
                                        <span className="font-mono text-[9px] uppercase tracking-widest">
                                            {Math.round((1 - giftHighlight.price / giftHighlight.compareAtPrice) * 100)}% Off
                                        </span>
                                    </div>
                                )}
                                {(() => {
                                    const imageUrl = giftHighlight.mainImage ? urlForImage(giftHighlight.mainImage as any)?.width(500)?.height(500)?.url() : null;
                                    const shopifyImageUrl = giftHighlight.shopifyPreviewImageUrl || giftHighlight.shopifyImage;
                                    const src = imageUrl || shopifyImageUrl || getPlaceholderImageUrl('gift', placeholderImages);
                                    return (
                                        <Image
                                            src={src}
                                            alt={giftHighlight.title}
                                            fill
                                            sizes="(max-width: 768px) 192px, 256px"
                                            className="object-cover"
                                        />
                                    );
                                })()}
                            </div>

                            {/* Copy */}
                            <div className="text-center md:text-left flex-1">
                                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4">
                                    A Third Path
                                </span>
                                <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-theme-charcoal leading-tight mb-4">
                                    Give the Whole Journey
                                </h2>
                                <p className="font-serif text-lg md:text-xl text-theme-charcoal/70 mb-8 max-w-xl mx-auto md:mx-0">
                                    {giftHighlight.setSize
                                        ? `A ${giftHighlight.setSize}-piece mystery box for the curious wanderer. Every territory, one gift.`
                                        : 'Curated sets and travel collections, bundled and ready to give.'}
                                </p>
                                <button
                                    onClick={() => handleNavigate('gift')}
                                    className="inline-flex items-center gap-3 bg-theme-charcoal text-theme-alabaster px-8 py-4 rounded-full font-mono text-xs uppercase tracking-[0.2em] hover:bg-theme-charcoal/90 transition-colors"
                                >
                                    Shop Gift Sets
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Ports of Call — Community Map */}
            {portsOfCall.length > 0 && (
                <section className="py-16 md:py-24 px-4 sm:px-6 md:px-24 bg-[#141210]">
                    <div className="max-w-[1800px] mx-auto">
                        <div className="text-center mb-8 md:mb-12">
                            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#c9a96e] block mb-3">
                                Ports of Call
                            </span>
                            <h2 className="text-2xl md:text-4xl font-serif italic text-[#f5f0eb] tracking-tight">
                                The Tarife Attar Community
                            </h2>
                            <p className="font-serif text-base text-[#f5f0eb]/75 mt-3 max-w-lg mx-auto">
                                Every gold dot represents a city where Tarife Attar found a home.
                            </p>
                        </div>
                        <div ref={mapRef} className="w-full h-[50vh] md:h-[60vh] rounded-lg overflow-hidden border border-[#C4A265]/10">
                            {mapNear && <CommunityMap ports={portsOfCall} />}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
