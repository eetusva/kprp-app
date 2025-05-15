/*
  # Create Profiles Table

  This migration creates the `profiles` table to store user-specific public information.
  It links to the `auth.users` table provided by Supabase authentication.
  This version includes DROP IF EXISTS for triggers, functions, and RLS policies to handle re-runs.

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key): References `auth.users.id`.
      - `username` (text, unique): User's display name.
      - `avatar_url` (text): URL for user's avatar.
      - `role` (text, not null, default 'kprpuser'): User's role ('admin' or 'kprpuser').
      - `updated_at` (timestamptz): Tracks last update time.

  2. Functions & Triggers
    - Drops `on_profile_update` trigger if it exists.
    - Drops `handle_profile_update` function if it exists.
    - Recreates `handle_profile_update` function to set `updated_at` on profile updates.
    - Recreates `on_profile_update` trigger.

  3. Security
    - Enables Row Level Security (RLS) on `profiles`.
    - Drops existing policies if they exist before recreating them.
    - Policies for viewing, inserting own, updating own, admin updates, and admin deletes.

  4. Indexes
    - Index on `username`.
*/

-- Attempt to drop the trigger and function if they exist to prevent errors on re-run
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_profile_update();

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  role text NOT NULL DEFAULT 'kprpuser',
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Stores public user profile information linked to auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'User ID, references auth.users.id.';
COMMENT ON COLUMN public.profiles.username IS 'Public display name for the user, must be unique.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s avatar image.';
COMMENT ON COLUMN public.profiles.role IS 'User role, e.g., ''admin'' or ''kprpuser''.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last profile update.';

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on update
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_profile_update();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to recreate them, ensuring they are up-to-date.
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete any profile." ON public.profiles;
CREATE POLICY "Admins can delete any profile."
  ON public.profiles FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));