-- Run this if you already created the lessons table

alter table lessons add column if not exists image_url text;
