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

-- Public can read shared sessions
CREATE POLICY "Public can view shared sessions."
  ON public.sessions FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);

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
