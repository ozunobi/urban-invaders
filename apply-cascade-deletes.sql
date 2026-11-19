-- Complete Account Deletion Fix
-- This SQL ensures that when a user account is deleted, ALL related data is cascade deleted

-- Step 1: Ensure all foreign keys have CASCADE delete
-- Start transaction for safety
begin;

-- Update forum_posts constraint
alter table if exists public.forum_posts drop constraint if exists forum_posts_user_id_fkey;
alter table if exists public.forum_posts add constraint forum_posts_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Update forum_comments constraint (user_id reference)
alter table if exists public.forum_comments drop constraint if exists forum_comments_user_id_fkey;
alter table if exists public.forum_comments add constraint forum_comments_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Update game_progress constraint
alter table if exists public.game_progress drop constraint if exists game_progress_user_id_fkey;
alter table if exists public.game_progress add constraint game_progress_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Update sighting_reports constraint
alter table if exists public.sighting_reports drop constraint if exists sighting_reports_user_id_fkey;
alter table if exists public.sighting_reports add constraint sighting_reports_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Update app_notifications constraint
alter table if exists public.app_notifications drop constraint if exists app_notifications_user_id_fkey;
alter table if exists public.app_notifications add constraint app_notifications_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Update earned_achievements constraint if table exists
alter table if exists public.earned_achievements drop constraint if exists earned_achievements_user_id_fkey;
alter table if exists public.earned_achievements add constraint earned_achievements_user_id_fkey 
  foreign key (user_id) references public.app_profiles(user_id) on delete cascade;

-- Step 2: Ensure DELETE policy exists for app_profiles
drop policy if exists "Users can be deleted by themselves" on public.app_profiles;
drop policy if exists "Users delete their account" on public.app_profiles;

create policy "Users delete their account" on public.app_profiles for delete to authenticated
using (user_id = (select auth.jwt()->>'sub'));

commit;

-- Success message
select 'Account deletion cascade constraints configured successfully' as status;
