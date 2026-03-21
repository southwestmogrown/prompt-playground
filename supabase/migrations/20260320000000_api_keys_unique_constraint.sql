-- Add unique constraint on (user_id, provider) in api_keys.
-- Required for the upsert in /api/keys POST to resolve conflicts correctly.
-- Without this, Postgres rejects ON CONFLICT (user_id, provider) at runtime.
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_user_id_provider_key UNIQUE (user_id, provider);
