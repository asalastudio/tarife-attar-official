import "./globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://tarifeattar.com'),
    title: {
        default: 'Tarife Attar — Artisanal Perfume Oils & Rare Attars',
        template: '%s | Tarife Attar',
    },
    description: 'Artisanal perfume oils and rare attars. Alcohol-free, skin-safe, cruelty-free. 28 fragrances across four olfactory territories. Oud, musk, amber, rose, jasmine, and marine compositions in concentrated glass wand applicator oil format.',
    keywords: ['perfume oil', 'attar', 'oud perfume oil', 'niche fragrance', 'perfume oil applicator', 'alcohol free perfume', 'skin safe fragrance', 'cruelty free perfume oil', 'artisanal fragrance', 'musk perfume oil', 'amber perfume oil', 'rose perfume oil'],
    authors: [{ name: 'Tarife Attar' }],
    creator: 'Tarife Attar',
    publisher: 'Tarife Attar',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://tarifeattar.com',
        siteName: 'Tarife Attar',
        title: 'Tarife Attar — Artisanal Perfume Oils & Rare Attars',
        description: 'Artisanal perfume oils and rare attars. Alcohol-free, skin-safe, cruelty-free. 28 fragrances across four olfactory territories.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tarife Attar — Artisanal Perfume Oils & Rare Attars',
        description: 'Artisanal perfume oils and rare attars. Alcohol-free, skin-safe, cruelty-free. 28 fragrances across four olfactory territories.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://tarifeattar.com',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Tarife Attar',
                            url: 'https://tarifeattar.com',
                            description: 'Artisanal perfume oils and rare attars. Alcohol-free, skin-safe, cruelty-free. 28 fragrances across four olfactory territories.',
                            foundingDate: '2018',
                            brand: {
                                '@type': 'Brand',
                                name: 'Tarife Attar',
                            },
                            sameAs: [
                                'https://www.etsy.com/shop/TarifeAttar',
                            ],
                            contactPoint: {
                                '@type': 'ContactPoint',
                                email: 'jordan@tarifeattar.com',
                                contactType: 'customer service',
                            },
                        }),
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
