create function public.preserve_game_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.completed := old.completed or new.completed;
  return new;
end;
$$;

create trigger game_completion_is_permanent before update on public.game_progress
for each row execute function public.preserve_game_completion();