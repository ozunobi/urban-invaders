-- Add CASCADE delete to all foreign keys referencing app_profiles
-- This ensures when a profile is deleted, all related data is automatically cleaned up

-- Step 1: Ensure earned_achievements has CASCADE (may not exist yet if migration not applied)
-- If the table exists, we need to update constraints
begin;

-- Check and update forum_posts
alter table public.forum_posts drop constraint if exists forum_posts_user_id_fkey;
alter table public.forum_posts add constraint forum_posts_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Check and update forum_comments (both constraints)
alter table public.forum_comments drop constraint if exists forum_comments_user_id_fkey;
alter table public.forum_comments add constraint forum_comments_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- forum_comments already has cascade on forum_posts via post_id, which helps

-- Check and update game_progress
alter table public.game_progress drop constraint if exists game_progress_user_id_fkey;
alter table public.game_progress add constraint game_progress_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Check and update sighting_reports
alter table public.sighting_reports drop constraint if exists sighting_reports_user_id_fkey;
alter table public.sighting_reports add constraint sighting_reports_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Check and update app_notifications
alter table public.app_notifications drop constraint if exists app_notifications_user_id_fkey;
alter table public.app_notifications add constraint app_notifications_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- If earned_achievements table exists, update its constraint
do $$
begin
  if exists (select from information_schema.tables where table_name = 'earned_achievements') then
    alter table public.earned_achievements drop constraint if exists earned_achievements_user_id_fkey;
    alter table public.earned_achievements add constraint earned_achievements_user_id_fkey 
      foreign key (user_id) references public.app_profiles(user_id) on delete cascade;
  end if;
end $$;

-- Step 2: Add DELETE policy for app_profiles
drop policy if exists "Users can be deleted by themselves" on public.app_profiles;
create policy "Users delete their account" on public.app_profiles for delete to authenticated
using (user_id = (select auth.jwt()->>'sub'));

commit;
