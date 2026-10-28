-- student_profiles contains students' email, phone and address.
-- Before: any logged-in user could read every student's row ("Enable read for authenticated users", USING true).
-- After: a row is readable only by the student, by admins, and by educators the student is in contact with
-- (lesson request or chat). Reviewer names are exposed through get_reviewer_names(), names only.

-- 1. Remove every existing SELECT policy on student_profiles (insert/update/delete policies are kept).
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'student_profiles' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.student_profiles', p.policyname);
  end loop;
end $$;

alter table public.student_profiles enable row level security;

-- 2. Helper (security definer, so it does not recurse through other tables' policies).
create or replace function public.can_view_student_profile(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    p_user_id = auth.uid()
    or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
    or exists (
      select 1 from public.lesson_requests lr
      where lr.student_id = p_user_id and lr.educator_id = auth.uid()
    )
    or exists (
      select 1 from public.chat_messages m
      where (m.sender_id = auth.uid() and m.receiver_id = p_user_id)
         or (m.receiver_id = auth.uid() and m.sender_id = p_user_id)
    )
  );
$$;

revoke all on function public.can_view_student_profile(uuid) from public, anon;
grant execute on function public.can_view_student_profile(uuid) to authenticated;

create policy "Students, contacts and admins can read student profiles"
  on public.student_profiles
  for select
  to authenticated
  using (public.can_view_student_profile(user_id));

-- 3. Reviewer names for public reviews (name only, only for students who wrote a review).
create or replace function public.get_reviewer_names(p_student_ids uuid[])
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select sp.id, sp.name
  from public.student_profiles sp
  where sp.id = any (p_student_ids)
    and exists (select 1 from public.reviews r where r.student_id = sp.id);
$$;

revoke all on function public.get_reviewer_names(uuid[]) from public;
grant execute on function public.get_reviewer_names(uuid[]) to anon, authenticated;
