alter table lessons add column if not exists requested_topic text not null default 'random';
