-- Auto-approve all new signups. Admin flag stays restricted.
-- Mekoce retains the ability to delete users via the Admin UI,
-- and the ability to disable new signups via Supabase Dashboard →
-- Authentication → Providers → Email → "Allow new users to sign up".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.user_approvals (user_id, email, approved, is_admin)
    VALUES (
      NEW.id,
      NEW.email,
      true,
      CASE WHEN NEW.email IN ('mekoce@gmail.com', 'klowdog@drlowdog.com') THEN true ELSE false END
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: % %', SQLSTATE, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Approve existing pending users now that the policy is auto-approve.
UPDATE public.user_approvals SET approved = true WHERE approved = false;
