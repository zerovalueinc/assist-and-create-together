-- Migration: Sync Intel report user_id with GTM Playbooks user_id
UPDATE public.company_analyzer_outputs
SET user_id = (SELECT user_id FROM public.gtm_playbooks LIMIT 1)
WHERE user_id IS DISTINCT FROM (SELECT user_id FROM public.gtm_playbooks LIMIT 1); 