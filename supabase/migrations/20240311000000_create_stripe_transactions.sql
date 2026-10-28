create table public.stripe_transactions (
  id text not null primary key,
  customer_email text not null,
  customer_name text not null,
  amount bigint not null,
  currency text not null default 'usd',
  status text not null,
  payment_method text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  metadata jsonb null default '{}'::jsonb,
  constraint stripe_transactions_status_check check (
    status = any (array['succeeded'::text, 'pending'::text, 'failed'::text])
  )
);

-- Create indexes for common queries
create index idx_stripe_transactions_created_at on public.stripe_transactions using btree (created_at desc);
create index idx_stripe_transactions_status on public.stripe_transactions using btree (status);
create index idx_stripe_transactions_customer_email on public.stripe_transactions using btree (customer_email);

-- Add RLS policies
alter table public.stripe_transactions enable row level security;

create policy "Allow admin read access"
  on public.stripe_transactions
  for select
  to authenticated
  using (
    exists (
      select 1 from admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Function to sync Stripe webhook events to transactions
create or replace function public.handle_stripe_webhook()
returns trigger as $$
begin
  insert into public.stripe_transactions (
    id,
    customer_email,
    customer_name,
    amount,
    currency,
    status,
    payment_method,
    created_at,
    metadata
  )
  values (
    new.id,
    new.customer_email,
    new.customer_name,
    new.amount,
    new.currency,
    new.status,
    new.payment_method,
    new.created_at,
    new.metadata
  )
  on conflict (id) do update set
    status = excluded.status,
    metadata = excluded.metadata;
  
  return new;
end;
$$ language plpgsql security definer; 