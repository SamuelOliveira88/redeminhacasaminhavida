<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Regras do projeto

- As páginas de corretor são geradas: `public/rede-mcmv/corretores.json` é a fonte da verdade e `scripts/gerar-paginas-corretores.mjs` produz `public/<slug>/index.html`. Nunca edite essas páginas geradas à mão — edite o template `public/rede-mcmv/index.html` ou o JSON e regere (o script apaga pastas de corretores removidos).
- Motivo: as cópias geradas são sobrescritas a cada regeração, então qualquer ajuste feito nelas se perde.

