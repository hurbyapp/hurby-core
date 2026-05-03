-- =====================================
-- TRIGGERS (MANUAL EXTRACTION - SAFE)
-- =====================================

-- DROPS
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
DROP TRIGGER IF EXISTS set_updated_at_buyer_profiles ON public.buyer_profiles;
DROP TRIGGER IF EXISTS trg_update_agent_stats_on_lead_change ON public.leads;
DROP TRIGGER IF EXISTS trg_validate_lead_before_update ON public.leads;


-- RECRIAÇÃO

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_buyer_profiles
BEFORE UPDATE ON public.buyer_profiles
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_update_agent_stats_on_lead_change
AFTER UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_agent_stats_on_lead_change();

CREATE TRIGGER trg_validate_lead_before_update
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION validate_lead_before_update();