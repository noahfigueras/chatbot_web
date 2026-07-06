create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  messages_sent int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(chatbot_id, period_start)
);

alter table public.usage enable row level security;

create policy "Users can read own usage"
  on public.usage for select
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = usage.chatbot_id
      and chatbots.profile_id = auth.uid()
    )
  );

create policy "Service role can manage all usage"
  on public.usage for all
  using (true);

create index if not exists idx_usage_chatbot_period on public.usage (chatbot_id, period_start);
