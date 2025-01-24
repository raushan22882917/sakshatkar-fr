-- Enable RLS
alter table public.coding_contests enable row level security;
alter table public.coding_problems enable row level security;
alter table public.contest_participants enable row level security;
alter table public.contest_submissions enable row level security;

-- Create tables
create table if not exists public.coding_contests (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    created_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    is_public boolean default true,
    status text check (status in ('UPCOMING', 'ONGOING', 'ENDED')),
    participant_count integer default 0
);

create table if not exists public.coding_problems (
    id uuid default uuid_generate_v4() primary key,
    contest_id uuid references public.coding_contests(id) on delete cascade,
    title text not null,
    description text not null,
    difficulty text check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
    points integer not null,
    constraints text,
    input_format text,
    output_format text,
    time_limit numeric not null default 1.0,
    memory_limit integer not null default 256,
    test_cases jsonb not null default '[]'::jsonb,
    solved_count integer default 0,
    attempted_count integer default 0
);

create table if not exists public.contest_participants (
    id uuid default uuid_generate_v4() primary key,
    contest_id uuid references public.coding_contests(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    joined_at timestamp with time zone default now(),
    score integer default 0,
    solved_problems integer default 0,
    rank integer default 0,
    unique(contest_id, user_id)
);

create table if not exists public.contest_submissions (
    id uuid default uuid_generate_v4() primary key,
    contest_id uuid references public.coding_contests(id) on delete cascade,
    problem_id uuid references public.coding_problems(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    code text not null,
    language text not null,
    status text check (status in ('ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR')),
    score integer default 0,
    execution_time numeric,
    memory_used integer,
    submitted_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists coding_contests_status_idx on public.coding_contests(status);
create index if not exists coding_problems_contest_id_idx on public.coding_problems(contest_id);
create index if not exists contest_participants_contest_id_idx on public.contest_participants(contest_id);
create index if not exists contest_participants_user_id_idx on public.contest_participants(user_id);
create index if not exists contest_submissions_contest_id_idx on public.contest_submissions(contest_id);
create index if not exists contest_submissions_problem_id_idx on public.contest_submissions(problem_id);
create index if not exists contest_submissions_user_id_idx on public.contest_submissions(user_id);

-- Create RLS policies
create policy "Public contests are viewable by everyone"
    on public.coding_contests for select
    using (is_public = true);

create policy "Creators can update their own contests"
    on public.coding_contests for update
    using (auth.uid() = created_by);

create policy "Problems are viewable by contest participants"
    on public.coding_problems for select
    using (
        exists (
            select 1 from public.coding_contests c
            where c.id = contest_id
            and (c.is_public = true or c.created_by = auth.uid())
        )
    );

create policy "Participants can view their own submissions"
    on public.contest_submissions for select
    using (auth.uid() = user_id);

create policy "Participants can create submissions"
    on public.contest_submissions for insert
    with check (auth.uid() = user_id);

create policy "Participants can view contest standings"
    on public.contest_participants for select
    using (
        exists (
            select 1 from public.coding_contests c
            where c.id = contest_id
            and (c.is_public = true or c.created_by = auth.uid())
        )
    );

-- Create functions
create or replace function public.update_contest_status()
returns trigger as $$
begin
    update public.coding_contests
    set status = case
        when now() < start_time then 'UPCOMING'
        when now() between start_time and end_time then 'ONGOING'
        else 'ENDED'
    end
    where id = new.id;
    return new;
end;
$$ language plpgsql security definer;

create trigger update_contest_status_trigger
    after insert or update of start_time, end_time
    on public.coding_contests
    for each row
    execute function public.update_contest_status();

-- Create function to update participant count
create or replace function public.update_participant_count()
returns trigger as $$
begin
    update public.coding_contests
    set participant_count = (
        select count(*)
        from public.contest_participants
        where contest_id = new.contest_id
    )
    where id = new.contest_id;
    return new;
end;
$$ language plpgsql security definer;

create trigger update_participant_count_trigger
    after insert or delete
    on public.contest_participants
    for each row
    execute function public.update_participant_count();

-- Create function to update problem statistics
create or replace function public.update_problem_stats()
returns trigger as $$
begin
    update public.coding_problems
    set
        solved_count = (
            select count(distinct user_id)
            from public.contest_submissions
            where problem_id = new.problem_id
            and status = 'ACCEPTED'
        ),
        attempted_count = (
            select count(distinct user_id)
            from public.contest_submissions
            where problem_id = new.problem_id
        )
    where id = new.problem_id;
    return new;
end;
$$ language plpgsql security definer;

create trigger update_problem_stats_trigger
    after insert
    on public.contest_submissions
    for each row
    execute function public.update_problem_stats();
