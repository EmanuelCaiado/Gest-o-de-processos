import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpDown,
  Building,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { isTaskOverdue, isTaskDueToday, TaskItem } from '../utils/metrics';

export const TasksView: React.FC = () => {
  const {
    tasks,
    clients,
    users,
    toggleTaskComplete,
    deleteTask,
    updateTask,
    setIsNewTaskModalOpen,
    setSelectedTaskId,
    setSelectedClientId,
    setActiveTab,
    setClientActiveTab,
    searchQuery,
  } = useData();

  const todayStr = '2026-11-11';

  const [activeSubTab, setActiveSubTab] = useState<'hoje' | 'atrasadas' | 'proximas' | 'concluidas' | 'todas'>('hoje');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('todos');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'client'>('dueDate');

  // Filter tasks according to subtab and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Subtab filter
      if (activeSubTab === 'hoje') {
        if (!isTaskDueToday(t, todayStr)) return false;
      } else if (activeSubTab === 'atrasadas') {
        if (!isTaskOverdue(t, todayStr)) return false;
      } else if (activeSubTab === 'proximas') {
        if (t.status === 'concluida' || !t.dueDate || t.dueDate <= todayStr) return false;
      } else if (activeSubTab === 'concluidas') {
        if (t.status !== 'concluida') return false;
      }

      // Dropdown filters
      if (selectedClientFilter !== 'todos' && t.clientId !== selectedClientFilter) return false;
      if (selectedUserFilter !== 'todos' && t.responsibleId !== selectedUserFilter) return false;
      if (selectedStatusFilter !== 'todos' && t.status !== selectedStatusFilter) return false;
      if (selectedPriorityFilter !== 'todos' && t.priority !== selectedPriorityFilter) return false;

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchClient = t.clientName.toLowerCase().includes(q);
        const matchResp = t.responsibleName.toLowerCase().includes(q);
        if (!matchTitle && !matchClient && !matchResp) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      }
      if (sortBy === 'priority') {
        const weight = { alta: 3, media: 2, baixa: 1 };
        return weight[b.priority] - weight[a.priority];
      }
      if (sortBy === 'client') {
        return a.clientName.localeCompare(b.clientName);
      }
      return 0;
    });
  }, [tasks, activeSubTab, selectedClientFilter, selectedUserFilter, selectedStatusFilter, selectedPriorityFilter, searchQuery, sortBy]);

  // Tab counts
  const countHoje = tasks.filter((t) => isTaskDueToday(t, todayStr)).length;
  const countAtrasadas = tasks.filter((t) => isTaskOverdue(t, todayStr)).length;
  const countProximas = tasks.filter((t) => t.status !== 'concluida' && t.dueDate && t.dueDate > todayStr).length;
  const countConcluidas = tasks.filter((t) => t.status === 'concluida').length;
  const countTodas = tasks.length;

  const handleDelete = (taskId: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${title}"?`)) {
      deleteTask(taskId);
    }
  };

  const openClientPage = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientActiveTab('tasks');
    setActiveTab('clients');
  };

  return (
    <div className="p-4 sm:p-6 xl:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Subtabs Bar (5 abas obrigatórias: Hoje, Atrasadas, Próximas, Concluídas, Todas) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EFE8EB] shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'hoje', label: 'Hoje', count: countHoje, icon: Clock, color: 'text-[#651D32]' },
            { id: 'atrasadas', label: 'Atrasadas', count: countAtrasadas, icon: AlertTriangle, color: 'text-rose-700' },
            { id: 'proximas', label: 'Próximas', count: countProximas, icon: Calendar, color: 'text-blue-700' },
            { id: 'concluidas', label: 'Concluídas', count: countConcluidas, icon: CheckCircle2, color: 'text-emerald-700' },
            { id: 'todas', label: 'Todas', count: countTodas, icon: CheckSquare, color: 'text-gray-700' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#651D32] text-white shadow-xs'
                    : 'bg-[#F8F8F8] text-[#777777] hover:bg-[#F4E9ED] hover:text-[#651D32]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#202020]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Tarefa</span>
        </button>
      </div>

      {/* Filters & Sorting Strip */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE8EB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Client Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#777777] font-medium">Cliente:</span>
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
            >
              <option value="todos">Todos os Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Responsible Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#777777] font-medium">Responsável:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
            >
              <option value="todos">Toda a Equipe</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#777777] font-medium">Prioridade:</span>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
            >
              <option value="todos">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#777777] font-medium">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
            >
              <option value="todos">Todos</option>
              <option value="a_fazer">A Fazer</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#777777]" />
          <span className="text-[#777777] font-medium">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#F8F8F8] border border-[#EFE8EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202020] focus:ring-1 focus:ring-[#651D32]"
          >
            <option value="dueDate">Data de Vencimento</option>
            <option value="priority">Prioridade (Alta primeiro)</option>
            <option value="client">Nome do Cliente</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-[#EFE8EB] shadow-xs overflow-x-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-6 sm:p-12 text-center text-xs text-[#777777] space-y-2">
            <CheckSquare className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-semibold text-[#202020] text-sm">Nenhuma tarefa encontrada</p>
            <p className="text-[11px]">
              {tasks.length === 0
                ? 'O sistema está limpo. Cadastre um cliente com as 54 tarefas do modelo ou crie tarefas avulsas.'
                : 'Nenhuma atividade corresponde aos filtros selecionados.'}
            </p>
            {tasks.length === 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition"
                >
                  + Criar Nova Tarefa
                </button>
              </div>
            )}
          </div>
        ) : (
          <table className="responsive-records w-full text-left text-xs">
            <thead className="bg-[#F8F8F8] border-b border-[#EFE8EB] text-[#777777] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4 w-10">Concluir</th>
                <th className="py-3 px-4">Atividade</th>
                <th className="py-3 px-4">Cliente / Etapa</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Prazo</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'concluida';
                const overdue = isTaskOverdue(task, todayStr);
                const dueToday = isTaskDueToday(task, todayStr);

                return (
                  <tr key={task.id} className="hover:bg-[#FDFBFC] transition group">
                    {/* Checkbox */}
                    <td data-label="Concluir" className="py-3 px-4">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`rounded border-2 transition cursor-pointer flex items-center justify-center ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white w-4.5 h-4.5'
                            : 'border-gray-300 hover:border-emerald-600 w-4.5 h-4.5'
                        }`}
                        title={isDone ? 'Reabrir tarefa' : 'Concluir tarefa'}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Title */}
                    <td data-label="Atividade" className="py-3 px-4 font-medium max-w-md">
                      <button
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`text-left block w-full cursor-pointer truncate ${
                          isDone ? 'line-through text-gray-400 font-medium' : 'text-[#202020] hover:text-[#651D32] font-semibold'
                        }`}
                      >
                        {task.title}
                      </button>
                      {task.description && (
                        <p className="text-[11px] text-[#777777] truncate mt-0.5">{task.description}</p>
                      )}
                    </td>

                    {/* Client Link & Stage */}
                    <td data-label="Cliente / etapa" className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => openClientPage(task.clientId)}
                        className="font-bold text-[#651D32] hover:underline text-left block cursor-pointer"
                        title="Abrir página deste cliente"
                      >
                        {task.clientName}
                      </button>
                      <div className="text-[10px] text-[#777777]">
                        {task.stageId === 'sem_etapa' ? 'Sem etapa' : `Etapa 0${task.stageId}`}
                      </div>
                    </td>

                    {/* Responsible Selector */}
                    <td data-label="Responsável" className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={task.responsibleId}
                        onChange={(e) => {
                          const u = users.find((usr) => usr.id === e.target.value);
                          if (u) {
                            updateTask({
                              ...task,
                              responsibleId: u.id,
                              responsibleName: u.name,
                            });
                          }
                        }}
                        className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-1 text-xs text-[#444444] cursor-pointer"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Due Date */}
                    <td data-label="Prazo" className="py-3 px-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => updateTask({ ...task, dueDate: e.target.value })}
                        className={`text-xs px-2 py-1 rounded font-medium border ${
                          overdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                            : dueToday
                            ? 'bg-[#F4E9ED] text-[#651D32] border-[#E8DFE3] font-bold'
                            : 'bg-[#F8F8F8] text-[#202020] border-[#EFE8EB]'
                        }`}
                      />
                    </td>

                    {/* Priority */}
                    <td data-label="Prioridade" className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask({ ...task, priority: e.target.value as typeof task.priority })}
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded cursor-pointer ${
                          task.priority === 'alta'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'media'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td data-label="Status" className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          const newSt = e.target.value as typeof task.status;
                          updateTask({
                            ...task,
                            status: newSt,
                            completedAt: newSt === 'concluida' ? new Date().toISOString() : undefined,
                          });
                        }}
                        className={`text-[10px] font-bold rounded px-2 py-0.5 cursor-pointer uppercase ${
                          task.status === 'concluida'
                            ? 'bg-emerald-50 text-emerald-700'
                            : task.status === 'em_andamento'
                            ? 'bg-blue-50 text-blue-700'
                            : task.status === 'bloqueada'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="a_fazer">A Fazer</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="bloqueada">Bloqueada</option>
                        <option value="concluida">Concluída</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td data-label="Ações" className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="p-1 text-gray-400 hover:text-[#651D32] rounded transition cursor-pointer"
                          title="Editar / Detalhes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id, task.title)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
