CREATE TABLE prompt_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  system_prompt text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON prompt_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON prompt_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON prompt_templates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON prompt_templates
  FOR DELETE USING (auth.uid() = user_id);
