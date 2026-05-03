


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_credits"("p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin

  if p_amount <= 0 then
    raise exception 'Valor inválido';
  end if;

  insert into public.credit_transactions (
    user_id,
    type,
    amount,
    origin
  ) values (
    auth.uid(),
    'credit',
    p_amount,
    'manual_credit'
  );

end;
$$;


ALTER FUNCTION "public"."add_credits"("p_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin

  if p_amount <= 0 then
    raise exception 'Valor inválido';
  end if;

  insert into public.credit_transactions (
    user_id,
    type,
    amount,
    origin
  ) values (
    p_user_id,
    'credit',
    p_amount,
    'manual_credit'
  );

end;
$$;


ALTER FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (auth_id, name, user_role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'), 'client');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unlock_lead"("p_lead_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_balance integer;
  v_cost integer := 1;
  v_assigned uuid;
begin

  -- 1. LOCK DO USUÁRIO
  perform id
  from auth.users
  where id = v_user_id
  for update;

  -- 2. LOCK DO LEAD
  select assigned_to_agent_id
  into v_assigned
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'Lead não encontrado';
  end if;

  -- 3. IDEMPOTÊNCIA E CONCORRÊNCIA
  if v_assigned = v_user_id then
    return;
  end if;

  if v_assigned is not null and v_assigned <> v_user_id then
    raise exception 'LEAD_UNAVAILABLE';
  end if;

  -- 4. VERIFICAÇÃO DE SALDO
  select balance
  into v_balance
  from public.user_wallet_balances
  where user_id = v_user_id;

  if v_balance is null then
    v_balance := 0;
  end if;

  if v_balance < v_cost then
    raise exception 'Saldo insuficiente';
  end if;

  -- 5. DÉBITO
  insert into public.credit_transactions (
    user_id,
    type,
    amount,
    origin,
    reference_id
  ) values (
    v_user_id,
    'debit',
    v_cost,
    'lead_unlock',
    p_lead_id
  );

  -- 6. ATRIBUIÇÃO DO LEAD
  update public.leads
  set assigned_to_agent_id = v_user_id
  where id = p_lead_id;

  -- 7. SUCESSO
  return;

end;
$$;


ALTER FUNCTION "public"."unlock_lead"("p_lead_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unlock_lead_test"("p_lead_id" "uuid", "p_agent_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_free_credits INTEGER;
BEGIN

SELECT free_credits INTO v_free_credits
FROM public.profiles
WHERE id = p_agent_id;

IF EXISTS (
    SELECT 1 FROM public.lead_unlocks
    WHERE agent_id = p_agent_id
    AND lead_id = p_lead_id
) THEN
    RETURN 'already_unlocked';
END IF;

IF v_free_credits > 0 THEN

    UPDATE public.profiles
    SET free_credits = free_credits - 1
    WHERE id = p_agent_id;

    INSERT INTO public.lead_unlocks (agent_id, lead_id)
    VALUES (p_agent_id, p_lead_id);

    RETURN 'unlocked_with_free_credit';

ELSE
    RETURN 'no_credits';
END IF;

END;
$$;


ALTER FUNCTION "public"."unlock_lead_test"("p_lead_id" "uuid", "p_agent_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_agent_stats_on_lead_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN IF TG_OP = 'UPDATE' AND OLD.lead_status <> NEW.lead_status AND NEW.lead_status = 'closed' THEN UPDATE public.agent_stats SET total_leads_converted = total_leads_converted + 1, last_updated = NOW() WHERE agent_id = NEW.assigned_to_agent_id; END IF; RETURN NEW; END; $$;


ALTER FUNCTION "public"."update_agent_stats_on_lead_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_lead_before_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN

IF NEW.lead_status = 'closed' AND NEW.assigned_to_agent_id IS NULL THEN
RAISE EXCEPTION 'Lead precisa ter um agente atribuído antes de ser fechado';
END IF;

RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."validate_lead_before_update"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agent_stats" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "agent_id" "uuid",
    "total_leads_received" integer DEFAULT 0,
    "total_leads_converted" integer DEFAULT 0,
    "conversion_rate" numeric(5,2) DEFAULT 0.00,
    "rating" numeric(3,2) DEFAULT 0.00,
    "ranking_points" integer DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agent_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buyer_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "preferred_cities" "text"[],
    "preferred_neighborhoods" "text"[],
    "property_types" "text"[],
    "min_price" numeric(15,2),
    "max_price" numeric(15,2),
    "min_bedrooms" integer,
    "min_bathrooms" integer,
    "min_parking_spots" integer,
    "features_interest" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."buyer_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."credit_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "origin" "text" NOT NULL,
    "reference_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "credit_transactions_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "credit_transactions_type_check" CHECK (("type" = ANY (ARRAY['credit'::"text", 'debit'::"text"])))
);


ALTER TABLE "public"."credit_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_unlocks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "agent_id" "uuid",
    "lead_id" "uuid",
    "unlocked_at" timestamp with time zone DEFAULT "now"(),
    "cost" numeric(10,2) DEFAULT 0.00,
    "user_id" "uuid"
);


ALTER TABLE "public"."lead_unlocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_id" "uuid",
    "client_id" "uuid",
    "client_name" "text" NOT NULL,
    "client_email" "text" NOT NULL,
    "client_phone" "text",
    "assigned_to_agent_id" "uuid",
    "lead_status" "text" DEFAULT 'new'::"text" NOT NULL,
    "source" "text",
    "client_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "qualified_by_admin_id" "uuid",
    "client_city" "text",
    "client_neighborhood" "text",
    "agent_tag" "text",
    "lead_type" "text" DEFAULT 'generic'::"text",
    "target_agent_id" "uuid",
    CONSTRAINT "leads_lead_status_check" CHECK (("lead_status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'negotiating'::"text", 'closed'::"text", 'lost'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_vitrine" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "client_city",
    NULL::"text" AS "client_neighborhood",
    NULL::timestamp with time zone AS "created_at",
    NULL::"text" AS "lead_type",
    NULL::bigint AS "total_unlocks",
    NULL::"text" AS "availability_status";


ALTER VIEW "public"."leads_vitrine" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portal_exports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_id" "uuid",
    "portal_name" "text" NOT NULL,
    "external_id" "text",
    "export_status" "text" DEFAULT 'pending'::"text",
    "last_export_at" timestamp with time zone,
    "error_message" "text"
);


ALTER TABLE "public"."portal_exports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "user_role" "text" NOT NULL,
    "avatar_url" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "free_credits" integer DEFAULT 10,
    CONSTRAINT "profiles_user_role_check" CHECK (("user_role" = ANY (ARRAY['admin'::"text", 'agent'::"text", 'client'::"text", 'manager'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "property_type" "text" NOT NULL,
    "status" "text" DEFAULT 'available'::"text" NOT NULL,
    "address_street" "text",
    "address_number" "text",
    "address_neighborhood" "text" NOT NULL,
    "address_city" "text" NOT NULL,
    "address_state" "text" NOT NULL,
    "address_zipcode" "text",
    "price" numeric(15,2) NOT NULL,
    "area_total" numeric(10,2),
    "area_useful" numeric(10,2),
    "bedrooms" integer DEFAULT 0,
    "bathrooms" integer DEFAULT 0,
    "parking_spots" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "views_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "boost_score" integer DEFAULT 0,
    "boost_expiration" timestamp with time zone,
    "property_purpose" "text",
    CONSTRAINT "properties_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'rented'::"text", 'sold'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_boosts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_id" "uuid",
    "boost_type" "text",
    "start_date" timestamp with time zone DEFAULT "now"(),
    "end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "property_boosts_boost_type_check" CHECK (("boost_type" = ANY (ARRAY['highlight'::"text", 'super_highlight'::"text", 'boost'::"text"])))
);


ALTER TABLE "public"."property_boosts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_wallet_balances" WITH ("security_invoker"='true') AS
 SELECT "user_id",
    COALESCE("sum"(
        CASE
            WHEN ("type" = 'credit'::"text") THEN "amount"
            WHEN ("type" = 'debit'::"text") THEN (- "amount")
            ELSE NULL::integer
        END), (0)::bigint) AS "balance"
   FROM "public"."credit_transactions"
  GROUP BY "user_id";


ALTER VIEW "public"."user_wallet_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "openId" character varying(64) NOT NULL,
    "name" "text",
    "email" character varying(320),
    "loginMethod" character varying(64),
    "role" "public"."role" DEFAULT 'user'::"public"."role" NOT NULL,
    "createdAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "lastSignedIn" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."agent_stats"
    ADD CONSTRAINT "agent_stats_agent_id_key" UNIQUE ("agent_id");



ALTER TABLE ONLY "public"."agent_stats"
    ADD CONSTRAINT "agent_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."buyer_profiles"
    ADD CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credit_transactions"
    ADD CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "lead_unlocks_agent_id_lead_id_key" UNIQUE ("agent_id", "lead_id");



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "lead_unlocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portal_exports"
    ADD CONSTRAINT "portal_exports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portal_exports"
    ADD CONSTRAINT "portal_exports_property_id_portal_name_key" UNIQUE ("property_id", "portal_name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_boosts"
    ADD CONSTRAINT "property_boosts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_openId_unique" UNIQUE ("openId");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_credit_transactions_user_created" ON "public"."credit_transactions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_credit_txn_user_id" ON "public"."credit_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_leads_agent" ON "public"."leads" USING "btree" ("assigned_to_agent_id");



CREATE INDEX "idx_leads_assigned_agent" ON "public"."leads" USING "btree" ("assigned_to_agent_id");



CREATE INDEX "idx_leads_created_at" ON "public"."leads" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_leads_lead_status" ON "public"."leads" USING "btree" ("lead_status");



CREATE INDEX "idx_leads_property" ON "public"."leads" USING "btree" ("property_id");



CREATE INDEX "idx_leads_status" ON "public"."leads" USING "btree" ("lead_status");



CREATE INDEX "idx_properties_address_city" ON "public"."properties" USING "btree" ("address_city");



CREATE INDEX "idx_properties_address_neighborhood" ON "public"."properties" USING "btree" ("address_neighborhood");



CREATE INDEX "idx_properties_city" ON "public"."properties" USING "btree" ("address_city");



CREATE INDEX "idx_properties_neighborhood" ON "public"."properties" USING "btree" ("address_neighborhood");



CREATE INDEX "idx_properties_price" ON "public"."properties" USING "btree" ("price");



CREATE INDEX "idx_properties_property_type" ON "public"."properties" USING "btree" ("property_type");



CREATE INDEX "idx_properties_status" ON "public"."properties" USING "btree" ("status");



CREATE INDEX "idx_properties_type" ON "public"."properties" USING "btree" ("property_type");



CREATE INDEX "idx_property_boosts_active" ON "public"."property_boosts" USING "btree" ("is_active", "end_date");



CREATE UNIQUE INDEX "idx_unique_user_lead" ON "public"."credit_transactions" USING "btree" ("user_id", "reference_id") WHERE ("origin" = 'lead_unlock'::"text");



CREATE OR REPLACE VIEW "public"."leads_vitrine" WITH ("security_invoker"='true') AS
 SELECT "l"."id",
    "l"."client_city",
    "l"."client_neighborhood",
    "l"."created_at",
    "l"."lead_type",
    "count"("lu"."id") AS "total_unlocks",
        CASE
            WHEN ("count"("lu"."id") >= 3) THEN 'sold_out'::"text"
            ELSE 'available'::"text"
        END AS "availability_status"
   FROM ("public"."leads" "l"
     LEFT JOIN "public"."lead_unlocks" "lu" ON (("lu"."lead_id" = "l"."id")))
  WHERE ("l"."lead_status" = 'new'::"text")
  GROUP BY "l"."id";



CREATE OR REPLACE TRIGGER "set_updated_at_buyer_profiles" BEFORE UPDATE ON "public"."buyer_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trg_update_agent_stats_on_lead_change" AFTER UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_agent_stats_on_lead_change"();



CREATE OR REPLACE TRIGGER "trg_validate_lead_before_update" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."validate_lead_before_update"();



CREATE OR REPLACE TRIGGER "update_leads_updated_at" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_properties_updated_at" BEFORE UPDATE ON "public"."properties" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."agent_stats"
    ADD CONSTRAINT "agent_stats_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."buyer_profiles"
    ADD CONSTRAINT "buyer_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."credit_transactions"
    ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_profiles_auth_users" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "fk_unlocks_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "fk_unlocks_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "lead_unlocks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."lead_unlocks"
    ADD CONSTRAINT "lead_unlocks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assigned_to_agent_id_fkey" FOREIGN KEY ("assigned_to_agent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_qualified_by_admin_id_fkey" FOREIGN KEY ("qualified_by_admin_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."portal_exports"
    ADD CONSTRAINT "portal_exports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_boosts"
    ADD CONSTRAINT "property_boosts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



CREATE POLICY "Allow read leads for authenticated" ON "public"."leads" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read unlocks" ON "public"."lead_unlocks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select own unlocks" ON "public"."lead_unlocks" FOR SELECT USING (true);



CREATE POLICY "No direct insert" ON "public"."credit_transactions" FOR INSERT WITH CHECK (false);



CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Properties are viewable by everyone" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "Users can view own transactions" ON "public"."credit_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."agent_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."buyer_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lead_select_unlocked" ON "public"."leads" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."lead_unlocks" "lu"
  WHERE (("lu"."lead_id" = "leads"."id") AND ("lu"."agent_id" = "auth"."uid"())))));



ALTER TABLE "public"."lead_unlocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portal_exports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profile_select_public" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profile_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_boosts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "unlock_select_own" ON "public"."lead_unlocks" FOR SELECT USING (("agent_id" = "auth"."uid"()));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."add_credits"("p_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_credits"("p_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unlock_lead"("p_lead_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlock_lead"("p_lead_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."unlock_lead_test"("p_lead_id" "uuid", "p_agent_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."unlock_lead_test"("p_lead_id" "uuid", "p_agent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlock_lead_test"("p_lead_id" "uuid", "p_agent_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_agent_stats_on_lead_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_agent_stats_on_lead_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_agent_stats_on_lead_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_lead_before_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_lead_before_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_lead_before_update"() TO "service_role";


















GRANT ALL ON TABLE "public"."agent_stats" TO "anon";
GRANT ALL ON TABLE "public"."agent_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_stats" TO "service_role";



GRANT ALL ON TABLE "public"."buyer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."buyer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."buyer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."credit_transactions" TO "anon";
GRANT ALL ON TABLE "public"."credit_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."credit_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."lead_unlocks" TO "anon";
GRANT ALL ON TABLE "public"."lead_unlocks" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_unlocks" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."leads_vitrine" TO "anon";
GRANT ALL ON TABLE "public"."leads_vitrine" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_vitrine" TO "service_role";



GRANT ALL ON TABLE "public"."portal_exports" TO "anon";
GRANT ALL ON TABLE "public"."portal_exports" TO "authenticated";
GRANT ALL ON TABLE "public"."portal_exports" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



GRANT ALL ON TABLE "public"."property_boosts" TO "anon";
GRANT ALL ON TABLE "public"."property_boosts" TO "authenticated";
GRANT ALL ON TABLE "public"."property_boosts" TO "service_role";



GRANT ALL ON TABLE "public"."user_wallet_balances" TO "anon";
GRANT ALL ON TABLE "public"."user_wallet_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."user_wallet_balances" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































