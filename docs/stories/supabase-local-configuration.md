# Configuracao local do Supabase

Status: Done

## Pedido e aceite

Configurar as variaveis fornecidas pelo usuario e instalar `@supabase/server`, preservando o projeto e sem executar migracoes ou alterar dados remotos.

- [x] Variaveis de servidor carregadas a partir do arquivo local ignorado pelo Git.
- [x] Navegador recebe apenas configuracao publica; chave secreta permanece fora do codigo e do bundle.
- [x] Dependencia oficial instalada com lockfile consistente.
- [x] Tipagem, testes existentes e verificacao de bundle executados.
- [x] Limitacoes de conectividade e necessidade de rotacionar a chave compartilhada registradas sem revelar valores.

## Arquivos previstos

- `server.ts`
- `.env.example`
- `.env` (local, nao versionado)
- `package.json`
- `bun.lock`
- `docs/stories/supabase-local-configuration.md`

Nao inclui migracao de autenticacao, criacao de tabelas ou uso da chave administrativa em rotas publicas.

## Validacao

- `npm run lint`: passou (`tsc --noEmit`).
- `node --import tsx --test src/utils/metrics.test.ts`: 4/4 passaram.
- Build Vite com saida externa: passou; avisos preexistentes sobre `__dirname` e tamanho do bundle.
- Importacao real de `createSupabaseContext`: passou, SDK 1.9.2 instalado.
- Leitura das quatro variaveis de servidor via dotenv: passou, sem imprimir valores.
- Busca pelo valor secreto no bundle gerado: nenhuma ocorrencia; nao existe alias VITE para o segredo.
- `git check-ignore .env`: arquivo ignorado. Credenciais reais nao foram adicionadas a arquivos versionados.
- Consulta `clients` com `limit=0`, separadamente com chave publica e chave de servidor: ambas HTTP 404 / PGRST205. O endpoint da tabela nao esta disponivel na API REST; trocar a chave nao resolveu.
- Servidor local reiniciado; `/api/health` respondeu `status: ok`.
- Revisao independente Terra: dotenv e lockfile coerentes; precedencia JWKS ajustada para nao combinar SUPABASE_URL de servidor com JWKS VITE de outro projeto.

## Limites

A chave secreta compartilhada na conversa precisa ser revogada e substituida no arquivo local. Nao registrar seu valor em documentacao ou Git. A instalacao do SDK nao integra automaticamente o login existente nem cria tabelas. Nenhuma migracao ou gravacao remota de dados foi executada. A publicacao autorizada no GitHub inclui apenas codigo, exemplo de configuracao e esta documentacao; exclui `.env` e o banco operacional local.

Fontes oficiais consultadas em 2026-11-11:
- https://supabase.com/docs/guides/auth/choosing-a-server-package
- https://github.com/supabase/server/blob/main/docs/getting-started.md
- https://github.com/supabase/server/blob/main/docs/environment-variables.md
