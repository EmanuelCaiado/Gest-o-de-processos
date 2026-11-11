export interface TaskItem {
  id: string;
  clientId: string;
  clientName: string;
  stageId: string; // '1' to '9' or 'sem_etapa'
  contentId?: string;
  title: string;
  description?: string;
  responsibleId: string;
  responsibleName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: 'baixa' | 'media' | 'alta';
  status: 'a_fazer' | 'em_andamento' | 'bloqueada' | 'concluida';
  orderIndex: number;
  checklist?: { id: string; text: string; done: boolean }[];
  cycleNumber: number;
  completedAt?: string;
  completedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ClientItem {
  id: string;
  name: string;
  contactName: string;
  responsibleId: string;
  responsibleName: string;
  startDate: string;
  status: 'ativo' | 'pausado' | 'encerrado';
  serviceDescription: string;
  internalNotes: string;
  cycleNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  format: 'Reel' | 'Post Estático' | 'Carrossel' | 'Vídeo Longo' | 'Stories';
  responsibleId: string;
  responsibleName: string;
  targetDate: string;
  stage: number; // 1 to 11
  hasPendingReview: boolean;
  scriptUrl?: string;
  filesUrl?: string;
  publishUrl?: string;
  notes?: string;
  cycleNumber: number;
  updatedAt: string;
  createdAt: string;
}

export interface CalendarEventItem {
  id: string;
  clientId?: string;
  clientName?: string;
  title: string;
  type: 'gravacao' | 'reuniao' | 'entrega' | 'publicacao' | 'tarefa';
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  responsibleId: string;
  responsibleName: string;
  description?: string;
  taskId?: string;
}

export interface StageTemplate {
  id: string;
  order: number;
  title: string;
  description: string;
  defaultTasks: {
    id: number;
    title: string;
    description: string;
    defaultPriority: 'baixa' | 'media' | 'alta';
  }[];
}

/**
 * Modelo Reutilizável Oficial: "Fluxo Padrão RX — Gestão e Produção de Conteúdo"
 * Exatamente 9 etapas e 54 tarefas operacionais completas.
 */
export const STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: '1',
    order: 1,
    title: 'Planejamento Editorial',
    description: 'Análise de indicadores, definição de temas prioritários, formatos e ordem de produção.',
    defaultTasks: [
      { id: 1, title: 'Analisar os conteúdos e indicadores anteriores.', description: 'Avaliar métricas de alcance, engajamento e retenção das publicações passadas.', defaultPriority: 'alta' },
      { id: 2, title: 'Definir assuntos prioritários do período.', description: 'Alinhar objetivos de posicionamento e temas estratégicos do mês.', defaultPriority: 'alta' },
      { id: 3, title: 'Pesquisar notícias, dúvidas e acontecimentos relevantes para o segmento do cliente.', description: 'Identificar ganchos quentes do mercado e dores frequentes do público.', defaultPriority: 'media' },
      { id: 4, title: 'Distribuir os temas entre Reels, posts e carrosséis.', description: 'Selecionar o formato mais eficiente para cada assunto.', defaultPriority: 'media' },
      { id: 5, title: 'Definir objetivo, público e formato de cada pauta.', description: 'Mapear a persona de destino e o objetivo de conversão/autoridade de cada conteúdo.', defaultPriority: 'media' },
      { id: 6, title: 'Estabelecer a ordem de produção e datas pretendidas.', description: 'Organizar o cronograma inicial de gravação, edição e publicação.', defaultPriority: 'alta' },
    ],
  },
  {
    id: '2',
    order: 2,
    title: 'Pesquisa e Roteirização',
    description: 'Aprofundamento de fontes, construção de ganchos nos 3s iniciais, CTAs e roteiros completos.',
    defaultTasks: [
      { id: 7, title: 'Pesquisar e conferir fontes de cada assunto.', description: 'Garantir precisão técnica e checagem prévia de fontes de informação.', defaultPriority: 'alta' },
      { id: 8, title: 'Desenvolver o gancho de cada vídeo.', description: 'Criar aberturas impactantes nos primeiros 3 segundos para reter atenção.', defaultPriority: 'alta' },
      { id: 9, title: 'Escrever o desenvolvimento e a conclusão.', description: 'Elaborar texto fluido, didático e direto ao ponto.', defaultPriority: 'alta' },
      { id: 10, title: 'Definir CTA e abordagem adequada à atividade do cliente.', description: 'Chamada para ação alinhada com as normas éticas e comerciais do cliente.', defaultPriority: 'media' },
      { id: 11, title: 'Indicar cenas, referências, imagens e materiais necessários.', description: 'Anotar b-rolls, takes de apoio e referências visuais de edição.', defaultPriority: 'media' },
      { id: 12, title: 'Revisar linguagem, clareza e duração estimada.', description: 'Ajustar ritmo e vocabulário para garantir clareza e tempo adequado.', defaultPriority: 'media' },
      { id: 13, title: 'Organizar todos os roteiros em um documento compartilhado.', description: 'Centralizar roteiros do lote no Google Drive da RX.', defaultPriority: 'alta' },
    ],
  },
  {
    id: '3',
    order: 3,
    title: 'Validação dos Roteiros',
    description: 'Validação técnica pelo cliente e recolhimento de correções antes da captação.',
    defaultTasks: [
      { id: 14, title: 'Encaminhar roteiros que dependam de validação técnica do cliente.', description: 'Enviar pacote de roteiros com prazo formal de retorno.', defaultPriority: 'alta' },
      { id: 15, title: 'Recolher correções e validar os roteiros antes da captação.', description: 'Aplicar ajustes solicitados pelo cliente e liberar para a diária de gravação.', defaultPriority: 'alta' },
    ],
  },
  {
    id: '4',
    order: 4,
    title: 'Pré-produção e Captação',
    description: 'Agendamento de diárias, alinhamento técnico, preparação e captação do material bruto.',
    defaultTasks: [
      { id: 16, title: 'Confirmar data, local e profissionais participantes.', description: 'Alinhar agenda com o cliente e equipe de filmagem.', defaultPriority: 'alta' },
      { id: 17, title: 'Organizar os roteiros por apresentador, cenário e complexidade.', description: 'Otimizar o fluxo de gravação para ganho de tempo.', defaultPriority: 'media' },
      { id: 18, title: 'Preparar equipamentos, áudio, iluminação e enquadramentos.', description: 'Checar baterias, cartões SD, microfones de lapela, iluminação e teleprompter.', defaultPriority: 'alta' },
      { id: 19, title: 'Verificar autorizações de imagem e materiais de apoio.', description: 'Conferir liberações institucionais de locação e imagem.', defaultPriority: 'media' },
      { id: 20, title: 'Montar a ordem de gravação para otimizar as sessões.', description: 'Sequenciar gravações por figurino ou ambiente.', defaultPriority: 'media' },
      { id: 21, title: 'Montar e testar os equipamentos.', description: 'Testar áudio e níveis de iluminação antes de iniciar a captação.', defaultPriority: 'alta' },
      { id: 22, title: 'Orientar cada participante antes da gravação.', description: 'Passar instruções de postura, tom de voz e ritmo de fala.', defaultPriority: 'media' },
      { id: 23, title: 'Gravar os roteiros planejados.', description: 'Executar captação com rigor técnico RX.', defaultPriority: 'alta' },
      { id: 24, title: 'Captar imagens de apoio, detalhes e bastidores autorizados.', description: 'Registrar B-rolls do ambiente e planos de corte.', defaultPriority: 'media' },
      { id: 25, title: 'Conferir áudio, enquadramento e material de cada vídeo.', description: 'Checagem imediata no set após as tomadas.', defaultPriority: 'alta' },
      { id: 26, title: 'Anotar gravações incompletas e necessidades de complementação.', description: 'Registrar eventuais takes adicionais necessários.', defaultPriority: 'media' },
    ],
  },
  {
    id: '5',
    order: 5,
    title: 'Pós-produção',
    description: 'Backup, decupagem, cortes, legendagem dinâmica, design e exportação dos materiais.',
    defaultTasks: [
      { id: 27, title: 'Transferir, organizar e fazer backup dos arquivos.', description: 'Fazer upload imediato dos arquivos brutos para o storage em nuvem.', defaultPriority: 'alta' },
      { id: 28, title: 'Separar gravações e selecionar os melhores takes.', description: 'Decupar e marcar as melhores falhas e acertos.', defaultPriority: 'media' },
      { id: 29, title: 'Realizar cortes e montar a narrativa.', description: 'Cortes dinâmicos mantendo a fluidez e eliminando pausas desnecessárias.', defaultPriority: 'alta' },
      { id: 30, title: 'Aplicar legendas, inserts, imagens e identidade visual.', description: 'Legendagem sincronizada, cartelas de texto e elementos de marca.', defaultPriority: 'alta' },
      { id: 31, title: 'Tratar áudio, imagem e ritmo da edição.', description: 'Equalização de voz, redução de ruído e color grading.', defaultPriority: 'media' },
      { id: 32, title: 'Criar capas, artes e carrosséis.', description: 'Design de artes gráficas com tipografia legível e padrões do cliente.', defaultPriority: 'alta' },
      { id: 33, title: 'Escrever legendas e chamadas das publicações.', description: 'Copywriting das legendas com CTAs e hashtags pertinentes.', defaultPriority: 'media' },
      { id: 34, title: 'Exportar e revisar cada arquivo final.', description: 'Renderizar nas especificações técnicas ideais do Instagram.', defaultPriority: 'alta' },
    ],
  },
  {
    id: '6',
    order: 6,
    title: 'Revisão e Aprovação',
    description: 'Controle de qualidade interno RX e validação formal com o cliente.',
    defaultTasks: [
      { id: 35, title: 'Fazer o controle de qualidade interno.', description: 'Checagem rigorosa de sincronia, ortografia e transições pela RX.', defaultPriority: 'alta' },
      { id: 36, title: 'Conferir nomes, dados, fontes, direitos de imagem e referências.', description: 'Validação de direitos e conformidade de informações.', defaultPriority: 'alta' },
      { id: 37, title: 'Enviar vídeo ou peça com capa e legenda ao responsável.', description: 'Disponibilizar material finalizado no link de aprovação.', defaultPriority: 'alta' },
      { id: 38, title: 'Solicitar aprovação técnica, ética e institucional do cliente.', description: 'Formalizar pedido de aprovação com prazo limite claro.', defaultPriority: 'alta' },
      { id: 39, title: 'Registrar a aprovação ou os ajustes solicitados.', description: 'Anotar pontualmente correções recebidas.', defaultPriority: 'media' },
      { id: 40, title: 'Executar alterações necessárias dentro do escopo contratual.', description: 'Ajustar takes, legendas ou arte conforme feedback.', defaultPriority: 'alta' },
      { id: 41, title: 'Obter e registrar a aprovação final antes de publicar.', description: 'Garantir aprovação expressa (sem aprovação tácita por silêncio).', defaultPriority: 'alta' },
    ],
  },
  {
    id: '7',
    order: 7,
    title: 'Programação e Publicação',
    description: 'Agendamento nas plataformas, checagem e registro oficial de publicação.',
    defaultTasks: [
      { id: 42, title: 'Definir a data de publicação no calendário editorial.', description: 'Alocar postagem no dia e horário de melhor engajamento.', defaultPriority: 'alta' },
      { id: 43, title: 'Verificar formato, capa, legenda, identificação e CTA.', description: 'Conferência final antes de programar.', defaultPriority: 'alta' },
      { id: 44, title: 'Programar ou publicar o conteúdo aprovado.', description: 'Agendamento no Meta Business Suite ou publicação direta.', defaultPriority: 'alta' },
      { id: 45, title: 'Conferir imagem, áudio, texto e formato no Instagram.', description: 'Checar nos primeiros 15 minutos se o post foi ao ar corretamente.', defaultPriority: 'alta' },
      { id: 46, title: 'Atualizar o status e guardar o link da publicação.', description: 'Registrar link oficial no sistema para rastreamento.', defaultPriority: 'media' },
      { id: 47, title: 'Organizar Stories e destaques relacionados, quando previstos.', description: 'Publicar reposts e enquetes para amplificar o post.', defaultPriority: 'baixa' },
    ],
  },
  {
    id: '8',
    order: 8,
    title: 'Acompanhamento',
    description: 'Monitoramento inicial de desempenho, interações da audiência e dúvidas relevantes.',
    defaultTasks: [
      { id: 48, title: 'Monitorar o desempenho das publicações.', description: 'Acompanhar métricas de entrega nas primeiras 24h e 48h.', defaultPriority: 'media' },
      { id: 49, title: 'Registrar alcance, visualizações, retenção e interações disponíveis.', description: 'Coletar números para consolidação no relatório mensal.', defaultPriority: 'media' },
      { id: 50, title: 'Observar dúvidas e comentários relevantes.', description: 'Mapear interações com alto potencial de virar novas pautas.', defaultPriority: 'baixa' },
    ],
  },
  {
    id: '9',
    order: 9,
    title: 'Análise e Otimização',
    description: 'Identificação de melhores desempenhos, registro de aprendizados e realimentação da Etapa 01.',
    defaultTasks: [
      { id: 51, title: 'Identificar formatos e temas com melhor desempenho.', description: 'Analisar quais ganchos e pautas trouxeram mais retorno.', defaultPriority: 'alta' },
      { id: 52, title: 'Registrar aprendizados para os próximos roteiros.', description: 'Documentar aprendizados estratégicos do ciclo.', defaultPriority: 'media' },
      { id: 53, title: 'Preparar a análise para a reunião de acompanhamento.', description: 'Montar resumo executivo para o alinhamento com o cliente.', defaultPriority: 'alta' },
      { id: 54, title: 'Repriorizar o calendário editorial conforme os resultados.', description: 'Realimentar a Etapa 01 do próximo ciclo contínuo da RX.', defaultPriority: 'alta' },
    ],
  },
];

export const KANBAN_STAGES = [
  { id: 1, name: 'Pauta definida' },
  { id: 2, name: 'Roteirizando' },
  { id: 3, name: 'Validação técnica' },
  { id: 4, name: 'Pronto para produzir' },
  { id: 5, name: 'Em produção' },
  { id: 6, name: 'Revisão RX' },
  { id: 7, name: 'Aprovação do cliente' },
  { id: 8, name: 'Aprovado' },
  { id: 9, name: 'Agendado' },
  { id: 10, name: 'Publicado' },
  { id: 11, name: 'Analisado' },
];

/**
 * Checks if a task is overdue relative to a given date string (YYYY-MM-DD).
 */
export function isTaskOverdue(task: TaskItem, referenceDateStr: string): boolean {
  if (task.status === 'concluida') return false;
  if (!task.dueDate) return false;
  return task.dueDate < referenceDateStr;
}

/**
 * Checks if a task is due today relative to reference date string (YYYY-MM-DD).
 */
export function isTaskDueToday(task: TaskItem, referenceDateStr: string): boolean {
  if (task.status === 'concluida') return false;
  return task.dueDate === referenceDateStr;
}

/**
 * Calculates operational metrics for the dashboard.
 */
export function calculateDashboardMetrics(
  tasks: TaskItem[],
  clients: ClientItem[],
  referenceDateStr: string
) {
  let todayCount = 0;
  let overdueCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;

  for (const t of tasks) {
    if (t.status === 'concluida') {
      completedCount++;
    } else {
      if (t.dueDate === referenceDateStr) {
        todayCount++;
      }
      if (t.dueDate && t.dueDate < referenceDateStr) {
        overdueCount++;
      }
      if (t.status === 'em_andamento') {
        inProgressCount++;
      }
    }
  }

  const activeClientsCount = clients.filter((c) => c.status === 'ativo').length;

  return {
    todayCount,
    overdueCount,
    inProgressCount,
    completedCount,
    activeClientsCount,
  };
}

/**
 * Calculates stage progress for a given client and stage.
 */
export function calculateStageProgress(tasks: TaskItem[], clientId: string, stageId: string) {
  const stageTasks = tasks.filter((t) => t.clientId === clientId && t.stageId === stageId);
  const total = stageTasks.length;
  if (total === 0) {
    return { total: 0, completed: 0, pending: 0, percentage: 0 };
  }
  const completed = stageTasks.filter((t) => t.status === 'concluida').length;
  const pending = total - completed;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, pending, percentage };
}

/**
 * Calculates overall task progress for a client.
 */
export function calculateClientProgress(tasks: TaskItem[], clientId: string) {
  const clientTasks = tasks.filter((t) => t.clientId === clientId);
  const total = clientTasks.length;
  if (total === 0) {
    return { total: 0, completed: 0, pending: 0, percentage: 0 };
  }
  const completed = clientTasks.filter((t) => t.status === 'concluida').length;
  const pending = total - completed;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, pending, percentage };
}

/**
 * Generates tasks from the 54-task standard template for a new client or new cycle.
 * Optionally filters to a specific subset of task IDs selected by the user.
 */
export function generateClientTemplateTasks(params: {
  clientId: string;
  clientName: string;
  responsibleId: string;
  responsibleName: string;
  cycleNumber: number;
  startDateStr: string;
  selectedTaskIds?: number[]; // If provided, only generate these specific tasks (from 1 to 54)
}): TaskItem[] {
  const generatedTasks: TaskItem[] = [];
  const baseDate = new Date(params.startDateStr);

  STAGE_TEMPLATES.forEach((stage, stageIndex) => {
    stage.defaultTasks.forEach((taskDef, taskIndex) => {
      if (params.selectedTaskIds && !params.selectedTaskIds.includes(taskDef.id)) {
        return;
      }

      // Distribute estimated due dates across the operational cycle (every 1-2 days)
      const taskDueDate = new Date(baseDate);
      taskDueDate.setDate(baseDate.getDate() + Math.floor((taskDef.id - 1) / 2));
      const dueDateStr = taskDueDate.toISOString().split('T')[0];

      const taskId = `task_${params.clientId}_c${params.cycleNumber}_t${taskDef.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      generatedTasks.push({
        id: taskId,
        clientId: params.clientId,
        clientName: params.clientName,
        stageId: stage.id,
        title: taskDef.title,
        description: taskDef.description,
        responsibleId: params.responsibleId,
        responsibleName: params.responsibleName,
        dueDate: dueDateStr,
        priority: taskDef.defaultPriority,
        status: 'a_fazer',
        orderIndex: taskDef.id,
        checklist: [],
        cycleNumber: params.cycleNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return generatedTasks;
}
