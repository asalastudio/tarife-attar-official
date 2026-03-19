export const portOfCallSchema = {
    name: 'portOfCall',
    title: 'Port of Call',
    type: 'document',
    fields: [
        {
            name: 'city',
            title: 'City',
            type: 'string',
            validation: (Rule: { required: () => unknown }) => Rule.required(),
        },
        {
            name: 'country',
            title: 'Country',
            type: 'string',
            validation: (Rule: { required: () => unknown }) => Rule.required(),
        },
        {
            name: 'latitude',
            title: 'Latitude',
            type: 'number',
            validation: (Rule: { required: () => { min: (n: number) => { max: (n: number) => unknown } } }) => Rule.required().min(-90).max(90),
        },
        {
            name: 'longitude',
            title: 'Longitude',
            type: 'number',
            validation: (Rule: { required: () => { min: (n: number) => { max: (n: number) => unknown } } }) => Rule.required().min(-180).max(180),
        },
    ],
    preview: {
        select: {
            title: 'city',
            subtitle: 'country',
        },
    },
};
