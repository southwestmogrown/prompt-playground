-- Initial schema: profiles, api_keys, runs
-- RLS enabled on all tables; users can only access their own rows.

-- profiles: mirrors auth.users, created automatically on signup via trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own row" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- api_keys: one row per user per provider, AES-256-GCM encrypted key stored
CREATE TABLE IF NOT EXISTS public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai')),
  encrypted_key TEXT NOT NULL,
  key_hint     TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys: select own rows" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "api_keys: insert own rows" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys: update own rows" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys: delete own rows" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- runs: saved playground runs; responses stored as JSONB array
CREATE TABLE IF NOT EXISTS public.runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  models        TEXT[] NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  user_message  TEXT NOT NULL,
  responses     JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runs: select own rows" ON public.runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "runs: insert own rows" ON public.runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runs: delete own rows" ON public.runs
  FOR DELETE USING (auth.uid() = user_id);
