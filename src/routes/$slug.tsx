import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import registry from "../../public/rede-mcmv/corretores.json";

type Corretor = { nome: string; slug: string; telefone: string };

const corretores = (registry.corretores ?? []) as Corretor[];

function normaliza(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const slug = normaliza(params.slug);
    const broker = corretores.find((c) => normaliza(c.slug || c.nome) === slug);
    if (!broker) throw notFound();
    throw redirect({ href: `/${slug}/index.html`, reloadDocument: true });
  },
});
