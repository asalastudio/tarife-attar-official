import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Product type for Sanity fetch (matches ProductDetailClient.Product)
interface SanityProduct {
  _id: string;
  title: string;
  slug: { current: string };
  collectionType: "atlas" | "relic";
  [key: string]: unknown;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await sanityFetch<SanityProduct>({
    query: productBySlugQuery,
    params: { slug: params.slug },
    tags: [`product-${params.slug}`],
    revalidate: 60,
  });

  if (!product) {
    notFound();
  }

  // Cast to expected type for ProductDetailClient
  return <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} />;
}
