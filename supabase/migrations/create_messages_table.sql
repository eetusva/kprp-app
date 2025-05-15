/*
  # Create Messages Table

  This migration creates the `messages` table to store chat messages.
  This version includes DROP POLICY IF EXISTS for RLS policies to handle re-runs.

  1. New Tables
    - `messages`
      - `id` (uuid, primary key): Unique identifier for the message, defaults to a random UUID.
      - `user_id` (uuid, not null): Foreign key referencing `profiles.id`. Indicates who sent the message.
      - `content` (text, not null): The actual text content of the message.
      - `created_at` (timestamptz, not null, default now()): Timestamp of when the message was created.

  2. Security
    - Enables Row Level Security (RLS) on the `messages` table.
    - Drops existing policies if they exist before recreating them.
    - Policy "Authenticated users can view all messages.": Allows any authenticated user to read all messages.
    - Policy "Users can insert their own messages.": Allows authenticated users to create new messages, ensuring `user_id` matches their own ID.
    - Policy "Users can update their own messages.": Allows authenticated users to update their own messages.
    - Policy "Users can delete their own messages.": Allows authenticated users to delete their own messages.
    - Policy "Admins can update any message.": Allows users with the 'admin' role (checked via a subquery on `profiles`) to update any message.
    - Policy "Admins can delete any message.": Allows users with the 'admin' role to delete any message.

  3. Indexes
    - Creates an index on `user_id` for faster lookups of messages by user.
    - Creates an index on `created_at` for efficient sorting and querying by time.

  4. Important Notes
    - Messages are linked to users via the `profiles` table.
    - RLS policies ensure data integrity and proper access control.
*/

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.messages IS 'Stores chat messages.';
COMMENT ON COLUMN public.messages.id IS 'Unique identifier for the message.';
COMMENT ON COLUMN public.messages.user_id IS 'ID of the user who sent the message, references profiles.id.';
COMMENT ON COLUMN public.messages.content IS 'The text content of the message.';
COMMENT ON COLUMN public.messages.created_at IS 'Timestamp of when the message was created.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC); -- For fetching recent messages

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view all messages." ON public.messages;
CREATE POLICY "Authenticated users can view all messages."
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own messages." ON public.messages;
CREATE POLICY "Users can insert their own messages."
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own messages." ON public.messages;
CREATE POLICY "Users can update their own messages."
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages." ON public.messages;
CREATE POLICY "Users can delete their own messages."
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any message." ON public.messages;
CREATE POLICY "Admins can update any message."
  ON public.messages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  -- WITH CHECK is omitted for admin updates on other users' messages.

DROP POLICY IF EXISTS "Admins can delete any message." ON public.messages;
CREATE POLICY "Admins can delete any message."
  ON public.messages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));