-- Run in Supabase SQL Editor to enable: reply-to, media attachments

-- 1. Reply-to column
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.direct_messages(id);

-- 2. Media attachment columns
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS media_url  TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT,
  ADD COLUMN IF NOT EXISTS media_name TEXT;

-- 3. Storage bucket for chat media (run separately if bucket already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload chat media'
  ) THEN
    CREATE POLICY "Authenticated users can upload chat media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'chat-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Chat media is publicly readable'
  ) THEN
    CREATE POLICY "Chat media is publicly readable"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'chat-media');
  END IF;
END $$;
