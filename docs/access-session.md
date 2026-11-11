# Acesso e identidade visual

A marca fornecida pelo usuario esta em `public/rx-logo.png`, sem transformacao. Login, barra lateral, favicon, icone Apple, manifesto e metadados usam essa imagem.

O primeiro acesso sem cookie valido apresenta somente usuario e senha. As sugestoes de integrantes foram retiradas do login; o seletor interno continua disponivel e exige a senha do integrante escolhido. Os identificadores existentes continuam aceitos por correspondencia exata, sem correspondencias parciais.

## Preparacao do servidor

Configurar privadamente, sem prefixo VITE_, no servidor e na Vercel (ambientes de destino):

- `SESSION_SECRET`: segredo aleatorio de pelo menos 32 caracteres, estavel entre instancias e deploys. Troca-lo invalida as sessoes existentes.
- `RX_EMANUEL_PASSWORD`, `RX_RENAN_PASSWORD`, `RX_VITOR_PASSWORD`: senhas existentes das respectivas contas. Os valores locais foram preservados no `.env` ignorado pelo Git; nao publicar esse arquivo.

O cookie `rx_workspace_session` dura 30 dias, e assinado com HMAC-SHA256 e tem HttpOnly, SameSite=Lax e Path=/. HTTPS/producao adiciona Secure. A sessao nao depende do usuario anteriormente salvo em localStorage. Logout limpa o cookie deste navegador; nao e uma revogacao central de outros navegadores. Limpar cookies, expirar a sessao ou trocar o segredo exige novo login.

Express atende `/api/auth`; `api/auth.ts` disponibiliza o mesmo handler como funcao Node na Vercel. As rotas locais `/api/data` e `/api/reset` exigem sessao. As senhas nao integram os usuarios retornados pela API nem o bundle cliente.

## Limites e publicacao

Este trabalho preserva o armazenamento existente. Nao cria tabelas no Supabase nem disponibiliza a API de arquivos na Vercel; o diagnostico anterior de persistencia continua aplicavel. O provedor deve oferecer protecao contra abuso/tentativas repetidas; nao ha limitador distribuido nesta implementacao.

A ativacao em producao depende das quatro variaveis privadas acima. Em 2026-11-11, apos o usuario autenticar a Vercel, as quatro foram salvas como Secret exclusivamente em Production no projeto gestaorx. O commit 6e97a8f foi enviado a main e a Vercel confirmou deploy concluido. Login das tres contas e restauracao de sessao foram verificados em https://gestaorx.vercel.app, com cookies Secure e HttpOnly e sem senha na resposta. Preview continua sem essas quatro variaveis; nao e um ambiente de login configurado.

## Evidencias de 2026-11-11

- `npm run lint`: TypeScript sem erros (este projeto nao tem script `typecheck` separado).
- `node --import tsx --test server/auth.test.ts src/utils/metrics.test.ts`: 10 testes aprovados; o projeto nao tinha script npm test.
- Build Vite aprovado em diretorio externo, com avisos de chunk maior que 500 kB e uso preexistente de __dirname no config.
- Orca browser, fixture isolada com dados apenas em memoria: login sem sugestoes; identidade antiga forjada no localStorage nao autentica; login valido; recarga com sessao; cookie inacessivel por document.cookie; troca com senha errada recusada; troca correta; recarga preserva nova conta; logout e recarga voltam ao login. Logo carregada em 800x800 e favicon apontando para o mesmo arquivo.
- A fixture teve avisos de websocket HMR por porta ja ocupada; nao houve falha no fluxo de autenticacao. Nao se executou CRUD remoto nem se alterou o database.json real nesses testes.
- Servidor Express local reiniciado: as tres senhas existentes foram aceitas pela nova API; chamadas sem sessao a data/reset retornaram 401. Hash do database.json identico antes e depois desse smoke test. Fixture e pagina de teste encerradas.

Validacao executada nesta conversa, sem novos agentes. CodeRabbit/revisao externa nao executados; nao sao resultados presumidos.
