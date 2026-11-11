import React from 'react';
import {
  Clock,
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  Briefcase,
  Calendar,
  ArrowRight,
  Video,
  Users2,
  PackageCheck,
  Send,
  CheckSquare,
  CheckSquare2,
  ChevronRight,
  Flame,
  Plus,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  calculateDashboardMetrics,
  calculateClientProgress,
  isTaskOverdue,
  isTaskDueToday,
} from '../utils/metrics';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    clients,
    calendarEvents,
    currentUser,
    toggleTaskComplete,
    setActiveTab,
    setSelectedClientId,
    setSelectedTaskId,
    setIsNewClientModalOpen,
    setIsNewTaskModalOpen,
  } = useData();

  const todayStr = '2026-11-11';

  const metrics = calculateDashboardMetrics(tasks, clients, todayStr);

  // Filter tasks
  const myTasksToday = tasks.filter(
    (t) =>
      t.responsibleId === currentUser?.id &&
      t.dueDate === todayStr &&
      t.status !== 'concluida'
  );

  const teamTasks = tasks
    .filter((t) => t.status !== 'concluida')
    .sort((a, b) => {
      const aOverdue = isTaskOverdue(a, todayStr) ? 1 : 0;
      const bOverdue = isTaskOverdue(b, todayStr) ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    })
    .slice(0, 8);

  const upcomingEvents = [...calendarEvents]
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
    .slice(0, 5);

  const activeClients = clients.filter((c) => c.status === 'ativo');

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Alta</span>;
      case 'media':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Média</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Baixa</span>;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'gravacao':
        return <Video className="w-3.5 h-3.5 text-[#651D32]" />;
      case 'reuniao':
        return <Users2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'entrega':
        return <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'publicacao':
        return <Send className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 5 Top Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tarefas Hoje */}
        <button
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs hover:border-[#651D32]/40 transition text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Para Hoje</span>
            <div className="p-2 bg-[#F4E9ED] rounded-lg text-[#651D32] group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#202020] tracking-tight">
            {metrics.todayCount}
          </div>
          <div className="text-[11px] text-[#777777] mt-1">
            Vencimento em 11/11
          </div>
        </button>

        {/* Tarefas Atrasadas */}
        <button
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs hover:border-rose-400 transition text-left cursor-pointer group bg-gradient-to-br from-white to-rose-50/20"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Atrasadas</span>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 group-hover:scale-105 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-700 tracking-tight">
            {metrics.overdueCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {metrics.overdueCount > 0 ? 'Atenção necessária' : 'Nenhuma tarefa atrasada'}
          </div>
        </button>

        {/* Tarefas Em Andamento */}
        <button
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs hover:border-[#651D32]/40 transition text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Em Andamento</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700 group-hover:scale-105 transition">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#202020] tracking-tight">
            {metrics.inProgressCount}
          </div>
          <div className="text-[11px] text-[#777777] mt-1">
            Produção em execução
          </div>
        </button>

        {/* Concluídas */}
        <button
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs hover:border-[#651D32]/40 transition text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Concluídas</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 group-hover:scale-105 transition">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#202020] tracking-tight">
            {metrics.completedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Finalizadas no ciclo
          </div>
        </button>

        {/* Clientes Ativos */}
        <button
          onClick={() => setActiveTab('clients')}
          className="bg-white p-5 rounded-xl border border-[#EFE8EB] shadow-xs hover:border-[#651D32]/40 transition text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes Ativos</span>
            <div className="p-2 bg-[#F4E9ED] rounded-lg text-[#651D32] group-hover:scale-105 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#651D32] tracking-tight">
            {metrics.activeClientsCount}
          </div>
          <div className="text-[11px] text-[#777777] mt-1">
            Sob gestão contínua
          </div>
        </button>
      </div>

      {/* Main Grid: My Tasks & Team Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Minhas Tarefas de Hoje */}
          <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#651D32]" />
                <h3 className="font-bold text-sm text-[#202020]">
                  Minhas tarefas de hoje ({currentUser?.name || 'Eu'})
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#651D32] bg-[#F4E9ED] px-2.5 py-0.5 rounded-full">
                {myTasksToday.length} pendente{myTasksToday.length === 1 ? '' : 's'}
              </span>
            </div>

            {myTasksToday.length === 0 ? (
              <div className="py-8 text-center text-[#777777] space-y-1">
                <CheckSquare2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-[#202020]">Você não tem tarefas para hoje</p>
                <p className="text-xs text-[#777777]">
                  Nenhuma atividade atribuída a você com vencimento na data de hoje.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F8F8F8] mt-2">
                {myTasksToday.map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-center justify-between hover:bg-[#FDFBFC] px-2 rounded-lg transition"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0 pr-4">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                        title="Marcar como concluída"
                      >
                        <div className="w-4 h-4 rounded border-2 border-gray-300 hover:border-emerald-600" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="text-xs font-semibold text-[#202020] hover:text-[#651D32] transition text-left block truncate cursor-pointer"
                        >
                          {task.title}
                        </button>
                        <div className="flex items-center space-x-2 text-[11px] text-[#777777] mt-0.5">
                          <span className="font-medium text-[#651D32]">{task.clientName}</span>
                          <span>•</span>
                          <span>Etapa {task.stageId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {getPriorityBadge(task.priority)}
                      <button
                        onClick={() => setSelectedTaskId(task.id)}
                        className="text-xs text-[#777777] hover:text-[#202020] p-1 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Todas as Tarefas da Equipe */}
          <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-[#651D32]" />
                <h3 className="font-bold text-sm text-[#202020]">
                  Todas as tarefas da equipe
                </h3>
              </div>
              {tasks.length > 0 && (
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-semibold text-[#651D32] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver todas ({tasks.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {teamTasks.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold text-[#202020]">Nenhuma tarefa operacional pendente</p>
                <p className="text-[11px] text-[#777777] max-w-sm mx-auto">
                  Cadastre um cliente para aplicar o modelo padrão RX de 54 tarefas ou crie tarefas avulsas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#651D32] text-white text-xs font-semibold rounded-lg hover:bg-[#521627] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Nova Tarefa</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold text-[#777777] uppercase border-b border-[#F4E9ED]">
                      <th className="py-2.5 px-2">Atividade</th>
                      <th className="py-2.5 px-2">Cliente</th>
                      <th className="py-2.5 px-2">Responsável</th>
                      <th className="py-2.5 px-2">Prazo</th>
                      <th className="py-2.5 px-2">Prioridade</th>
                      <th className="py-2.5 px-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8] text-xs">
                    {teamTasks.map((task) => {
                      const overdue = isTaskOverdue(task, todayStr);
                      const dueToday = isTaskDueToday(task, todayStr);
                      return (
                        <tr key={task.id} className="hover:bg-[#FDFBFC] transition">
                          <td className="py-2.5 px-2 font-medium text-[#202020] max-w-xs truncate">
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="text-left hover:text-[#651D32] font-semibold truncate block w-full cursor-pointer"
                            >
                              {task.title}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 text-[#777777] font-medium whitespace-nowrap">
                            {task.clientName}
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap text-[#444444]">
                            {task.responsibleName}
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            {overdue ? (
                              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                                {task.dueDate} (Atrasada)
                              </span>
                            ) : dueToday ? (
                              <span className="text-[#651D32] font-bold bg-[#F4E9ED] px-2 py-0.5 rounded text-[11px]">
                                Hoje
                              </span>
                            ) : (
                              <span className="text-[#777777] text-[11px]">
                                {task.dueDate || 'Sem prazo'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-2.5 px-2 text-right whitespace-nowrap">
                            <button
                              onClick={() => toggleTaskComplete(task.id)}
                              className="text-[11px] font-semibold text-[#651D32] hover:text-[#521627] bg-[#F4E9ED] px-2.5 py-1 rounded-md transition cursor-pointer"
                            >
                              Concluir
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
        </div>

        {/* Right Column: Upcoming Activities & Active Clients */}
        <div className="space-y-6">
          {/* Próximas Atividades */}
          <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#651D32]" />
                <h3 className="font-bold text-sm text-[#202020]">Próximas atividades</h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-[#651D32] hover:underline cursor-pointer"
              >
                Calendário
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#777777]">
                  <p>Nenhuma atividade ou gravação agendada.</p>
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setActiveTab('calendar')}
                    className="p-3 bg-[#F8F8F8] hover:bg-[#F4E9ED]/50 rounded-lg border border-[#EFE8EB] transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        {getEventTypeIcon(evt.type)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#651D32]">
                          {evt.type}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#202020]">
                        {evt.date} {evt.startTime ? `• ${evt.startTime}` : ''}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#202020] truncate">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-[#777777] mt-1 flex items-center justify-between">
                      <span>{evt.clientName}</span>
                      <span>Resp: {evt.responsibleName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo dos Clientes */}
          <div className="bg-white p-6 rounded-xl border border-[#EFE8EB] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4E9ED]">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#651D32]" />
                <h3 className="font-bold text-sm text-[#202020]">Resumo dos Clientes</h3>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-xs font-semibold text-[#651D32] hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {activeClients.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#777777] space-y-2">
                  <p>Nenhum cliente ativo cadastrado.</p>
                  <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="text-[#651D32] font-bold hover:underline"
                  >
                    + Cadastrar primeiro cliente
                  </button>
                </div>
              ) : (
                activeClients.map((client) => {
                  const prog = calculateClientProgress(tasks, client.id);
                  return (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('clients');
                      }}
                      className="p-3 rounded-lg border border-[#EFE8EB] hover:border-[#651D32] transition bg-white hover:shadow-xs cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-xs text-[#202020] group-hover:text-[#651D32] transition">
                          {client.name}
                        </h4>
                        <span className="text-[11px] font-bold text-[#651D32]">
                          {prog.percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-[#F4E9ED] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#651D32] h-full rounded-full transition-all duration-300"
                          style={{ width: `${prog.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#777777]">
                        <span>{prog.pending} tarefas pendentes</span>
                        <span className="text-[#202020] font-medium">Ciclo {client.cycleNumber || 1}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
