DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ver proprio papel" ON public.user_roles;
CREATE POLICY "Ver proprio papel" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) IN ('samuelrodrigodeoliveira@gmail.com','toni.boacasa@gmail.com')
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Autenticado pode ver cadastros" ON public.leads;
CREATE POLICY "Admin pode ver cadastros" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Visitante pode cadastrar" ON public.leads;
CREATE POLICY "Visitante pode cadastrar" ON public.leads FOR INSERT TO anon WITH CHECK (
  char_length(btrim(nome)) BETWEEN 1 AND 120
  AND whatsapp ~ '^[0-9()+ -]{8,25}$'
  AND (interesse IS NULL OR char_length(interesse) <= 100)
  AND (empreendimento IS NULL OR char_length(empreendimento) <= 200)
  AND (origem_pagina IS NULL OR char_length(origem_pagina) <= 100)
);