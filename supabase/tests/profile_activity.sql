begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"test-alice","role":"authenticated"}', true);
insert into public.app_profiles (user_id, username) values ('test-alice', 'Alice');
insert into public.game_progress (user_id, game_id, state, completed) values ('test-alice', 'word-hunt', '{"words":["SNAIL"]}', true);
update public.game_progress set completed = false where game_id = 'word-hunt';
do $$ begin
  if not (select completed from public.game_progress where game_id = 'word-hunt') then raise exception 'Completed game was reset'; end if;
end $$;
insert into public.sighting_reports (id, user_id, species, latitude, longitude, photo_url)
values ('00000000-0000-0000-0000-000000000001', 'test-alice', 'Snail', 14, 121, 'test-alice/photo');
insert into storage.objects (bucket_id, name) values ('report-images', 'test-alice/photo');

select set_config('request.jwt.claims', '{"sub":"test-bob","role":"authenticated"}', true);
insert into public.app_profiles (user_id, username) values ('test-bob', 'Bob');
do $$ begin
  if exists (select 1 from public.game_progress) then raise exception 'Another user can see game progress'; end if;
  if exists (select 1 from public.sighting_reports) then raise exception 'Pending reports are visible'; end if;
  if exists (select 1 from storage.objects where bucket_id = 'report-images') then raise exception 'Pending report photos are visible'; end if;
  if exists (select 1 from public.app_notifications) then raise exception 'Unexpected notification'; end if;
end $$;

insert into public.forum_posts (id, user_id, title, body) values ('00000000-0000-0000-0000-000000000002', 'test-bob', 'Hello', 'World');
update public.forum_posts set body = 'Updated' where id = '00000000-0000-0000-0000-000000000002';
select set_config('request.jwt.claims', '{"sub":"test-alice","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.app_notifications where kind = 'forum') <> 2 then raise exception 'Post creation or update notification missing'; end if;
  update public.sighting_reports set status = 'accepted' where id = '00000000-0000-0000-0000-000000000001';
  if found then raise exception 'Owner could approve their report'; end if;
end $$;
insert into public.forum_comments (post_id, user_id, body) values ('00000000-0000-0000-0000-000000000002', 'test-alice', 'Hello Bob');
select set_config('request.jwt.claims', '{"sub":"test-bob","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.app_notifications where kind = 'comment') <> 1 then raise exception 'Comment notification missing'; end if;
  update public.sighting_reports set status = 'accepted' where id = '00000000-0000-0000-0000-000000000001';
  if found then raise exception 'User could approve a report'; end if;
end $$;

reset role;
update public.sighting_reports set status = 'accepted' where id = '00000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$ begin
  if (select count(*) from public.sighting_reports where status = 'accepted') <> 1 then raise exception 'Accepted report not visible'; end if;
  if (select count(*) from storage.objects where bucket_id = 'report-images') <> 1 then raise exception 'Accepted report photo not visible'; end if;
end $$;
select set_config('request.jwt.claims', '{"sub":"test-alice","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.app_notifications where kind = 'report') <> 1 then raise exception 'Acceptance notification missing'; end if;
end $$;
rollback;