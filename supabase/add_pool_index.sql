create index if not exists lessons_pool_idx
  on lessons (requested_topic, enjoyment, created_at desc)
  where enjoyment >= 4;
