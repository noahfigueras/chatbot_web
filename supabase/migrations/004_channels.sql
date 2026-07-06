-- Channels table for multi-platform integration (telegram, whatsapp, etc.)
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots(id) on delete cascade,
  channel_type text not null check (channel_type in ('telegram', 'whatsapp')),
  config jsonb not null default '{}',
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.channels enable row level security;

create policy "Users can manage own channels"
  on public.channels for all
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = channels.chatbot_id
      and chatbots.profile_id = auth.uid()
    )
  );

create index if not exists idx_channels_chatbot on public.channels (chatbot_id);
create index if not exists idx_channels_type on public.channels (channel_type);
