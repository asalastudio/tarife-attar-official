"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getPlaceholderImageUrl } from "@/lib/placeholder-image";
import { getItemLabel } from "@/lib/brandSystem";
import { PlaceholderImagesQueryResult } from "@/sanity/lib/queries";

interface GiftProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  compareAtPrice?: number;
  volume?: string;
  mainImage?: unknown;
  shopifyPreviewImageUrl?: string;
  shopifyImage?: string;
  inStock?: boolean;
  setSize?: number;
  pieceFormat?: string;
  legacyName?: string;
  showLegacyName?: boolean;
}

interface Props {
  products: GiftProduct[];
  totalCount: number;
  placeholderImages?: PlaceholderImagesQueryResult | null;
}

export function GiftClient({ products, totalCount, placeholderImages }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 md:px-24 py-4 md:py-6 flex items-center justify-between min-w-0">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 md:gap-3 font-mono text-[10px] md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity flex-shrink-0 min-w-0"
          >
            <ArrowLeft weight="thin" className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Return to Threshold</span>
            <span className="sm:hidden truncate">Threshold</span>
          </button>
          <span className="font-mono text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.6em] text-theme-gold flex-shrink-0 whitespace-nowrap">
            The Gift
          </span>
        </div>
      </header>

      {/* Hero - Compact layout */}
      <section className="pt-16 md:pt-28 pb-4 md:pb-12 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8"
          >
            {/* Left - Title */}
            <div className="flex-shrink-0">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.6em] md:tracking-[0.8em] text-theme-gold mb-2 md:mb-3 block leading-tight">
                {totalCount} {getItemLabel('gift', totalCount)} · Curated
              </span>
              <h1 className="text-3xl md:text-6xl font-serif tracking-tighter leading-[0.95] md:leading-[0.9]">
                The Gift
              </h1>
            </div>

            {/* Right - Description */}
            <div className="hidden md:block max-w-md text-right">
              <p className="font-serif text-lg opacity-80 leading-relaxed mb-2">
                Curated sets and travel collections. Bundled and ready to give.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                Assorted selections. Signature gift packaging.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="pb-20 md:pb-24 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-theme-charcoal/[0.08]">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link
                    href={`/product/${product.slug.current}`}
                    className="group flex flex-col bg-theme-alabaster hover:bg-theme-charcoal/[0.03] transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square">
                      {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                        <div className="absolute top-2 left-2 z-10 bg-theme-charcoal text-theme-alabaster px-2 py-1">
                          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest">
                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% Off
                          </span>
                        </div>
                      )}
                      {(() => {
                        const sanityImage = product.mainImage;
                        const imageUrl = sanityImage ? urlForImage(sanityImage as any) : null;
                        const shopifyImageUrl = product.shopifyPreviewImageUrl || product.shopifyImage;

                        if (imageUrl) {
                          try {
                            const imageSrc = imageUrl.width(500).height(500).url();
                            return (
                              <Image
                                src={imageSrc}
                                alt={product.title || 'Product image'}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            );
                          } catch (error) {
                            console.warn('Failed to generate image URL:', product.title, error);
                          }
                        }

                        if (shopifyImageUrl) {
                          return (
                            <Image
                              src={shopifyImageUrl}
                              alt={product.title || 'Product image'}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          );
                        }

                        return (
                          <Image
                            src={getPlaceholderImageUrl('gift', placeholderImages)}
                            alt={`${product.title} - Coming soon`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-500"
                          />
                        );
                      })()}
                    </div>

                    {/* Product Info */}
                    <div className="text-center py-4 md:py-8 space-y-1.5 px-2">
                      <h3 className="font-serif italic text-xs md:text-base tracking-wide break-words line-clamp-2">
                        {product.title}
                      </h3>
                      {product.setSize && (
                        <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-50">
                          {product.setSize}-Piece Set{product.pieceFormat ? ` · ${product.pieceFormat}` : ''}
                        </p>
                      )}
                      {!product.inStock ? (
                        <p className="font-mono text-[10px] md:text-sm tracking-wider opacity-40">
                          Out of Stock
                        </p>
                      ) : product.price ? (
                        <p className="text-xs md:text-base tracking-wide opacity-70 flex items-center justify-center gap-2">
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="opacity-50 line-through">${product.compareAtPrice}</span>
                          )}
                          <span>${product.price}</span>
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-theme-charcoal/[0.03]">
              <span className="font-mono text-xs uppercase tracking-widest opacity-30">
                No gift sets available yet
              </span>
            </div>
          )}
        </div>
      </section>

      <GlobalFooter theme="light" hideQuiz />
    </div>
  );
}
