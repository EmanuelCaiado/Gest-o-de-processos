import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Briefcase,
  PlayCircle,
  PauseCircle,
  Archive,
  Trash2,
  Edit2,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { calculateClientProgress } from '../utils/metrics';
import { ClientDetailView } from './ClientDetailView';

export const ClientsView: React.FC = () => {
  const {
    clients,
    tasks,
    calendarEvents,
    selectedClientId,
    setSelectedClientId,
    setIsNewClientModalOpen,
    deleteClient,
    setEditingClient,
    searchQuery,
  } = useData();

  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'pausado' | 'encerrado'>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // If a client is selected, render their individual detail view
  if (selectedClientId) {
    return <ClientDetailView clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
  }

  // Filter clients
  const filteredClients = clients.filter((c) => {
    if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchContact = c.contactName.toLowerCase().includes(q);
      const matchResp = c.responsibleName.toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchResp) return false;
    }
    return true;
  });

  const getNextActivity = (clientId: string) => {
    const clientEvts = calendarEvents
      .filter((e) => e.clientId === clientId)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (clientEvts.length > 0) {
      return `${clientEvts[0].title} (${clientEvts[0].date})`;
    }
    const nextTask = tasks
      .filter((t) => t.clientId === clientId && t.status !== 'concluida' && t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    if (nextTask) {
      return `${nextTask.title} (${nextTask.dueDate})`;
    }
    return 'Nenhuma atividade próxima';
  };

  return (
    <div className="p-4 sm:p-6 xl:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EFE8EB] shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['todos', 'ativo', 'pausado', 'encerrado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#651D32] text-white shadow-xs'
                  : 'bg-[#F8F8F8] text-[#777777] hover:bg-[#F4E9ED] hover:text-[#651D32]'
              }`}
            >
              {st} {st === 'todos' ? `(${clients.length})` : `(${clients.filter((c) => c.status === st).length})`}
            </button>
          ))}
        </div>

        {/* View Toggle & New Client Button */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#F8F8F8] p-1 rounded-lg border border-[#EFE8EB] flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#202020] shadow-xs' : 'text-[#777777]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#202020] shadow-xs' : 'text-[#777777]'
              }`}
            >
              Tabela
            </button>
          </div>

          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Empty State when 0 clients exist */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EFE8EB] p-6 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F4E9ED] text-[#651D32] flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#202020]">Nenhum cliente cadastrado</h3>
            <p className="text-xs text-[#777777] max-w-md mx-auto">
              O sistema está limpo e pronto para a operação real. Cadastre seu primeiro cliente e aplique o modelo padrão com as 54 tarefas da RX Estúdio.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#651D32] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Criar Cliente</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const prog = calculateClientProgress(tasks, client.id);
            const nextAct = getNextActivity(client.id);

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="bg-white rounded-xl border border-[#EFE8EB] p-6 shadow-xs hover:border-[#651D32]/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          client.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : client.status === 'pausado'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {client.status}
                      </span>
                      <h3 className="text-base font-bold text-[#202020] group-hover:text-[#651D32] transition mt-1.5">
                        {client.name}
                      </h3>
                      <p className="text-xs text-[#777777] line-clamp-2 mt-0.5">
                        {client.serviceDescription || 'Gestão de Conteúdo RX'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#651D32] bg-[#F4E9ED] px-2 py-0.5 rounded">
                      Ciclo {client.cycleNumber || 1}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-[#777777] space-y-1.5 my-4 bg-[#F8F8F8] p-3 rounded-lg border border-[#EFE8EB]">
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Contato:</span>
                      <span className="font-medium text-[#202020]">{client.contactName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Responsável RX:</span>
                      <span className="font-semibold text-[#651D32]">{client.responsibleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Início:</span>
                      <span className="font-medium text-[#202020]">{client.startDate}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#202020]">Progresso Operacional</span>
                      <span className="font-bold text-[#651D32]">{prog.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#F4E9ED] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#651D32] h-full rounded-full transition-all duration-300"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#777777]">
                      <span>{prog.completed} de {prog.total} tarefas</span>
                      <span className="font-medium text-rose-700">{prog.pending} pendentes</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Next Activity */}
                <div className="pt-3 border-t border-[#F4E9ED] flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">
                      Próxima Atividade
                    </div>
                    <div className="font-medium text-[#202020] truncate text-xs mt-0.5">
                      {nextAct}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#651D32] transition group-hover:translate-x-0.5 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-[#EFE8EB] shadow-xs overflow-x-auto">
          <table className="responsive-records w-full text-left text-xs">
            <thead className="bg-[#F8F8F8] border-b border-[#EFE8EB] text-[#777777] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Responsável RX</th>
                <th className="py-3 px-4">Tarefas Pendentes</th>
                <th className="py-3 px-4">Progresso</th>
                <th className="py-3 px-4">Próxima Atividade</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {filteredClients.map((client) => {
                const prog = calculateClientProgress(tasks, client.id);
                const nextAct = getNextActivity(client.id);
                return (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className="hover:bg-[#FDFBFC] transition cursor-pointer"
                  >
                    <td data-label="Cliente" className="py-3 px-4 font-bold text-[#202020]">
                      <div>{client.name}</div>
                      <div className="text-[11px] font-normal text-[#777777]">{client.contactName}</div>
                    </td>
                    <td data-label="Status" className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          client.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700'
                            : client.status === 'pausado'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td data-label="Responsável" className="py-3 px-4 text-[#444444] font-medium">{client.responsibleName}</td>
                    <td data-label="Pendentes" className="py-3 px-4 font-semibold text-rose-700">{prog.pending}</td>
                    <td data-label="Progresso" className="py-3 px-4 w-40">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#F4E9ED] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#651D32] h-full rounded-full"
                            style={{ width: `${prog.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-[#651D32]">{prog.percentage}%</span>
                      </div>
                    </td>
                    <td data-label="Próxima atividade" className="py-3 px-4 text-[#777777] max-w-xs truncate">{nextAct}</td>
                    <td data-label="Ações" className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientId(client.id);
                        }}
                        className="text-[#651D32] font-semibold hover:underline cursor-pointer"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
