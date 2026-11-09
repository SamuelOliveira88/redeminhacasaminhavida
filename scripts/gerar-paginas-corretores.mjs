// Gera uma página por corretor a partir de public/rede-mcmv/index.html
// Fonte da verdade: public/rede-mcmv/corretores.json
// Saída: public/<slug>/index.html  ->  redeminhacasaminhavida.com/<slug>/
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const SITE = join(PUBLIC, "rede-mcmv");
const REGISTRY = join(SITE, "corretores.json");
const MARKER = ".gerado-por-corretores";

const template = readFileSync(join(SITE, "index.html"), "utf8");
const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
const DEFAULT_PHONE = "5511973811001";

function slugify(raw) {
  return String(raw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function phoneDigits(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length < 10) throw new Error(`telefone inválido: ${raw}`);
  return d.startsWith("55") ? d : "55" + d;
}

function readable(digits) {
  const d = digits.replace(/^55/, "");
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function waHref(digits, msg) {
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(msg);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

const generated = new Set();
const paginas = new Map();

for (const broker of registry.corretores) {
  const nome = String(broker.nome || "").trim();
  const slug = slugify(broker.slug || nome);
  if (!nome || !slug) {
    console.warn("pulando entrada sem nome/slug:", broker);
    continue;
  }
  const phone = phoneDigits(broker.telefone);
  const legivel = readable(phone);

  let html = template;

  // 1. a página mora fora de /rede-mcmv/, então os arquivos precisam de caminho absoluto
  html = html.replaceAll("images/", "/rede-mcmv/images/");

  // 2. número matriz continua o mesmo; só a origem da página muda
  html = html.replace("var ORIGEM_PAGINA = '';", `var ORIGEM_PAGINA = ${JSON.stringify(nome)};`);

  // 5. título + descrição + compartilhamento (remove as do modelo para não duplicar)
  html = html.replace(/\s*<meta (name="description"|property="og:title"|property="og:description")[^>]*>/g, "");
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(nome)} | Rede Minha Casa Minha Vida</title>
    <meta name="description" content="Empreendimentos do programa Minha Casa Minha Vida com atendimento de ${esc(nome)}." />
    <meta property="og:title" content="${esc(nome)} | Rede Minha Casa Minha Vida" />
    <meta property="og:description" content="Empreendimentos do programa Minha Casa Minha Vida com atendimento de ${esc(nome)}." />
    <meta name="robots" content="noindex, follow" />`
  );

  // 6. faixa de atendimento logo abaixo do topo + estilo
  html = html.replace(
    "</style>",
    `      .broker-strip{
        background: linear-gradient(90deg, var(--deep), var(--deep-2));
        border-top: 1px solid rgba(242,169,59,.45);
        border-bottom: 1px solid rgba(242,169,59,.45);
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 14px;
      }
      .broker-strip span{
        font-size: 11px;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: var(--gold-2);
      }
      .broker-strip strong{ color: #fff; font-size: 17px; }
      .broker-strip em{
        font-style: normal;
        margin-left: auto;
        color: var(--gold-2);
        font-size: 14px;
      }
      .broker-strip a{ color: var(--gold-2); text-decoration: none; }
    </style>`
  );
  html = html.replace(
    "</header>",
    `</header>
    <div class="broker-strip">
      <span>Atendimento pessoal</span>
      <strong>${esc(nome)}</strong>
    </div>`
  );

  // 7. destaque na capa
  html = html.replace(
    '<div class="eyebrow sans">Programa Minha Casa Minha Vida</div>',
    `<div class="eyebrow sans">Programa Minha Casa Minha Vida · atendimento com ${esc(nome)}</div>`
  );

  // 8. rodapé com o contato do corretor
  html = html.replace(
    "Programa Minha Casa Minha Vida (MCMV) · Taboão da Serra e São Paulo",
    `Programa Minha Casa Minha Vida (MCMV) · Taboão da Serra e São Paulo · atendimento com ${esc(nome)}`
  );

  const dir = join(PUBLIC, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  writeFileSync(join(dir, MARKER), "gerado por scripts/gerar-paginas-corretores.mjs — não edite à mão\n");
  generated.add(slug);
  paginas.set(slug, html);
  console.log(`ok  /${slug}/  ->  ${nome}`);
}

// módulo TS com as páginas embutidas — a rota /$slug do app serve daqui (sem redirect)
const tsOut = [
  "// gerado por scripts/gerar-paginas-corretores.mjs — não edite à mão",
  "export const paginasCorretores: Record<string, string> = {",
  ...[...paginas].map(([slug, html]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(html)},`),
  "};",
  "",
];
mkdirSync(join(ROOT, "src", "generated"), { recursive: true });
writeFileSync(join(ROOT, "src", "generated", "corretores-pages.ts"), tsOut.join("\n"));
console.log(`ok  src/generated/corretores-pages.ts (${paginas.size} páginas)`);

// limpa pastas de corretores que saíram da lista (só remove as que este script criou)
for (const entry of readdirSync(PUBLIC)) {
  const full = join(PUBLIC, entry);
  if (!existsSync(join(full, MARKER))) continue;
  if (generated.has(entry)) continue;
  rmSync(full, { recursive: true, force: true });
  console.log(`removido /${entry}/`);
}
