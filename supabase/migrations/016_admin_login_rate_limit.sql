-- Create admin login attempts tracking table
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    ip_address text,
    success boolean NOT NULL,
    reason text,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for fast failed-login counts (Rate limiting)
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_recent 
ON public.admin_login_attempts(email, ip_address, attempted_at) 
WHERE success = false;

-- Add RLS rules (Only service role can access)
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to login attempts"
    ON public.admin_login_attempts
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to record a login attempt
CREATE OR REPLACE FUNCTION public.record_admin_login_attempt(
    p_email text,
    p_ip text,
    p_success boolean,
    p_reason text
) RETURNS void AS $$
BEGIN
    INSERT INTO public.admin_login_attempts (email, ip_address, success, reason)
    VALUES (p_email, p_ip, p_success, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit (Max 5 failed attempts in 15 minutes)
CREATE OR REPLACE FUNCTION public.check_admin_login_rate_limit(
    p_email text,
    p_ip text
) RETURNS boolean AS $$
DECLARE
    recent_failures integer;
BEGIN
    -- Check if there are 5 or more failed attempts in the last 15 minutes for this email or IP
    SELECT count(*) INTO recent_failures
    FROM public.admin_login_attempts
    WHERE success = false
      AND (email = p_email OR ip_address = p_ip)
      AND attempted_at > now() - interval '15 minutes';

    RETURN recent_failures < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
