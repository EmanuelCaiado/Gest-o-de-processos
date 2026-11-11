# Marca e sessao de acesso

Status: Ready for Review (implementacao local; ativacao em producao pendente)

## Aceite
- [x] Logo fornecida aplicada no login, barra lateral, favicon, icone de dispositivo e metadados de compartilhamento.
- [x] Login sem lista/sugestoes de contas ou preenchimento de credenciais; apenas usuario e senha.
- [x] Primeiro acesso sem sessao valida mostra login, sem aceitar usuario salvo no localStorage como prova de identidade.
- [x] Sessao lembrada neste navegador por cookie assinado, HttpOnly, SameSite=Lax e Secure em HTTPS; logout limpa a sessao.
- [x] Trocar integrante exige a senha do destino e nao muda a conta se houver erro/cancelamento.
- [x] Contas e senhas existentes preservadas no servidor, sem senha no bundle cliente.
- [x] Testes de sessao adulterada/expirada, senha incorreta, troca, logout e build executados.

## Escopo
Preservar funcionalidades e usuarios atuais. Nao inclui migracao do banco Supabase nem correcao das falhas de persistencia identificadas. Trabalho nesta conversa, sem novos agentes e sem Astra.

## Publicacao
O backend de sessao requer SESSION_SECRET aleatoria de pelo menos 32 caracteres no servidor/Vercel. Nunca versionar seu valor. Nao usar chave publica ou segredo exposto como chave de assinatura.

Tambem requer RX_EMANUEL_PASSWORD, RX_RENAN_PASSWORD e RX_VITOR_PASSWORD privadas com os valores existentes. Configuradas no .env local ignorado; configuracao da Vercel nao acessivel nesta sessao. Nenhum push/deploy desta story ate essa preparacao. Ver `docs/access-session.md` para evidencias, limites e passos de ativacao.

## Validacao

TypeScript aprovado; 10 testes aprovados (6 de autenticacao e 4 de metricas); build aprovado; diff sem erros de whitespace. Verificacao privada confirmou as 3 senhas existentes preservadas no .env, nenhuma senha/segredo no bundle cliente e hash da logo identico ao arquivo fornecido. Fluxos de login, recarga, localStorage forjado, troca incorreta/correta, recarga apos troca e logout verificados no navegador Orca com fixture isolada. Cancelamento nao envia solicitacao de troca, verificado no codigo; nao houve teste de cancelamento por clique. Nenhuma revisao independente/CodeRabbit executada. Persistencia remota permanece fora deste aceite.

## File list

- `.env.example` (nomes das variaveis; valores privados somente no .env ignorado)
- `index.html`
- `public/rx-logo.png`
- `public/site.webmanifest`
- `src/components/BrandLogo.tsx`
- `src/App.tsx`
- `src/components/Sidebar.tsx`
- `src/context/DataContext.tsx`
- `src/data/seedData.ts`
- `src/lib/auth.ts`
- `server/auth.ts`
- `server/auth.test.ts`
- `api/auth.ts`
- `server.ts`
- `docs/access-session.md`
- `docs/stories/branding-and-session.md`

O diff preexistente de data/database.json nao faz parte desta story e foi preservado.
