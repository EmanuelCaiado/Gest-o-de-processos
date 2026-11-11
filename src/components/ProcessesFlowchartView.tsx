import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { STAGE_TEMPLATES, calculateStageProgress, calculateClientProgress } from '../utils/metrics';

export const ProcessesFlowchartView: React.FC = () => {
  const {
    clients,
    tasks,
    selectedClientId,
    setSelectedClientId,
    toggleTaskComplete,
    setIsNewTaskModalOpen,
    setIsNewClientModalOpen,
    setSelectedTaskId,
  } = useData();

  // If no client is selected, default to the first active client
  const currentClient =
    clients.find((c) => c.id === selectedClientId) ||
    clients.find((c) => c.status === 'ativo') ||
    clients[0];

  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  const stageTasks = activeStageId
    ? tasks.filter((t) => t.clientId === currentClient?.id && t.stageId === activeStageId)
    : [];

  const overallProgress = currentClient
    ? calculateClientProgress(tasks, currentClient.id)
    : { total: 0, completed: 0, pending: 0, percentage: 0 };

  if (clients.length === 0) {
    return (
      <div className="p-4 sm:p-6 xl:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-[#EFE8EB] p-10 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#F4E9ED] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#651D32]">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#202020] mb-2">
            Fluxograma Operacional RX
          </h2>
          <p className="text-xs text-[#777777] max-w-md mx-auto mb-6">
            Nenhum cliente cadastrado no momento. Cadastre seu primeiro cliente para ativar a jornada operacional contínua das 9 etapas e acompanhar todas as 54 atividades padronizadas.
          </p>
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#651D32] hover:bg-[#521627] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Primeiro Cliente</span>
          </button>
        </div>

        {/* Informative breakdown of the 9 stages template */}
        <div className="bg-[#FAF8F9] rounded-2xl border border-[#EFE8EB] p-6">
          <h3 className="text-xs font-bold text-[#651D32] uppercase tracking-wider mb-3">
            Estrutura Padrão do Fluxo Operacional (9 Etapas):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STAGE_TEMPLATES.map((st) => (
              <div key={st.id} className="bg-white p-3 rounded-xl border border-[#EFE8EB] text-xs">
                <span className="font-extrabold text-[#651D32]">0{st.order}.</span>{' '}
                <span className="font-bold text-[#202020]">{st.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 xl:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Client Switcher */}
      <div className="bg-white rounded-xl border border-[#EFE8EB] p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#651D32] uppercase tracking-wider bg-[#F4E9ED] px-2.5 py-0.5 rounded">
              Jornada Operacional Contínua
            </span>
            <span className="text-xs text-[#777777]">9 Etapas Padronizadas</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#202020] tracking-tight mt-1">
            Fluxograma Operacional da RX Estúdio
          </h2>
          <p className="text-xs text-[#777777] mt-0.5 max-w-xl">
            Acompanhe o estado de cada etapa, identifique gargalos e avance as tarefas reais de cada cliente.
          </p>
        </div>

        {/* Client Selector & Overall Badge */}
        <div className="flex items-center gap-3 min-w-0 xl:max-w-md">
          <div className="text-left min-w-0 flex-1">
            <label className="text-[11px] font-medium text-[#777777] block">Visualizando Cliente:</label>
            <select
              value={currentClient?.id || ''}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full min-w-0 bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-3 py-1.5 text-xs font-bold text-[#202020] focus:ring-1 focus:ring-[#651D32] cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Ciclo {c.cycleNumber || 1})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#F4E9ED] p-3 rounded-xl border border-[#E8DFE3] text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-[#651D32]">Progresso</div>
            <div className="text-lg font-extrabold text-[#651D32]">{overallProgress.percentage}%</div>
          </div>
        </div>
      </div>

      {/* Main Flowchart: Connected Nodes & Arrows */}
      <div className="relative space-y-4 max-w-4xl mx-auto">
        {STAGE_TEMPLATES.map((stage, idx) => {
          const metrics = currentClient
            ? calculateStageProgress(tasks, currentClient.id, stage.id)
            : { total: 0, completed: 0, pending: 0, percentage: 0 };

          const isSelected = activeStageId === stage.id;
          const isCompleted = metrics.percentage === 100 && metrics.total > 0;
          const isLast = idx === STAGE_TEMPLATES.length - 1;

          return (
            <div key={stage.id} className="relative">
              {/* Flowchart Node */}
              <div
                onClick={() => setActiveStageId(isSelected ? null : stage.id)}
                className={`p-5 rounded-xl border transition cursor-pointer bg-white shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#651D32] ring-2 ring-[#651D32]/25'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-[#EFE8EB] hover:border-[#651D32]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Stage Number & Title */}
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-[#651D32] text-white'
                          : 'bg-[#F4E9ED] text-[#651D32]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
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
                          <span className="text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                            Rejeitado → Retorna à Roteirização
                          </span>
                        )}

                        {stage.id === '4' && (
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
                            Sem gravação? Avança direto p/ Design
                          </span>
                        )}

                        {stage.id === '6' && (
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Não há aprovação por silêncio
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-[#202020] mt-0.5">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-[#777777] mt-0.5 max-w-xl">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center space-x-6 sm:w-80 justify-between">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#777777] text-[11px] font-medium">
                          {metrics.completed} de {metrics.total} concluídas
                        </span>
                        <span className="font-extrabold text-[#651D32]">
                          {metrics.percentage}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#F4E9ED] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-600' : 'bg-[#651D32]'
                          }`}
                          style={{ width: `${metrics.percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px]">
                        <span className="text-rose-700 font-semibold">
                          {metrics.pending} pendente{metrics.pending === 1 ? '' : 's'}
                        </span>
                        <span className="text-[#777777]">Clique para ver tarefas</span>
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

              {/* Connecting Down Arrow */}
              {!isLast && (
                <div className="flex items-center justify-center py-1.5">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-[#E2D9DD]" />
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-[#651D32] rotate-45" />
                  </div>
                </div>
              )}

              {/* Stage 09 Loopback to Stage 01 Notice */}
              {isLast && (
                <div className="mt-4 p-4 rounded-xl border border-[#651D32]/30 bg-gradient-to-r from-[#F4E9ED] to-white shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#651D32] text-white rounded-lg">
                      <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#202020]">
                        Ciclo Contínuo da RX Estúdio
                      </h4>
                      <p className="text-[11px] text-[#777777]">
                        A Etapa 09 (Análise e Otimização) realimenta diretamente a Etapa 01 (Planejamento Editorial) do próximo mês.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (currentClient) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center space-x-1 text-xs font-bold text-[#651D32] hover:underline cursor-pointer"
                  >
                    <span>Ir para Etapa 01</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide-over Drawer for Stage Tasks */}
      {activeStageId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white shadow-2xl z-40 border-l border-[#EFE8EB] p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
              <div>
                <span className="text-[10px] font-bold text-[#651D32] uppercase tracking-wider">
                  Tarefas da Etapa {activeStageId} • {currentClient?.name}
                </span>
                <h3 className="font-bold text-base text-[#202020]">
                  {STAGE_TEMPLATES.find((s) => s.id === activeStageId)?.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveStageId(null)}
                className="p-1.5 text-gray-400 hover:text-[#202020] rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(100dvh-210px)]">
              {stageTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-[#EFE8EB] hover:border-[#651D32]/40 bg-[#FDFBFC] transition space-y-2"
                >
                  <div className="flex items-start space-x-3">
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

                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`text-xs font-semibold text-left block truncate cursor-pointer ${
                          t.status === 'concluida' ? 'line-through text-gray-400' : 'text-[#202020]'
                        }`}
                      >
                        {t.title}
                      </button>
                      <div className="text-[11px] text-[#777777] mt-1 flex items-center justify-between">
                        <span>Resp: {t.responsibleName}</span>
                        <span>Prazo: {t.dueDate || 'Sem prazo'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {stageTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-[#777777]">
                  Nenhuma tarefa cadastrada nesta etapa para este cliente.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4E9ED]">
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="w-full py-2.5 bg-[#651D32] text-white text-xs font-semibold rounded-lg hover:bg-[#521627] transition cursor-pointer"
            >
              + Adicionar Atividade Nesta Etapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
