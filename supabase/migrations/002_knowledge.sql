-- Update chatbots table
alter table public.chatbots
  add column if not exists provider text not null default 'openai',
  add column if not exists model text not null default 'gpt-4o',
  add column if not exists description text;

-- Knowledge files
create table if not exists public.knowledge_files (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots(id) on delete cascade,
  file_type text not null check (file_type in ('system_prompt', 'knowledge')),
  file_name text not null,
  storage_path text not null,
  content text,
  created_at timestamptz not null default now()
);

alter table public.knowledge_files enable row level security;

create policy "Users can manage own knowledge files"
  on public.knowledge_files for all
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = knowledge_files.chatbot_id
      and chatbots.profile_id = auth.uid()
    )
  );

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots(id) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can read own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = messages.chatbot_id
      and chatbots.profile_id = auth.uid()
    )
  );

create index if not exists idx_messages_session on public.messages (chatbot_id, session_id);
create index if not exists idx_knowledge_files_chatbot on public.knowledge_files (chatbot_id);
