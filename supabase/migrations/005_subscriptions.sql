create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_tier text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = profile_id);

create policy "Service role can manage all subscriptions"
  on public.subscriptions for all
  using (true);

create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.subscriptions (profile_id, plan_tier, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_subscription();
