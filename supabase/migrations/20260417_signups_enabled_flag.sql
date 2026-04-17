-- Admin-togglable flag to disable new signups.
-- This is an app-level disable: hides the signup UI and marks any
-- direct-API signups as unapproved, suppressing the email notification.
-- It does NOT toggle Supabase's built-in signup endpoint (that requires
-- a Management API PAT); to hard-disable at the auth layer, use the
-- Supabase Dashboard.

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

INSERT INTO public.app_config (key, value)
VALUES ('signups_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app config" ON public.app_config;
CREATE POLICY "Public read app config"
  ON public.app_config
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins update app config" ON public.app_config;
CREATE POLICY "Admins update app config"
  ON public.app_config
  FOR UPDATE
  TO public
  USING (is_life_planner_admin())
  WITH CHECK (is_life_planner_admin());

GRANT SELECT ON public.app_config TO anon, authenticated;
GRANT UPDATE ON public.app_config TO authenticated;

-- Update handle_new_user to respect the flag:
-- - Admin-list emails (Mekoce, sister) always pass through approved+admin.
-- - Everyone else: approved iff signups_enabled = true.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  signups_on boolean;
  is_admin_email boolean := NEW.email IN ('mekoce@gmail.com', 'klowdog@drlowdog.com');
BEGIN
  BEGIN
    SELECT COALESCE((value #>> '{}')::boolean, true)
      INTO signups_on
      FROM public.app_config
      WHERE key = 'signups_enabled';
    signups_on := COALESCE(signups_on, true);

    INSERT INTO public.user_approvals (user_id, email, approved, is_admin)
    VALUES (
      NEW.id,
      NEW.email,
      CASE WHEN is_admin_email THEN true
           WHEN signups_on THEN true
           ELSE false
      END,
      is_admin_email
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: % %', SQLSTATE, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Update notification trigger: skip the email when signups are disabled
-- (to avoid notification spam if someone is hammering the signup endpoint).
CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault', 'extensions'
AS $function$
DECLARE
  api_key text;
  payload jsonb;
  new_email text := COALESCE(NEW.email, '(unknown email)');
  signups_on boolean;
BEGIN
  IF new_email = 'mekoce@gmail.com' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE((value #>> '{}')::boolean, true)
    INTO signups_on
    FROM public.app_config
    WHERE key = 'signups_enabled';
  IF COALESCE(signups_on, true) = false THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO api_key
    FROM vault.decrypted_secrets
    WHERE name = 'resend_api_key';
  IF api_key IS NULL THEN
    RAISE WARNING 'notify_admin_on_signup: resend_api_key missing from vault';
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'from', 'Retirement Planner <notifications@ieppulse.com>',
    'to', jsonb_build_array('mekoce@gmail.com'),
    'subject', format('New signup: %s', new_email),
    'html', format(
      '<p><strong>%s</strong> just signed up for the retirement planner and was auto-approved.</p>'
      '<p>If you don''t want them to have access, delete them from the admin dashboard:</p>'
      '<p><a href="https://life.mekoce.com/#/admin">https://life.mekoce.com/#/admin</a></p>'
      '<p style="color:#888;font-size:0.85em">User ID: %s</p>',
      new_email,
      NEW.user_id
    )
  );

  PERFORM net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    ),
    body    := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_admin_on_signup failed: % %', SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$function$;
