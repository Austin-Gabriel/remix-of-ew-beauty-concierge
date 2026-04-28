-- Phase 2: persist Pro Profile + Settings to Lovable Cloud
-- Adds storefront-display fields to `professionals` and a new `pro_preferences`
-- table for app-level toggles (notifications, privacy, theme, language).

------------------------------------------------------------------
-- 1. Extend professionals with public profile / storefront fields
------------------------------------------------------------------
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS tagline       text,
  ADD COLUMN IF NOT EXISTS handle        text UNIQUE,
  ADD COLUMN IF NOT EXISTS neighborhood  text,
  ADD COLUMN IF NOT EXISTS base_address  text,
  ADD COLUMN IF NOT EXISTS instagram     text,
  ADD COLUMN IF NOT EXISTS tiktok        text,
  ADD COLUMN IF NOT EXISTS cover_url     text;

-- Optional handle format check (letters, numbers, dot, underscore, dash)
ALTER TABLE public.professionals
  DROP CONSTRAINT IF EXISTS professionals_handle_format;
ALTER TABLE public.professionals
  ADD  CONSTRAINT professionals_handle_format
  CHECK (handle IS NULL OR handle ~ '^[a-zA-Z0-9._-]{2,30}$');

------------------------------------------------------------------
-- 2. Per-Pro app preferences (settings page)
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pro_preferences (
  user_id              uuid PRIMARY KEY,
  -- appearance
  theme                text NOT NULL DEFAULT 'system'   CHECK (theme IN ('system','light','dark')),
  text_size            text NOT NULL DEFAULT 'default'  CHECK (text_size IN ('small','default','large','xlarge')),
  language             text NOT NULL DEFAULT 'en',
  -- notifications (per-channel toggles)
  notify_new_request          boolean NOT NULL DEFAULT true,
  notify_booking_confirmed    boolean NOT NULL DEFAULT true,
  notify_booking_reminders    boolean NOT NULL DEFAULT true,
  notify_booking_cancelled    boolean NOT NULL DEFAULT true,
  notify_client_reviews       boolean NOT NULL DEFAULT true,
  notify_new_messages         boolean NOT NULL DEFAULT true,
  notify_mentions             boolean NOT NULL DEFAULT true,
  notify_payouts_processed    boolean NOT NULL DEFAULT true,
  notify_payout_failed        boolean NOT NULL DEFAULT true,
  notify_marketing_tips       boolean NOT NULL DEFAULT false,
  notify_marketing_features   boolean NOT NULL DEFAULT false,
  mute_until                  timestamptz,
  -- privacy
  search_visible       boolean NOT NULL DEFAULT true,
  show_online_status   boolean NOT NULL DEFAULT true,
  show_last_active     boolean NOT NULL DEFAULT true,
  message_policy       text NOT NULL DEFAULT 'anyone' CHECK (message_policy IN ('anyone','confirmed','past')),
  -- timestamps
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pro_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prefs self all" ON public.pro_preferences;
CREATE POLICY "prefs self all"
  ON public.pro_preferences
  FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "prefs admin all" ON public.pro_preferences;
CREATE POLICY "prefs admin all"
  ON public.pro_preferences
  FOR ALL
  USING      (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger (reuses existing helper if present, else creates one)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS pro_preferences_updated_at ON public.pro_preferences;
CREATE TRIGGER pro_preferences_updated_at
  BEFORE UPDATE ON public.pro_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();