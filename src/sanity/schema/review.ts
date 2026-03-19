export const reviewSchema = {
    name: 'review',
    title: 'Review',
    type: 'document',
    fields: [
        {
            name: 'reviewerName',
            title: 'Reviewer Name',
            type: 'string',
        },
        {
            name: 'rating',
            title: 'Rating',
            type: 'number',
            validation: (Rule: { required: () => { min: (n: number) => { max: (n: number) => unknown } } }) =>
                Rule.required().min(1).max(5),
        },
        {
            name: 'body',
            title: 'Review Text',
            type: 'text',
        },
        {
            name: 'date',
            title: 'Date',
            type: 'datetime',
        },
        {
            name: 'product',
            title: 'Product',
            type: 'reference',
            to: [{ type: 'product' }],
        },
        {
            name: 'productHandle',
            title: 'Shopify Product Handle',
            type: 'string',
            description: 'Original Shopify handle for reference',
        },
        {
            name: 'productNameAtTime',
            title: 'Product Name (at time of review)',
            type: 'string',
            description: 'The product name the customer saw when they wrote the review',
        },
        {
            name: 'photoUrl',
            title: 'Photo URL',
            type: 'url',
        },
        {
            name: 'verified',
            title: 'Verified Purchase',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Published', value: 'published' },
                    { title: 'Pending', value: 'pending' },
                    { title: 'Hidden', value: 'hidden' },
                ],
            },
            initialValue: 'published',
        },
        {
            name: 'reply',
            title: 'Store Reply',
            type: 'text',
        },
        {
            name: 'looxId',
            title: 'Loox Review ID',
            type: 'string',
            description: 'Original ID from Loox import (for dedup)',
            hidden: true,
        },
    ],
    preview: {
        select: {
            title: 'reviewerName',
            subtitle: 'productNameAtTime',
            rating: 'rating',
        },
        prepare({ title, subtitle, rating }: { title?: string; subtitle?: string; rating?: number }) {
            return {
                title: `${'★'.repeat(rating || 0)}${'☆'.repeat(5 - (rating || 0))} ${title || 'Anonymous'}`,
                subtitle: subtitle || 'General review',
            };
        },
    },
    orderings: [
        {
            title: 'Date (Newest)',
            name: 'dateDesc',
            by: [{ field: 'date', direction: 'desc' }],
        },
        {
            title: 'Rating (Highest)',
            name: 'ratingDesc',
            by: [{ field: 'rating', direction: 'desc' }],
        },
    ],
};
