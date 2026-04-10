ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS user_message TEXT DEFAULT '';
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS models TEXT[] DEFAULT '{}';