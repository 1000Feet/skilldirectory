-- Create field permissions table
create table public.field_permissions (
  id bigint primary key,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Add RLS policies
alter table public.field_permissions enable row level security;

create policy "Allow admins full access to field_permissions"
  on public.field_permissions
  for all
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Allow public read-only access to field_permissions"
  on public.field_permissions
  for select
  to authenticated
  using (true);

-- Insert default permissions
insert into public.field_permissions (id, permissions) values (1, '{
  "name": {"basic": true, "standard": true, "premium": true},
  "description": {"basic": true, "standard": true, "premium": true},
  "website": {"basic": false, "standard": true, "premium": true},
  "address": {"basic": false, "standard": true, "premium": true},
  "phone": {"basic": true, "standard": true, "premium": true},
  "email": {"basic": true, "standard": true, "premium": true},
  "about_business": {"basic": false, "standard": true, "premium": true},
  "facebook_url": {"basic": false, "standard": true, "premium": true},
  "instagram_url": {"basic": false, "standard": true, "premium": true},
  "youtube_url": {"basic": false, "standard": true, "premium": true},
  "ai_chatbot": {"basic": false, "standard": false, "premium": true},
  "ai_voice_agent": {"basic": false, "standard": false, "premium": true},
  "image": {"basic": true, "standard": true, "premium": true},
  "categories": {"basic": true, "standard": true, "premium": true},
  "tags": {"basic": false, "standard": true, "premium": true}
}'::jsonb);
