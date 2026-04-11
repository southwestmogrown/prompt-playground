-- Add name and tags to runs
ALTER TABLE public.runs ADD COLUMN name TEXT;
ALTER TABLE public.runs ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX runs_tags_idx ON public.runs USING GIN (tags);
