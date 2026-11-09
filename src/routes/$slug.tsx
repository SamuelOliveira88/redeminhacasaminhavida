import { createFileRoute } from "@tanstack/react-router";
import { paginasCorretores } from "../generated/corretores-pages";

function normaliza(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Route = createFileRoute("/$slug")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const html = paginasCorretores[normaliza(params.slug)];
        if (!html) {
          return new Response("Página não encontrada", { status: 404 });
        }
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  },
});
