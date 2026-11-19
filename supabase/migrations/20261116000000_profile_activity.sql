create table public.app_profiles (
  user_id text primary key,
  username text not null,
  updated_at timestamptz not null default now()
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.app_profiles(user_id),
  title text not null check (length(trim(title)) > 0),
  body text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id text not null references public.app_profiles(user_id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table public.game_progress (
  user_id text not null references public.app_profiles(user_id),
  game_id text not null check (game_id in ('word-hunt', 'species-quiz')),
  state jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table public.sighting_reports (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.app_profiles(user_id),
  species text not null check (length(trim(species)) > 0),
  description text not null default '',
  sighting_date text not null default '',
  sighting_time text not null default '',
  photo_url text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.app_profiles(user_id),
  kind text not null check (kind in ('comment', 'forum', 'report')),
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index forum_comments_post_id_idx on public.forum_comments(post_id);
create index app_notifications_user_created_idx on public.app_notifications(user_id, created_at desc);
create index sighting_reports_status_idx on public.sighting_reports(status);

alter table public.app_profiles enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.game_progress enable row level security;
alter table public.sighting_reports enable row level security;
alter table public.app_notifications enable row level security;

create policy "Profiles are visible to signed-in users" on public.app_profiles for select to authenticated using (true);
create policy "Users create their profile" on public.app_profiles for insert to authenticated with check (user_id = (select auth.jwt()->>'sub'));
create policy "Users update their profile" on public.app_profiles for update to authenticated using (user_id = (select auth.jwt()->>'sub')) with check (user_id = (select auth.jwt()->>'sub'));
create policy "Posts are visible to signed-in users" on public.forum_posts for select to authenticated using (true);
create policy "Users create their posts" on public.forum_posts for insert to authenticated with check (user_id = (select auth.jwt()->>'sub'));
create policy "Users update their posts" on public.forum_posts for update to authenticated using (user_id = (select auth.jwt()->>'sub')) with check (user_id = (select auth.jwt()->>'sub'));
create policy "Comments are visible to signed-in users" on public.forum_comments for select to authenticated using (true);
create policy "Users create their comments" on public.forum_comments for insert to authenticated with check (user_id = (select auth.jwt()->>'sub'));
create policy "Users manage their game progress" on public.game_progress for all to authenticated using (user_id = (select auth.jwt()->>'sub')) with check (user_id = (select auth.jwt()->>'sub'));
create policy "Users see their reports and accepted reports" on public.sighting_reports for select to authenticated using (status = 'accepted' or user_id = (select auth.jwt()->>'sub'));
create policy "Users submit pending reports" on public.sighting_reports for insert to authenticated with check (user_id = (select auth.jwt()->>'sub') and status = 'pending');
create policy "Users see their notifications" on public.app_notifications for select to authenticated using (user_id = (select auth.jwt()->>'sub'));

create function public.notify_forum_post() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.title, new.body, new.image_url) is not distinct from (old.title, old.body, old.image_url) then
    return new;
  end if;
  insert into public.app_notifications (user_id, kind, title, message)
  select user_id, 'forum', case when tg_op = 'INSERT' then 'New forum post' else 'Forum post updated' end,
    new.title
  from public.app_profiles where user_id <> new.user_id;
  return new;
end;
$$;

create trigger forum_post_notifications after insert or update on public.forum_posts
for each row execute function public.notify_forum_post();

create function public.notify_forum_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.app_notifications (user_id, kind, title, message)
  select user_id, 'comment', 'New comment', 'Someone commented on your post: ' || title
  from public.forum_posts where id = new.post_id and user_id <> new.user_id;
  return new;
end;
$$;

create trigger forum_comment_notifications after insert on public.forum_comments
for each row execute function public.notify_forum_comment();

create function public.notify_report_accepted() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'accepted' and old.status <> 'accepted' then
    insert into public.app_notifications (user_id, kind, title, message)
    values (new.user_id, 'report', 'Sighting accepted', 'Your ' || new.species || ' report was accepted and added to the map.');
  end if;
  return new;
end;
$$;

create trigger report_accepted_notification after update of status on public.sighting_reports
for each row execute function public.notify_report_accepted();

insert into storage.buckets (id, name, public) values ('community-images', 'community-images', true);
create policy "Signed-in users upload their own images" on storage.objects for insert to authenticated
with check (bucket_id = 'community-images' and (storage.foldername(name))[1] = (select auth.jwt()->>'sub'));
create policy "Anyone can view community images" on storage.objects for select to public using (bucket_id = 'community-images');