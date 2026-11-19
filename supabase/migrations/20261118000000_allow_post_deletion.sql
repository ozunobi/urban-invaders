-- Allow users to delete their own posts
-- Comments are automatically deleted via CASCADE constraint on forum_comments.post_id
create policy "Users delete their posts" on public.forum_posts for delete to authenticated
using (user_id = (select auth.jwt()->>'sub'));
