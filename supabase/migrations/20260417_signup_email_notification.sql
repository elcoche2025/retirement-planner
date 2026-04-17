-- Email Mekoce via Resend whenever a new user signs up.
-- Uses pg_net (async HTTP) + Supabase Vault for the API key.

-- Store the Resend API key in Vault. Replace this with vault.update_secret
-- if rotating; never commit the real key to the repo.
-- (Applied 2026-04-17. Real call issued out-of-band via supabase-sql.)

-- CREATE EXTENSION IF NOT EXISTS pg_net;  -- already installed

-- SELECT vault.create_secret(
--   '<resend api key>',
--   'resend_api_key',
--   'Resend transactional email API key for retirement-planner signup alerts'
-- );

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
BEGIN
  -- Don't email Mekoce about Mekoce's own account.
  IF new_email = 'mekoce@gmail.com' THEN
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

DROP TRIGGER IF EXISTS notify_admin_on_signup_trigger ON public.user_approvals;
CREATE TRIGGER notify_admin_on_signup_trigger
  AFTER INSERT ON public.user_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_signup();
