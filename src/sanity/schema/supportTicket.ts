/**
 * Support Ticket
 *
 * One document per customer request. Created by the storefront (the support
 * form and the concierge handoff) through /api/support, then worked inside
 * the Studio under "Customer Service". Status changes are ordinary edits:
 * change the field, publish.
 */

export const TICKET_STATUSES = [
  { title: 'Open', value: 'open' },
  { title: 'Waiting on customer', value: 'waiting' },
  { title: 'Resolved', value: 'resolved' },
] as const;

export const TICKET_CHANNELS = [
  { title: 'Support form', value: 'form' },
  { title: 'Concierge handoff', value: 'concierge' },
  { title: 'Email', value: 'email' },
  { title: 'Other', value: 'other' },
] as const;

export const TICKET_INQUIRY_TYPES = [
  'Order Status',
  'Shipping',
  'Returns & Exchanges',
  'Product Question',
  'Other',
] as const;

const STATUS_MARK: Record<string, string> = {
  open: '●',
  waiting: '◐',
  resolved: '○',
};

export const supportTicketSchema = {
  name: 'supportTicket',
  title: 'Support Ticket',
  type: 'document',
  groups: [
    { name: 'request', title: 'Request', default: true },
    { name: 'customer', title: 'Customer' },
    { name: 'work', title: 'Working notes' },
    { name: 'meta', title: 'Details' },
  ],
  fields: [
    {
      name: 'ticketNumber',
      title: 'Ticket',
      type: 'string',
      readOnly: true,
      group: 'request',
      description: 'Assigned when the request arrives. Quote it back to the customer.',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'request',
      initialValue: 'open',
      options: { list: [...TICKET_STATUSES], layout: 'radio', direction: 'horizontal' },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      group: 'request',
      initialValue: 'normal',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'High', value: 'high' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    },
    {
      name: 'subject',
      title: 'Subject',
      type: 'string',
      group: 'request',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'inquiryType',
      title: 'Inquiry type',
      type: 'string',
      group: 'request',
      options: { list: [...TICKET_INQUIRY_TYPES] },
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 8,
      group: 'request',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'attachment',
      title: 'Attachment',
      type: 'image',
      group: 'request',
      options: { storeOriginalFilename: true },
    },
    {
      name: 'transcript',
      title: 'Concierge transcript',
      type: 'array',
      group: 'request',
      description: 'The conversation the customer had with the concierge before asking for a person.',
      of: [
        {
          type: 'object',
          name: 'transcriptLine',
          fields: [
            {
              name: 'role',
              title: 'Speaker',
              type: 'string',
              options: {
                list: [
                  { title: 'Customer', value: 'user' },
                  { title: 'Concierge', value: 'assistant' },
                ],
              },
            },
            { name: 'content', title: 'Text', type: 'text', rows: 3 },
            { name: 'at', title: 'At', type: 'datetime' },
          ],
          preview: {
            select: { role: 'role', content: 'content' },
            prepare: ({ role, content }: { role?: string; content?: string }) => ({
              title: content || '',
              subtitle: role === 'user' ? 'Customer' : 'Concierge',
            }),
          },
        },
      ],
    },

    // Customer
    {
      name: 'customerName',
      title: 'Name',
      type: 'string',
      group: 'customer',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'customerEmail',
      title: 'Email',
      type: 'string',
      group: 'customer',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    { name: 'orderNumber', title: 'Order number', type: 'string', group: 'customer' },
    {
      name: 'platform',
      title: 'Purchased on',
      type: 'string',
      group: 'customer',
      description: 'Where the order was placed, if the customer told us.',
    },

    // Working notes
    { name: 'assignee', title: 'Assigned to', type: 'string', group: 'work' },
    {
      name: 'notes',
      title: 'Internal notes',
      type: 'array',
      group: 'work',
      description: 'Never shown to the customer.',
      of: [
        {
          type: 'object',
          name: 'ticketNote',
          fields: [
            { name: 'author', title: 'Author', type: 'string' },
            { name: 'body', title: 'Note', type: 'text', rows: 4 },
            {
              name: 'at',
              title: 'At',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
          ],
          preview: {
            select: { author: 'author', body: 'body', at: 'at' },
            prepare: ({ author, body, at }: { author?: string; body?: string; at?: string }) => ({
              title: body || '',
              subtitle: [author, at ? new Date(at).toLocaleString() : null].filter(Boolean).join(' · '),
            }),
          },
        },
      ],
    },
    { name: 'resolvedAt', title: 'Resolved at', type: 'datetime', group: 'work' },

    // Details
    {
      name: 'channel',
      title: 'Arrived via',
      type: 'string',
      group: 'meta',
      readOnly: true,
      options: { list: [...TICKET_CHANNELS] },
    },
    { name: 'createdAt', title: 'Received', type: 'datetime', group: 'meta', readOnly: true },
    { name: 'sourceUrl', title: 'Page', type: 'url', group: 'meta', readOnly: true },
    { name: 'userAgent', title: 'Browser', type: 'string', group: 'meta', readOnly: true },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Oldest first',
      name: 'createdAtAsc',
      by: [{ field: 'createdAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      subject: 'subject',
      ticketNumber: 'ticketNumber',
      customerName: 'customerName',
      status: 'status',
      channel: 'channel',
    },
    prepare: ({
      subject,
      ticketNumber,
      customerName,
      status,
      channel,
    }: {
      subject?: string;
      ticketNumber?: string;
      customerName?: string;
      status?: string;
      channel?: string;
    }) => ({
      title: `${STATUS_MARK[status || 'open'] || '●'} ${subject || 'Support request'}`,
      subtitle: [ticketNumber, customerName, channel === 'concierge' ? 'via concierge' : null]
        .filter(Boolean)
        .join(' · '),
    }),
  },
};
