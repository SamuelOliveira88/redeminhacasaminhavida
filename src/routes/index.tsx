import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    throw redirect({ href: "/rede-mcmv/index.html", reloadDocument: true });
  },
  head: () => ({
    meta: [
      { title: "Rede Minha Casa Minha Vida" },
      { name: "description", content: "Empreendimentos do programa Minha Casa Minha Vida em Taboão da Serra e São Paulo." },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Rede Minha Casa Minha Vida" },
      { property: "og:description", content: "Empreendimentos do programa Minha Casa Minha Vida em Taboão da Serra e São Paulo." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

