import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Kanban,
  GitFork,
  LayoutDashboard,
  Plus,
  PlayCircle,
  PauseCircle,
  Archive,
  RefreshCw,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  FileText,
  User,
  Shield,
  Tag,
  Trash2,
  Edit2,
  Search,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  calculateClientProgress,
  calculateStageProgress,
  isTaskOverdue,
  isTaskDueToday,
  STAGE_TEMPLATES,
  KANBAN_STAGES,
  TaskItem,
  ContentItem,
} from '../utils/metrics';

interface Props {
  clientId: string;
  onBack: () => void;
}

export const ClientDetailView: React.FC<Props> = ({ clientId, onBack }) => {
  const {
    clients,
    tasks,
    contents,
    calendarEvents,
    users,
    clientActiveTab,
    setClientActiveTab,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    repeatClientCycle,
    pauseClient,
    reactivateClient,
    archiveClient,
    deleteClient,
    moveContentStage,
    setIsNewTaskModalOpen,
    setIsNewContentModalOpen,
    setSelectedTaskId,
    setSelectedStageId,
    selectedStageId,
    setEditingClient,
  } = useData();

  const client = clients.find((c) => c.id === clientId);

  const todayStr = '2026-11-11';

  // Task filtering & searching inside client
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('todos');

  // Accordion state for the 9 stages (all open by default)
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
    '6': true,
    '7': true,
    '8': true,
    '9': true,
    sem_etapa: true,
  });

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  if (!client) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#EFE8EB] m-8">
        <p className="text-sm font-semibold text-[#202020]">Cliente não encontrado ou removido.</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-[#651D32] text-white text-xs font-semibold rounded-lg hover:bg-[#521627] transition cursor-pointer"
        >
          Voltar para Lista de Clientes
        </button>
      </div>
    );
  }

  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const clientContents = contents.filter((c) => c.clientId === client.id);
  const clientEvents = calendarEvents.filter((e) => e.clientId === client.id);
  const clientProgress = calculateClientProgress(tasks, client.id);

  // Compute Task KPIs for the client
  const totalTasksCount = clientTasks.length;
  const completedTasksCount = clientTasks.filter((t) => t.status === 'concluida').length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;
  const overdueTasksCount = clientTasks.filter((t) => isTaskOverdue(t, todayStr)).length;

  // Filter tasks
  const filteredTasks = clientTasks.filter((t) => {
    if (taskStatusFilter !== 'todos' && t.status !== taskStatusFilter) return false;
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchResp = t.responsibleName.toLowerCase().includes(q);
      if (!matchTitle && !matchResp) return false;
    }
    return true;
  });

  // Next upcoming activity
  const nextEvent = clientEvents
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0];
  const nextTask = clientTasks
    .filter((t) => t.status !== 'concluida' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const nextActivityText = nextEvent
    ? `${nextEvent.title} (${nextEvent.date}${nextEvent.startTime ? ` às ${nextEvent.startTime}` : ''})`
    : nextTask
    ? `${nextTask.title} (${nextTask.dueDate})`
    : 'Nenhuma atividade próxima';

  const handleRepeatCycle = () => {
    if (
      window.confirm(
        `Deseja iniciar o Ciclo ${(client.cycleNumber || 1) + 1} para ${client.name}?\n\nIsso gerará as 54 tarefas do modelo padrão RX mantendo o histórico de tarefas anteriores intacto.`
      )
    ) {
      repeatClientCycle(client.id);
    }
  };

  const handleDeleteClient = () => {
    if (
      window.confirm(
        `ATENÇÃO: Deseja realmente excluir permanentemente o cliente "${client.name}" e todas as suas tarefas vinculadas? Esta ação não pode ser desfeita.`
      )
    ) {
      deleteClient(client.id);
      onBack();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO DEDICADO DO CLIENTE */}
      <div className="bg-white rounded-xl border border-[#EFE8EB] p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-[#F8F8F8] hover:bg-[#F4E9ED] text-[#777777] hover:text-[#651D32] transition cursor-pointer mt-1"
              title="Voltar para Clientes"
              aria-label="Voltar para Clientes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#202020] tracking-tight">
                  {client.name}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    client.status === 'ativo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : client.status === 'pausado'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {client.status}
                </span>
                <span className="text-xs font-bold text-[#651D32] bg-[#F4E9ED] px-2.5 py-0.5 rounded">
                  Ciclo {client.cycleNumber || 1}
                </span>
              </div>

              {/* Informações detalhadas do cabeçalho */}
              <div className="mt-2 text-xs text-[#555555] space-y-1">
                <div>
                  <span className="font-semibold text-[#202020]">Serviço Contratado: </span>
                  <span>{client.serviceDescription || 'Gestão de Conteúdo e Posicionamento Digital'}</span>
                </div>
                <div className="flex items-center space-x-4 flex-wrap text-[#777777]">
                  <span>
                    Contato: <strong className="text-[#202020]">{client.contactName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Responsável RX: <strong className="text-[#651D32]">{client.responsibleName}</strong>
                  </span>
                  <span>•</span>
                  <span>Início: {client.startDate}</span>
                  <span>•</span>
                  <span>
                    Próxima atividade: <strong className="text-[#202020]">{nextActivityText}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setEditingClient(client)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8F8F8] hover:bg-[#F4E9ED] text-[#202020] hover:text-[#651D32] rounded-lg text-xs font-semibold border border-[#EFE8EB] transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Cliente</span>
            </button>

            <button
              onClick={handleRepeatCycle}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F4E9ED] text-[#651D32] hover:bg-[#ebd9df] rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Gerar novo ciclo de 54 tarefas a partir do modelo RX"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Repetir Ciclo</span>
            </button>

            {client.status === 'ativo' ? (
              <button
                onClick={() => pauseClient(client.id)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Pausar cliente temporariamente"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>
            ) : (
              <button
                onClick={() => reactivateClient(client.id)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Reativar cliente"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Reativar</span>
              </button>
            )}

            <button
              onClick={handleDeleteClient}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Excluir cliente"
              aria-label="Excluir cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 ABAS INTERNAS (Tarefas em PRIMEIRO LUGAR conforme requisito) */}
        <div className="flex border-b border-[#F4E9ED] pt-2 space-x-8">
          {[
            { id: 'tasks', label: `Tarefas (${clientTasks.length})`, icon: CheckSquare },
            { id: 'contents', label: `Conteúdos (${clientContents.length})`, icon: Kanban },
            { id: 'processes', label: 'Fluxograma', icon: GitFork },
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = clientActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setClientActiveTab(tab.id as typeof clientActiveTab)}
                className={`flex items-center space-x-2 pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-[#651D32] text-[#651D32]'
                    : 'border-transparent text-[#777777] hover:text-[#202020]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ABA 1: TAREFAS — CHECKLIST OBRIGATÓRIO (LAYOUT 2 COLUNAS)              */}
      {/* ========================================================================= */}
      {clientActiveTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Indicators Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div className="bg-[#F8F8F8] p-3 rounded-lg border border-[#EFE8EB]">
              <div className="text-[11px] text-[#777777] font-medium">Total de Tarefas</div>
              <div className="text-xl font-extrabold text-[#202020] mt-0.5">{totalTasksCount}</div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <div className="text-[11px] text-emerald-700 font-medium">Concluídas</div>
              <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{completedTasksCount}</div>
            </div>

            <div className="bg-[#F4E9ED] p-3 rounded-lg border border-[#E8DFE3]">
              <div className="text-[11px] text-[#651D32] font-medium">Pendentes</div>
              <div className="text-xl font-extrabold text-[#651D32] mt-0.5">{pendingTasksCount}</div>
            </div>

            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
              <div className="text-[11px] text-rose-700 font-medium">Atrasadas</div>
              <div className="text-xl font-extrabold text-rose-800 mt-0.5">{overdueTasksCount}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-[#651D32]/30 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[11px] text-[#777777]">
                <span>Progresso</span>
                <span className="font-extrabold text-[#651D32]">{clientProgress.percentage}%</span>
              </div>
              <div className="w-full bg-[#F4E9ED] h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-[#651D32] h-full rounded-full transition-all duration-300"
                  style={{ width: `${clientProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LADO ESQUERDO (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Informações Resumidas do Cliente */}
              <div className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs space-y-3 text-xs">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-[#F4E9ED]">
                  <Shield className="w-4 h-4 text-[#651D32]" />
                  <h3 className="font-bold text-[#202020]">Informações do Contrato</h3>
                </div>

                <div>
                  <span className="font-semibold text-[#777777] block">Escopo RX:</span>
                  <p className="text-[#202020] mt-0.5">{client.serviceDescription}</p>
                </div>

                {client.internalNotes && (
                  <div>
                    <span className="font-semibold text-[#777777] block">Regras & Observações:</span>
                    <p className="text-[#444444] bg-[#F8F8F8] p-2.5 rounded-lg border border-[#EFE8EB] mt-0.5 leading-relaxed whitespace-pre-line">
                      {client.internalNotes}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F8F8F8] flex justify-between">
                  <span className="text-[#777777]">Ciclo em Produção:</span>
                  <span className="font-bold text-[#651D32]">Ciclo {client.cycleNumber || 1}</span>
                </div>
              </div>

              {/* Tarefas Prioritárias deste Cliente */}
              <div className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs space-y-3">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-[#F4E9ED]">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs text-[#202020]">Tarefas de Alta Prioridade</h3>
                </div>

                {clientTasks.filter((t) => t.priority === 'alta' && t.status !== 'concluida').length === 0 ? (
                  <p className="text-xs text-[#777777] py-2 text-center">Nenhuma tarefa de alta prioridade pendente.</p>
                ) : (
                  <div className="space-y-2">
                    {clientTasks
                      .filter((t) => t.priority === 'alta' && t.status !== 'concluida')
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-lg bg-rose-50/40 border border-rose-100 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="text-xs font-semibold text-[#202020] hover:text-[#651D32] text-left block truncate cursor-pointer"
                            >
                              {task.title}
                            </button>
                            <div className="text-[10px] text-[#777777] mt-0.5">
                              Resp: {task.responsibleName} • Prazo: {task.dueDate || 'Sem prazo'}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="px-2 py-0.5 text-[10px] bg-white text-[#651D32] border border-[#651D32]/30 rounded font-semibold hover:bg-[#F4E9ED] shrink-0 cursor-pointer"
                          >
                            Concluir
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Próximos Prazos */}
              <div className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs space-y-3">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-[#F4E9ED]">
                  <Calendar className="w-4 h-4 text-[#651D32]" />
                  <h3 className="font-bold text-xs text-[#202020]">Próximos Prazos da Operação</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {clientTasks
                    .filter((t) => t.status !== 'concluida' && t.dueDate)
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .slice(0, 5)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between py-1.5 border-b border-[#F8F8F8]"
                      >
                        <span className="truncate pr-2 font-medium text-[#202020]">{t.title}</span>
                        <span className="text-[11px] font-bold text-[#651D32] shrink-0 bg-[#F4E9ED] px-2 py-0.5 rounded">
                          {t.dueDate}
                        </span>
                      </div>
                    ))}
                  {clientTasks.filter((t) => t.status !== 'concluida' && t.dueDate).length === 0 && (
                    <p className="text-xs text-[#777777] py-2 text-center">Nenhum prazo definido.</p>
                  )}
                </div>
              </div>
            </div>

            {/* LADO DIREITO: CHECKLIST COMPLETO ORGANIZADO POR ETAPAS EXPANSÍVEIS (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-[#EFE8EB] p-6 shadow-xs space-y-4">
              {/* Header with Search and + Nova Tarefa */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4E9ED]">
                <div className="flex items-center space-x-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="Buscar atividade no checklist..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                    />
                  </div>

                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="bg-[#F8F8F8] border border-[#E8DFE3] text-xs rounded-lg px-2.5 py-1.5 font-medium text-[#202020]"
                  >
                    <option value="todos">Todos</option>
                    <option value="a_fazer">A Fazer</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="bloqueada">Bloqueada</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nova Tarefa</span>
                </button>
              </div>

              {/* Empty state when client has 0 tasks */}
              {totalTasksCount === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Layers className="w-12 h-12 mx-auto text-gray-300" />
                  <h4 className="font-bold text-sm text-[#202020]">Nenhuma tarefa cadastrada para este cliente</h4>
                  <p className="text-xs text-[#777777] max-w-sm mx-auto">
                    Você pode aplicar as 54 tarefas do modelo padrão RX ou criar atividades individuais manualmente.
                  </p>
                  <div className="pt-2 flex justify-center space-x-3">
                    <button
                      onClick={handleRepeatCycle}
                      className="px-4 py-2 bg-[#651D32] text-white text-xs font-bold rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
                    >
                      Aplicar 54 Tarefas do Modelo Padrão RX
                    </button>
                    <button
                      onClick={() => setIsNewTaskModalOpen(true)}
                      className="px-4 py-2 bg-[#F8F8F8] text-[#202020] border border-[#E8DFE3] text-xs font-semibold rounded-lg hover:bg-[#F4E9ED] transition cursor-pointer"
                    >
                      + Criar Tarefa Manual
                    </button>
                  </div>
                </div>
              ) : (
                /* Expandable Stages Accordion */
                <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                  {STAGE_TEMPLATES.map((stage) => {
                    const stageTasks = filteredTasks.filter((t) => t.stageId === stage.id);
                    const allStageTasks = clientTasks.filter((t) => t.stageId === stage.id);
                    const stageMetrics = calculateStageProgress(tasks, client.id, stage.id);
                    const isExpanded = expandedStages[stage.id] ?? true;

                    if (allStageTasks.length === 0 && taskSearch) return null;

                    return (
                      <div
                        key={stage.id}
                        className="rounded-xl border border-[#EFE8EB] bg-[#FCFBFB] overflow-hidden transition shadow-2xs"
                      >
                        {/* Stage Accordion Header */}
                        <div
                          onClick={() => toggleStage(stage.id)}
                          className="p-3.5 bg-white hover:bg-[#FDFBFC] flex items-center justify-between cursor-pointer border-b border-[#F4E9ED] select-none"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                                stageMetrics.percentage === 100
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#651D32] text-white'
                              }`}
                            >
                              0{stage.order}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-xs text-[#202020] truncate">
                                  {stage.title}
                                </h4>
                                <span className="text-[11px] font-semibold text-[#777777]">
                                  — {stageMetrics.completed}/{stageMetrics.total} concluídas
                                </span>
                              </div>

                              {/* Stage Progress Bar */}
                              <div className="w-48 bg-[#F4E9ED] h-1.5 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    stageMetrics.percentage === 100 ? 'bg-emerald-600' : 'bg-[#651D32]'
                                  }`}
                                  style={{ width: `${stageMetrics.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-xs font-bold text-[#651D32]">
                              {stageMetrics.percentage}%
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-[#777777] transition transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Stage Tasks List */}
                        {isExpanded && (
                          <div className="divide-y divide-[#F4E9ED] bg-white px-3 py-1">
                            {stageTasks.map((task) => {
                              const isDone = task.status === 'concluida';
                              const overdue = isTaskOverdue(task, todayStr);
                              const isBlocked = task.status === 'bloqueada';

                              return (
                                <div
                                  key={task.id}
                                  className="py-2.5 flex items-start justify-between hover:bg-[#FDFBFC] px-2 rounded-lg transition group"
                                >
                                  {/* Checkbox and Title */}
                                  <div className="flex items-start space-x-3 flex-1 min-w-0 pr-3">
                                    <button
                                      onClick={() => toggleTaskComplete(task.id)}
                                      className={`mt-0.5 rounded border-2 transition cursor-pointer flex items-center justify-center shrink-0 ${
                                        isDone
                                          ? 'bg-emerald-600 border-emerald-600 text-white w-4.5 h-4.5'
                                          : 'border-gray-300 hover:border-emerald-600 w-4.5 h-4.5'
                                      }`}
                                      title={isDone ? 'Reabrir tarefa' : 'Marcar como concluída'}
                                    >
                                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => setSelectedTaskId(task.id)}
                                          className={`text-xs font-medium text-left block truncate cursor-pointer ${
                                            isDone
                                              ? 'line-through text-gray-400'
                                              : 'text-[#202020] hover:text-[#651D32] font-semibold'
                                          }`}
                                        >
                                          {task.title}
                                        </button>

                                        {isBlocked && (
                                          <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                                            Bloqueada
                                          </span>
                                        )}
                                      </div>

                                      {task.description && !isDone && (
                                        <p className="text-[11px] text-[#777777] line-clamp-1 mt-0.5">
                                          {task.description}
                                        </p>
                                      )}

                                      {/* Sub-meta: Responsible & Due Date */}
                                      <div className="text-[10px] text-[#777777] mt-1 flex items-center space-x-3 flex-wrap">
                                        <span className="font-medium text-[#444444]">
                                          Resp: {task.responsibleName}
                                        </span>
                                        <span>•</span>
                                        <span
                                          className={`font-semibold ${
                                            overdue
                                              ? 'text-rose-700 bg-rose-50 px-1 rounded'
                                              : 'text-[#555555]'
                                          }`}
                                        >
                                          Prazo: {task.dueDate || 'Sem prazo'}
                                          {task.dueTime ? ` às ${task.dueTime}` : ''}
                                          {overdue ? ' (Atrasada)' : ''}
                                        </span>
                                        {task.completedBy && (
                                          <>
                                            <span>•</span>
                                            <span className="text-emerald-700 font-medium">
                                              Concluído por {task.completedBy}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Controls: Priority, Status Selector & Edit */}
                                  <div className="flex items-center space-x-2 shrink-0 pt-0.5">
                                    <span
                                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        task.priority === 'alta'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : task.priority === 'media'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {task.priority}
                                    </span>

                                    <button
                                      onClick={() => setSelectedTaskId(task.id)}
                                      className="p-1 text-gray-400 hover:text-[#651D32] rounded transition cursor-pointer"
                                      title="Editar atividade"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Excluir a tarefa "${task.title}"?`)) {
                                          deleteTask(task.id);
                                        }
                                      }}
                                      className="p-1 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
                                      title="Excluir atividade"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {stageTasks.length === 0 && (
                              <p className="py-3 text-center text-xs text-[#777777]">
                                Nenhuma atividade nesta etapa com os filtros aplicados.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA 2: CONTEÚDOS (KANBAN DE PRODUÇÃO EM 11 COLUNAS)                    */}
      {/* ========================================================================= */}
      {clientActiveTab === 'contents' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-[#202020]">Quadro Kanban de Conteúdos</h3>
              <p className="text-xs text-[#777777]">
                Acompanhe o status dos posts, roteiros, gravações, aprovações e agendamentos de {client.name}.
              </p>
            </div>
            <button
              onClick={() => setIsNewContentModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Conteúdo</span>
            </button>
          </div>

          {/* Kanban Board - 11 Horizontal Columns */}
          <div className="flex space-x-4 overflow-x-auto pb-6 pt-2">
            {KANBAN_STAGES.map((col) => {
              const colContents = clientContents.filter((c) => c.stage === col.id);
              return (
                <div
                  key={col.id}
                  className="w-72 shrink-0 bg-white rounded-xl border border-[#EFE8EB] shadow-xs flex flex-col max-h-[750px]"
                >
                  <div className="p-3 border-b border-[#F4E9ED] bg-[#FDFBFC] rounded-t-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-[#651D32] text-white text-[10px] font-bold flex items-center justify-center">
                        {col.id}
                      </span>
                      <h4 className="font-bold text-xs text-[#202020] truncate">{col.name}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-[#777777] bg-white px-2 py-0.5 rounded-full border border-[#EFE8EB]">
                      {colContents.length}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-[160px]">
                    {colContents.map((content) => (
                      <div
                        key={content.id}
                        className="bg-white p-3.5 rounded-lg border border-[#EFE8EB] hover:border-[#651D32]/50 shadow-xs transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#651D32] bg-[#F4E9ED] px-2 py-0.5 rounded uppercase">
                            {content.format}
                          </span>
                          {content.hasPendingReview && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              Revisão Pendente
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-xs text-[#202020] leading-snug">
                          {content.title}
                        </h5>

                        {content.notes && (
                          <p className="text-[11px] text-[#777777] line-clamp-2">{content.notes}</p>
                        )}

                        <div className="pt-2 border-t border-[#F8F8F8] flex items-center justify-between">
                          <span className="text-[10px] text-[#777777]">
                            Resp: {content.responsibleName.split(' ')[0]}
                          </span>

                          <select
                            value={content.stage}
                            onChange={(e) => moveContentStage(content.id, Number(e.target.value))}
                            className="text-[10px] bg-[#F8F8F8] border border-[#EFE8EB] rounded px-1.5 py-0.5 font-medium text-[#202020] cursor-pointer"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Mover: {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {colContents.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-[#F4E9ED] rounded-lg flex items-center justify-center text-[11px] text-gray-300">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABA 3: FLUXOGRAMA OPERACIONAL INTERATIVO                              */}
      {/* ========================================================================= */}
      {clientActiveTab === 'processes' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#202020]">
                Fluxograma da Jornada RX • {client.name} (Ciclo {client.cycleNumber || 1})
              </h3>
              <p className="text-xs text-[#777777]">
                Nós conectados de produção. Clique em uma etapa para abrir o checklist correspondente.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#651D32] bg-[#F4E9ED] px-3 py-1.5 rounded-lg">
              {clientProgress.percentage}% do fluxo completo
            </div>
          </div>

          <div className="relative space-y-4 max-w-4xl mx-auto">
            {STAGE_TEMPLATES.map((stage, idx) => {
              const stageMetrics = calculateStageProgress(tasks, client.id, stage.id);
              const isSelected = selectedStageId === stage.id;
              const isLast = idx === STAGE_TEMPLATES.length - 1;

              return (
                <div key={stage.id} className="relative">
                  <div
                    onClick={() => setSelectedStageId(isSelected ? null : stage.id)}
                    className={`p-5 rounded-xl border transition cursor-pointer bg-white shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-[#651D32] ring-2 ring-[#651D32]/20'
                        : 'border-[#EFE8EB] hover:border-[#651D32]/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition ${
                            stageMetrics.percentage === 100
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#651D32] text-white'
                          }`}
                        >
                          {stageMetrics.percentage === 100 ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            `0${stage.order}`
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-[#651D32] uppercase tracking-wider">
                              ETAPA 0{stage.order}
                            </span>
                            {stage.id === '3' && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                Retorna se Reprovado
                              </span>
                            )}
                            {stage.id === '9' && (
                              <span className="text-[9px] bg-[#651D32]/10 text-[#651D32] px-1.5 py-0.5 rounded font-semibold">
                                Reconecta à Etapa 01
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-[#202020] mt-0.5">
                            {stage.title}
                          </h4>
                          <p className="text-xs text-[#777777] mt-0.5 max-w-xl">
                            {stage.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 sm:w-72 justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#777777] text-[11px]">
                              {stageMetrics.completed}/{stageMetrics.total} tarefas
                            </span>
                            <span className="font-bold text-[#651D32]">
                              {stageMetrics.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-[#F4E9ED] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#651D32] h-full rounded-full transition-all duration-300"
                              style={{ width: `${stageMetrics.percentage}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-right text-rose-700 font-medium">
                            {stageMetrics.pending} pendente{stageMetrics.pending === 1 ? '' : 's'}
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-5 h-5 text-[#777777] transition transform shrink-0 ${
                            isSelected ? 'rotate-90 text-[#651D32]' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-[#E2D9DD]" />
                        <div className="w-2 h-2 border-r-2 border-b-2 border-[#651D32] rotate-45" />
                      </div>
                    </div>
                  )}

                  {isLast && (
                    <div className="p-3 bg-[#F4E9ED] rounded-lg border border-[#E8DFE3] text-center text-xs font-semibold text-[#651D32] mt-3">
                      🔄 Ciclo Contínuo: A Etapa 09 realimenta o Planejamento Editorial da Etapa 01 para o próximo período.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slide-over Drawer for Stage Tasks */}
          {selectedStageId && (
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-40 border-l border-[#EFE8EB] p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
                  <div>
                    <span className="text-[10px] font-bold text-[#651D32] uppercase">
                      Tarefas da Etapa {selectedStageId} • {client.name}
                    </span>
                    <h3 className="font-bold text-base text-[#202020]">
                      {STAGE_TEMPLATES.find((s) => s.id === selectedStageId)?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedStageId(null)}
                    className="p-1.5 text-gray-400 hover:text-[#202020] rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {clientTasks
                    .filter((t) => t.stageId === selectedStageId)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg border border-[#EFE8EB] hover:border-[#651D32]/40 bg-[#FDFBFC] transition space-y-2"
                      >
                        <div className="flex items-start space-x-2.5">
                          <button
                            onClick={() => toggleTaskComplete(t.id)}
                            className={`mt-0.5 rounded border-2 transition cursor-pointer flex items-center justify-center ${
                              t.status === 'concluida'
                                ? 'bg-emerald-600 border-emerald-600 text-white w-4 h-4'
                                : 'border-gray-300 hover:border-emerald-600 w-4 h-4'
                            }`}
                          >
                            {t.status === 'concluida' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <div className="flex-1">
                            <div
                              className={`text-xs font-semibold ${
                                t.status === 'concluida' ? 'line-through text-gray-400' : 'text-[#202020]'
                              }`}
                            >
                              {t.title}
                            </div>
                            <div className="text-[11px] text-[#777777] mt-1 flex items-center justify-between">
                              <span>Resp: {t.responsibleName}</span>
                              <span>Prazo: {t.dueDate || 'Sem prazo'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {clientTasks.filter((t) => t.stageId === selectedStageId).length === 0 && (
                    <p className="text-xs text-[#777777] py-6 text-center">Nenhuma tarefa nesta etapa.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F4E9ED]">
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="w-full py-2.5 bg-[#651D32] text-white text-xs font-semibold rounded-lg hover:bg-[#521627] transition cursor-pointer"
                >
                  + Adicionar Tarefa Nesta Etapa
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ABA 4: VISÃO GERAL (INFORMAÇÕES ADMINISTRATIVAS)                        */}
      {/* ========================================================================= */}
      {clientActiveTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
              <h3 className="font-bold text-sm text-[#202020] mb-4">Progresso Geral do Ciclo</h3>
              <div className="w-full bg-[#F4E9ED] h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-[#651D32] h-full rounded-full transition-all duration-300"
                  style={{ width: `${clientProgress.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center pt-2">
                <div className="bg-[#F8F8F8] p-3 rounded-lg border border-[#EFE8EB]">
                  <div className="text-xs text-[#777777]">Total de Atividades</div>
                  <div className="text-lg font-bold text-[#202020] mt-0.5">{clientProgress.total}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="text-xs text-emerald-700">Concluídas</div>
                  <div className="text-lg font-bold text-emerald-800 mt-0.5">{clientProgress.completed}</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                  <div className="text-xs text-rose-700">Pendentes</div>
                  <div className="text-lg font-bold text-rose-800 mt-0.5">{clientProgress.pending}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
              <h3 className="font-bold text-sm text-[#202020] mb-3">Serviço & Contrato</h3>
              <div className="text-xs text-[#555555] space-y-3">
                <div>
                  <span className="font-semibold text-[#202020] block">Descrição do Serviço:</span>
                  <p className="mt-0.5 text-[#777777]">{client.serviceDescription}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#202020] block">Observações Internas:</span>
                  <p className="mt-0.5 text-[#444444] bg-[#F8F8F8] p-3 rounded-lg border border-[#EFE8EB] leading-relaxed whitespace-pre-line">
                    {client.internalNotes || 'Nenhuma observação cadastrada.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-[#202020]">Agenda do Cliente</h3>
              {clientEvents.length === 0 ? (
                <p className="text-xs text-[#777777] py-4 text-center">Nenhum evento agendado.</p>
              ) : (
                <div className="space-y-2">
                  {clientEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-[#F8F8F8] rounded-lg border border-[#EFE8EB] text-xs">
                      <div className="font-bold text-[#651D32] uppercase text-[10px]">{evt.type}</div>
                      <div className="font-semibold text-[#202020] mt-0.5">{evt.title}</div>
                      <div className="text-[#777777] text-[11px] mt-0.5">{evt.date} • {evt.responsibleName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
