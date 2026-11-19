-- Fix: Add INSERT and DELETE policies for earned_achievements table
-- This allows users to insert their own achievements (via app logic or trigger)
-- and delete their achievements if needed

-- First, check if trigger needs to run with elevated privileges
-- The trigger already uses security definer, so it can insert

-- Add INSERT policy that allows the system to insert achievements
create policy "System inserts achievements" on public.earned_achievements for insert 
to authenticated with check (user_id = (select auth.jwt()->>'sub'));

-- Add DELETE policy to allow users to delete their own achievements if needed
create policy "Users delete their achievements" on public.earned_achievements for delete
to authenticated using (user_id = (select auth.jwt()->>'sub'));

-- Add UPDATE policy in case needed in future
create policy "Users update their achievements" on public.earned_achievements for update
to authenticated using (user_id = (select auth.jwt()->>'sub')) 
with check (user_id = (select auth.jwt()->>'sub'));
