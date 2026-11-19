-- Update app_notifications to allow 'achievement' as a notification kind
alter table public.app_notifications drop constraint app_notifications_kind_check;
alter table public.app_notifications add constraint app_notifications_kind_check check (kind in ('comment', 'forum', 'report', 'achievement'));

-- Create table to track earned achievements
create table public.earned_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.app_profiles(user_id) on delete cascade,
  achievement_key text not null check (achievement_key in ('first_sighting', 'conversation_starter', 'game_on', 'local_spotter', 'weekly_explorer')),
  earned_at timestamptz not null default now(),
  unique(user_id, achievement_key)
);

-- Enable RLS on earned_achievements
alter table public.earned_achievements enable row level security;

-- Users can view their own achievements
create policy "Users view their achievements" on public.earned_achievements for select to authenticated
using (user_id = (select auth.jwt()->>'sub'));

-- Allow authenticated users to insert achievements (with user_id validation)
create policy "Authenticated users insert achievements" on public.earned_achievements for insert to authenticated
with check (user_id = (select auth.jwt()->>'sub'));

-- Allow users to delete their own achievements
create policy "Users delete their achievements" on public.earned_achievements for delete to authenticated
using (user_id = (select auth.jwt()->>'sub'));

-- Create trigger function to notify when achievement is earned
create function public.notify_achievement_earned() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  achievement_title text;
begin
  -- Map achievement key to title
  achievement_title := case new.achievement_key
    when 'first_sighting' then 'First Sighting'
    when 'conversation_starter' then 'Conversation Starter'
    when 'game_on' then 'Game on'
    when 'local_spotter' then 'Local Spotter'
    when 'weekly_explorer' then 'Weekly Explorer'
    else 'Achievement Unlocked'
  end;
  
  -- Create notification
  insert into public.app_notifications (user_id, kind, title, message)
  values (new.user_id, 'achievement', achievement_title, 'You have unlocked the ' || achievement_title || ' achievement!');
  
  return new;
end;
$$;

-- Create trigger for achievement notifications
create trigger achievement_earned_notification after insert on public.earned_achievements
for each row execute function public.notify_achievement_earned();

-- Create index for faster lookups
create index earned_achievements_user_id_idx on public.earned_achievements(user_id);
