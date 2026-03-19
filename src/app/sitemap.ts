import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

const sitemapProductsQuery = groq`
  *[_type == "product" && !(_id in path("drafts.**"))] {
    "slug": slug.current,
    _updatedAt
  }
`;

const sitemapJournalQuery = groq`
  *[_type == "journalEntry" && !(_id in path("drafts.**"))] {
    "slug": slug.current,
    _updatedAt
  }
`;

const sitemapFieldJournalQuery = groq`
  *[_type == "fieldJournal" && !(_id in path("drafts.**"))] {
    "slug": slug.current,
    _updatedAt
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tarifeattar.com';

  const [products, journalEntries, fieldJournalEntries] = await Promise.all([
    client.fetch<{ slug: string; _updatedAt: string }[]>(sitemapProductsQuery),
    client.fetch<{ slug: string; _updatedAt: string }[]>(sitemapJournalQuery),
    client.fetch<{ slug: string; _updatedAt: string }[]>(sitemapFieldJournalQuery),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/atlas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/relic`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consult`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/field-journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const productPages: MetadataRoute.Sitemap = (products || [])
    .filter((p) => p.slug)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const journalPages: MetadataRoute.Sitemap = (journalEntries || [])
    .filter((j) => j.slug)
    .map((entry) => ({
      url: `${baseUrl}/journal/${entry.slug}`,
      lastModified: new Date(entry._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  const fieldJournalPages: MetadataRoute.Sitemap = (fieldJournalEntries || [])
    .filter((f) => f.slug)
    .map((entry) => ({
      url: `${baseUrl}/field-journal/${entry.slug}`,
      lastModified: new Date(entry._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...productPages, ...journalPages, ...fieldJournalPages];
}
