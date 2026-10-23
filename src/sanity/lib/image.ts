import createImageUrlBuilder from "@sanity/image-url";
import type { ImageLoader } from "next/image";
import { client } from "./client";

// Define a simple type for Sanity image source
type SanityImageSource = {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  _type?: string;
  _key?: string;
};

const imageBuilder = createImageUrlBuilder(client);

export const urlForImage = (source: SanityImageSource | undefined) => {
  if (!source?.asset?._ref) {
    return undefined;
  }

  try {
    return imageBuilder.image(source).auto("format").fit("max");
  } catch (error) {
    console.warn('Failed to build image URL:', error);
    return undefined;
  }
};

/**
 * next/image loader for cdn.sanity.io URLs. Sanity resizes and compresses at the
 * edge (WebP/AVIF via auto=format), so the srcset points straight at the CDN
 * instead of round-tripping through the Next image optimizer. fit=max never
 * upscales past the original asset.
 */
export const sanityImageLoader: ImageLoader = ({ src, width, quality }) =>
  imageBuilder
    .image(src)
    .width(width)
    .quality(quality ?? 75)
    .auto("format")
    .fit("max")
    .url();

// Helper to get URL string directly
export const urlForImageString = (
  source: SanityImageSource | undefined,
  width?: number,
  height?: number
): string | undefined => {
  const builder = urlForImage(source);
  if (!builder) return undefined;

  if (width) builder.width(width);
  if (height) builder.height(height);

  return builder.url();
};
