import { Metadata } from 'next';
import { sanityFetch } from '@/sanity/lib/client';
import { allFieldJournalEntriesQuery } from '@/sanity/lib/queries';
import { FieldJournalClient } from './FieldJournalClient';

export const metadata: Metadata = {
    title: 'Field Journal | Tarife Attär',
    description: 'Material studies and territory guides from the Tarifé Attär studio.',
    openGraph: {
        title: 'Field Journal | Tarife Attär',
        description: 'Material studies and territory guides from the Tarifé Attär studio.',
        type: 'website',
    },
};

interface FieldJournalEntry {
    _id: string;
    title: string;
    slug: { current: string };
    subtitle?: string;
    excerpt?: string;
    coverImage?: unknown;
    author?: string;
    publishedAt?: string;
    category?: string;
    territory?: string;
    locationName?: string;
    region?: string;
    season?: string;
}

export default async function FieldJournalPage() {
    const entries = await sanityFetch<FieldJournalEntry[]>({
        query: allFieldJournalEntriesQuery,
        tags: ['fieldJournal'],
        revalidate: 0,
    }) || [];

    return <FieldJournalClient entries={entries} />;
}
