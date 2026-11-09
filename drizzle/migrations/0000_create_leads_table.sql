CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  interesse TEXT,
  empreendimento TEXT,
  origem_pagina TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitante pode cadastrar" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Autenticado pode ver cadastros" ON public.leads FOR SELECT TO authenticated USING (true);