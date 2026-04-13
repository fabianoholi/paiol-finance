# TODO · Migrar para repo próprio

> Esta pasta `zegrana/` mora temporariamente dentro do repo `fabianoholi/paiol-finance`
> porque a sessão de scaffold inicial não tinha permissão pra criar um repo novo no
> GitHub via MCP. Precisamos extraí-la pra um repo próprio **antes** do lançamento
> público, pra evitar mistura entre o ERP interno da Paiol Mídias (neste repo) e o
> SaaS público Zé Grana.

## Passos (quando migrar)

1. Criar repo novo no GitHub: **`fabianoholi/ze-grana`** (privado inicialmente).
2. Copiar o conteúdo de `zegrana/` pra raiz do novo repo preservando histórico:
   ```bash
   # Dentro do repo paiol-finance
   git subtree split --prefix=zegrana -b temp-zegrana
   # No novo clone do repo ze-grana vazio
   git fetch ../paiol-finance temp-zegrana
   git merge FETCH_HEAD --allow-unrelated-histories
   ```
3. Remover `zegrana/` deste repo:
   ```bash
   git rm -r zegrana
   git commit -m "chore: extrai zegrana para repo próprio"
   ```
4. Configurar Vercel apontando pro novo repo.
5. Configurar secrets em Vercel: todas as envs de `.env.example`.
6. Apontar domínio `zegrana.com.br` pro projeto Vercel.
7. Configurar deploy protection + branch `main` como produção.
8. Ajustar webhooks (Telegram, Evolution API, Kirvano) pra novo domínio.

## Checklist de bloqueadores

- [ ] Registrar INPI do nome "Zé Grana" (pesquisar conflito antes)
- [ ] Registrar domínio `zegrana.com.br` (Registro.br)
- [ ] Conta business Meta verificada (pra migração futura WhatsApp Cloud API)
- [ ] Conta Kirvano criada + produtos cadastrados (anual R$97, mensal R$17, order bumps)
- [ ] CNPJ e dados bancários pra receber faturamento
- [ ] LGPD: termos + política de privacidade redigidos (advogado)
- [ ] Evolution API em VPS (Hetzner/Contabo) com número WhatsApp dedicado
