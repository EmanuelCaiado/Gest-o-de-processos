import React from 'react';
import { Search, Plus, CheckCircle2, RefreshCw, ArrowLeft, Menu } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Header: React.FC<{ onOpenMenu: () => void; menuOpen: boolean }> = ({ onOpenMenu, menuOpen }) => {
  const {
    activeTab,
    selectedClientId,
    clients,
    searchQuery,
    setSearchQuery,
    isSaving,
    setIsNewTaskModalOpen,
    setIsNewClientModalOpen,
    canGoBack,
    goBack,
  } = useData();

  const activeClient = clients.find((c) => c.id === selectedClientId);

  const getTitle = () => {
    if (activeTab === 'overview') return 'Visão Geral Operacional';
    if (activeTab === 'clients') {
      if (activeClient) {
        return `Clientes / ${activeClient.name}`;
      }
      return 'Gestão de Clientes';
    }
    if (activeTab === 'tasks') return 'Central de Tarefas';
    if (activeTab === 'calendar') return 'Calendário Operacional';
    if (activeTab === 'processes') return 'Fluxograma de Processos';
    return 'RX Workspace';
  };

  const getSubtitle = () => {
    if (activeTab === 'overview') return 'Acompanhamento em tempo real da produção e equipe';
    if (activeTab === 'clients') {
      if (activeClient) return activeClient.serviceDescription;
      return 'Clientes ativos, processos e ciclos de produção';
    }
    if (activeTab === 'tasks') return 'Atividades distribuídas, prioridades e prazos de entrega';
    if (activeTab === 'calendar') return 'Gravações, reuniões, entregas e publicações agendadas';
    if (activeTab === 'processes') return 'Jornada operacional em 9 etapas e dependências de produção';
    return '';
  };

  return (
    <header className="workspace-header bg-white border-b border-[#EFE8EB] px-4 py-3 lg:px-8 flex flex-col xl:flex-row xl:items-center justify-between gap-3 shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onOpenMenu} aria-label="Abrir menu e conta" aria-expanded={menuOpen} aria-controls="workspace-sidebar" className="lg:hidden shrink-0 rounded-lg border border-[#E8DFE3] p-2.5 text-[#651D32]"><Menu className="h-5 w-5" /></button>
        {/* Navigation Back Button */}
        {canGoBack && (
          <button
            onClick={goBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E8DFE3] bg-[#F8F8F8] hover:bg-[#F4E9ED] text-[#202020] hover:text-[#651D32] transition text-xs font-bold cursor-pointer shadow-2xs shrink-0"
            title="Voltar para a parte anterior"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#651D32]" />
            <span>Voltar</span>
          </button>
        )}

        <div>
          <h2 className="text-lg font-bold text-[#202020] tracking-tight flex flex-wrap items-center gap-2">
            <span className="hidden sm:inline">{getTitle()}</span>
            <span className="sm:hidden">{activeClient && activeTab === 'clients' ? 'Detalhes do cliente' : getTitle()}</span>
            {activeClient && activeTab === 'clients' && (
              <span
                className={`text-xs shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full font-medium ${
                  activeClient.status === 'ativo'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : activeClient.status === 'pausado'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {activeClient.status.toUpperCase()}
              </span>
            )}
          </h2>
          <p className="text-xs text-[#777777] font-normal">{getSubtitle()}</p>
        </div>
      </div>

      <div className="header-actions flex items-center gap-2 min-w-0">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0 xl:w-56">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas, clientes..."
            aria-label="Buscar tarefas ou clientes"
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs text-[#202020] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#651D32] focus:border-[#651D32] transition"
          />
        </div>

        {/* Sync Status */}
        <div role="status" className="hidden sm:flex items-center space-x-1.5 text-xs text-[#777777] bg-[#F8F8F8] px-2.5 py-1.5 rounded-lg border border-[#EFE8EB] shrink-0">
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#651D32]" />
              <span className="text-[11px] font-medium text-[#651D32]">Salvando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-medium text-emerald-700">Persistido</span>
            </>
          )}
        </div>

        {/* Action Button */}
        {activeTab === 'clients' && !selectedClientId ? (
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        ) : (
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        )}
      </div>
    </header>
  );
};
