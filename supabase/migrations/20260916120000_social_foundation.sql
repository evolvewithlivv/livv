-- Social Foundation V1
-- Real multiplayer posts, replies, reactions.
-- Ownership is always auth.uid(). Never trust client identity fields for authority.

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'text'
    check (kind in ('text', 'proof', 'photo', 'video')),
  body text not null default '',
  proof jsonb,
  allow_replies boolean not null default true,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint social_posts_body_len check (char_length(body) <= 2000)
);

create index if not exists social_posts_feed_idx
  on public.social_posts (created_at desc);

create index if not exists social_posts_author_idx
  on public.social_posts (author_id, created_at desc);

create table if not exists public.social_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint social_replies_body_len check (
    char_length(body) >= 1 and char_length(body) <= 1000
  )
);

create index if not exists social_replies_post_idx
  on public.social_replies (post_id, created_at asc);

create index if not exists social_replies_author_idx
  on public.social_replies (author_id);

create table if not exists public.social_reactions (
  post_id uuid not null references public.social_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists social_reactions_user_idx
  on public.social_reactions (user_id);

create index if not exists social_reactions_post_idx
  on public.social_reactions (post_id);

alter table public.social_posts enable row level security;
alter table public.social_replies enable row level security;
alter table public.social_reactions enable row level security;

drop policy if exists "social_posts_select_authenticated" on public.social_posts;
create policy "social_posts_select_authenticated"
  on public.social_posts for select to authenticated using (true);

drop policy if exists "social_posts_insert_own" on public.social_posts;
create policy "social_posts_insert_own"
  on public.social_posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "social_posts_update_own" on public.social_posts;
create policy "social_posts_update_own"
  on public.social_posts for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

drop policy if exists "social_posts_delete_own" on public.social_posts;
create policy "social_posts_delete_own"
  on public.social_posts for delete to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists "social_replies_select_authenticated" on public.social_replies;
create policy "social_replies_select_authenticated"
  on public.social_replies for select to authenticated using (true);

drop policy if exists "social_replies_insert_own" on public.social_replies;
create policy "social_replies_insert_own"
  on public.social_replies for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "social_replies_delete_own" on public.social_replies;
create policy "social_replies_delete_own"
  on public.social_replies for delete to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists "social_reactions_select_authenticated" on public.social_reactions;
create policy "social_reactions_select_authenticated"
  on public.social_reactions for select to authenticated using (true);

drop policy if exists "social_reactions_insert_own" on public.social_reactions;
create policy "social_reactions_insert_own"
  on public.social_reactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "social_reactions_delete_own" on public.social_reactions;
create policy "social_reactions_delete_own"
  on public.social_reactions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.social_posts to authenticated;
grant select, insert, delete on public.social_replies to authenticated;
grant select, insert, delete on public.social_reactions to authenticated;

drop policy if exists "profiles_select_community" on public.profiles;
create policy "profiles_select_community"
  on public.profiles for select to authenticated using (true);
