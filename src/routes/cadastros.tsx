import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  interesse: string | null;
  empreendimento: string | null;
  origem_pagina: string | null;
  created_at: string;
};

export const Route = createFileRoute("/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros — Rede Minha Casa Minha Vida" },
      { name: "description", content: "Consulta dos cadastros de interesse recebidos pelo site." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CadastrosPage,
});

function CadastrosPage() {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsError, setLeadsError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) setLeadsError("Não foi possível carregar os cadastros.");
        else setLeads((data as Lead[]) ?? []);
      });
  }, [session]);

  async function handleLogin(ev: React.FormEvent) {
    ev.preventDefault();
    setAuthError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setAuthError("E-mail ou senha incorretos.");
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f5f1e8",
    fontFamily: "system-ui, sans-serif",
    padding: "24px 16px",
  };
  const cardStyle: React.CSSProperties = {
    maxWidth: 420,
    margin: "80px auto",
    background: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 4px 24px rgba(0,0,0,.08)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 12,
    border: "1px solid #d6cfc0",
    borderRadius: 8,
    fontSize: 16,
    boxSizing: "border-box",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: 14,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  };

  if (session === null) return <div style={pageStyle} />;

  if (!session) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Cadastros do site</h1>
          <p style={{ color: "#6b6455", margin: "0 0 20px", fontSize: 14 }}>
            Entre com seu e-mail e senha para ver os cadastros recebidos.
          </p>
          <form onSubmit={handleLogin}>
            <input
              style={inputStyle}
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && <p style={{ color: "#b91c1c", fontSize: 14 }}>{authError}</p>}
            <button style={btnStyle} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Cadastros recebidos ({leads.length})</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ ...btnStyle, width: "auto", padding: "10px 18px", background: "#6b6455" }}
          >
            Sair
          </button>
        </div>
        {leadsError && <p style={{ color: "#b91c1c" }}>{leadsError}</p>}
        {loading && <p>Carregando...</p>}
        {!loading && leads.length === 0 && !leadsError && (
          <p style={{ color: "#6b6455", marginTop: 24 }}>Nenhum cadastro ainda. Os próximos envios do formulário do site aparecem aqui.</p>
        )}
        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          {leads.map((l) => (
            <div key={l.id} style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <strong style={{ fontSize: 17 }}>{l.nome}</strong>
                <span style={{ color: "#6b6455", fontSize: 13 }}>
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 15 }}>
                <a href={`https://wa.me/55${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#16a34a", fontWeight: 700 }}>
                  {l.whatsapp}
                </a>
              </div>
              <div style={{ marginTop: 6, fontSize: 14, color: "#44403c" }}>
                {l.empreendimento && <div>Empreendimento: <strong>{l.empreendimento}</strong></div>}
                {l.interesse && <div>Interesse: {l.interesse}</div>}
                <div>Origem: {l.origem_pagina === "principal" ? "Página principal" : `Página do corretor: ${l.origem_pagina}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
