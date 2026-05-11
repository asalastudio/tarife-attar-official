create extension if not exists pgcrypto;

create table if not exists public.voice_agent_events (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null,
  event_type text not null,
  channel text not null default 'voice',
  conversation_id text,
  tool_name text,
  status text not null check (status in ('success', 'failed', 'skipped')),
  order_number text,
  customer_contact_hash text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_voice_agent_events_brand_created
  on public.voice_agent_events (brand_slug, created_at desc);

create index if not exists idx_voice_agent_events_type_created
  on public.voice_agent_events (event_type, created_at desc);

create index if not exists idx_voice_agent_events_order_number
  on public.voice_agent_events (order_number)
  where order_number is not null;

alter table public.voice_agent_events enable row level security;

comment on table public.voice_agent_events is
  'Minimal redacted event log for Tarife Attar voice-commerce tool calls.';

comment on column public.voice_agent_events.customer_contact_hash is
  'SHA-256 hash of normalized email or phone. Raw customer contact details should not be stored here.';
