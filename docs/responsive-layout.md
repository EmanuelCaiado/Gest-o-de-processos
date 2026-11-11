# Layout responsivo

O mesmo endereco se adapta automaticamente a largura disponivel, sem uma versao separada ou troca manual.

- Abaixo de 1024px: navegacao inferior com cinco secoes; menu lateral recolhido, aberto pelo cabecalho para conta e acoes. Escape fecha e devolve o foco ao botao de abertura. Ao passar para desktop, o menu deixa de manter um dialogo aberto.
- Abaixo de 640px: tabelas de tarefas, clientes e equipe viram registros empilhados com rotulos; calendario mensal usa agenda por dia com atividades. Desktop mantem a grade mensal. Tabelas em larguras intermediarias preservam colunas com rolagem interna.
- Cartoes, filtros, cabecalhos e acoes se reorganizam, mantendo os nomes completos nas leituras principais. Kanban e abas usam rolagem interna quando necessario.
- Controles com alvo minimo de 44px nas larguras compactas; campos com 16px para leitura e para evitar zoom automatico do iOS. Texto operacional principal com pelo menos 14px no celular; rotulos auxiliares com pelo menos 12px. Respeito a prefers-reduced-motion e safe-area inferior.
- Formularios com altura maxima baseada em dvh e rolagem propria. Paineis de detalhes podem rolar verticalmente.

## Validacao

Executada no Orca com fixture isolada de dados sinteticos, sem gravar no arquivo real de banco nem no Supabase. As cinco secoes foram medidas em 320, 390, 768, 1024 e 1440px, verificando largura de conteudo e cabecalho. Revisao adicional: detalhes de cliente em 320/390/768px, foco/fechamento do menu e formulario em alturas de 844 e 480px.

`npm run lint` (TypeScript), os 10 testes existentes de autenticacao/metricas e build Vite passaram. Nao ha scripts npm test ou typecheck separados; foram usados os comandos reais documentados na story. Avisos preexistentes: chunk acima de 500kB e __dirname na configuracao Vite. A fixture teve avisos de websocket HMR por porta ocupada; validacoes ocorreram apos carregar as fontes atualizadas. Nao houve revisao independente ou CodeRabbit.

As medidas e capturas sao emuladas no navegador Orca, sem garantia de teste em todos os aparelhos fisicos. A persistencia remota continua fora deste trabalho.

## Video de revisao

MP4 de 60 segundos, 1920x1080, com dez capturas reais, legendas e dados sinteticos. Montagem de revisao sem audio, nao uma gravacao continua da tela. Gerado fora do repositorio em `.agents/validation/responsive-layout/revisao-responsiva-rx.mp4` no perfil local; nao foi adicionado ao bundle do site. Pillow e imageio-ffmpeg foram usados apenas no ambiente temporario uv, sem novas dependencias do aplicativo. Video decodificado integralmente pelo FFmpeg para verificacao.
