-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  age TEXT,
  conditions JSONB,
  medications JSONB,
  medical_notes TEXT,
  location JSONB,
  records JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT,
  messages JSONB,
  isSmartName BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  shared_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Public access to shared sessions is strictly mediated via get_shared_session RPC to prevent mass data harvesting
-- Direct SELECT on sessions table is restricted to authenticated owners only
CREATE OR REPLACE FUNCTION public.get_shared_session(p_share_token TEXT)
RETURNS TABLE (
  name TEXT,
  messages JSONB,
  shared_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT name, messages, shared_at
  FROM public.sessions
  WHERE share_token = p_share_token
    AND share_token IS NOT NULL
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_shared_session(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_session(TEXT) TO anon, authenticated;

CREATE POLICY "Users can view their own sessions."
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions."
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions."
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions."
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Wearable Readings
CREATE TABLE IF NOT EXISTS public.wearable_readings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  source      TEXT NOT NULL,          -- 'manual', 'google_fit', 'apple_health', 'garmin', 'fitbit'
  reading_date DATE NOT NULL,
  steps       INTEGER,
  heart_rate  INTEGER,
  hrv         NUMERIC,                -- Heart Rate Variability in ms
  spo2        NUMERIC,                -- Blood oxygen %
  weight_kg   NUMERIC,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  sleep_min   INTEGER,                -- Minutes of sleep from wearable
  calories    INTEGER,
  raw_payload JSONB,                  -- Full raw API response stored for future use
  synced_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.wearable_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own readings."
  ON public.wearable_readings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings."
  ON public.wearable_readings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add connected devices and syncing preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS connected_devices JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS syncing_devices JSONB DEFAULT '{}';

-- Wearable Tokens
CREATE TABLE IF NOT EXISTS public.wearable_tokens (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider    TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at  TIMESTAMP WITH TIME ZONE,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.wearable_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens."
  ON public.wearable_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens."
  ON public.wearable_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens."
  ON public.wearable_tokens FOR UPDATE USING (auth.uid() = user_id);

-- Checkups
CREATE TABLE IF NOT EXISTS public.checkups (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  doctor       TEXT,
  date_logged  DATE NOT NULL DEFAULT CURRENT_DATE,
  next_visit   DATE,
  notes        TEXT,
  source       TEXT DEFAULT 'manual',
  reminded_5d  BOOLEAN DEFAULT FALSE,
  reminded_1d  BOOLEAN DEFAULT FALSE,
  reminded_1h  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.checkups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own checkups."
  ON public.checkups FOR ALL USING (auth.uid() = user_id);

-- Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name             TEXT NOT NULL,
  dosage           TEXT NOT NULL,
  frequency        TEXT NOT NULL,
  times            JSONB NOT NULL DEFAULT '[]'::jsonb,
  with_food        BOOLEAN DEFAULT FALSE,
  category         TEXT DEFAULT 'Prescription',
  instructions     TEXT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date         DATE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own medications."
  ON public.medications FOR ALL USING (auth.uid() = user_id);

-- Medication Adherence Logs Table
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  medication_id    UUID REFERENCES public.medications ON DELETE CASCADE NOT NULL,
  medication_name  TEXT NOT NULL,
  dosage           TEXT NOT NULL,
  scheduled_date   DATE NOT NULL,
  scheduled_time   TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'snoozed')),
  action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  notes            TEXT
);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own medication logs."
  ON public.medication_logs FOR ALL USING (auth.uid() = user_id);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  author_name    TEXT NOT NULL,
  content        TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'General',
  likes_count    INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read community posts."
  ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own community posts."
  ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own community posts."
  ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community Groups Table
CREATE TABLE IF NOT EXISTS public.community_groups (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  members_count INTEGER DEFAULT 1,
  category      TEXT DEFAULT 'Wellness',
  icon          TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read community groups."
  ON public.community_groups FOR SELECT TO authenticated USING (true);

-- Community Group Messages Table
CREATE TABLE IF NOT EXISTS public.community_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id    UUID REFERENCES public.community_groups ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read messages in groups."
  ON public.community_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send messages to groups."
  ON public.community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);


