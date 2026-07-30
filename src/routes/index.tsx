import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    throw redirect({ href: "/rede-mcmv/index.html", reloadDocument: true });
  },
  head: () => ({
    meta: [
      { title: "Rede Minha Casa Minha Vida" },
      { name: "description", content: "Empreendimentos do programa Minha Casa Minha Vida em Taboão da Serra e São Paulo." },
    ],
  }),
});

