import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Link,
  Tag,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronRight,
  ListFilter,
  CheckSquare,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { STAGE_TEMPLATES, KANBAN_STAGES, TaskItem, ClientItem } from '../utils/metrics';

export const Modals: React.FC = () => {
  const {
    clients,
    users,
    tasks,
    contents,
    selectedTaskId,
    setSelectedTaskId,
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    isNewContentModalOpen,
    setIsNewContentModalOpen,
    isNewEventModalOpen,
    setIsNewEventModalOpen,
    editingClient,
    setEditingClient,
    addClient,
    updateClient,
    addTask,
    updateTask,
    deleteTask,
    addContent,
    addCalendarEvent,
    selectedClientId,
  } = useData();

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientRespId, setNewClientRespId] = useState(users[0]?.id || '');
  const [newClientStartDate, setNewClientStartDate] = useState('2026-11-11');
  const [newClientService, setNewClientService] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [newClientGenerateTasks, setNewClientGenerateTasks] = useState(true);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Selected task IDs for template (default to all 54)
  const all54TaskIds = STAGE_TEMPLATES.flatMap((s) => s.defaultTasks.map((t) => t.id));
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>(all54TaskIds);

  const toggleTaskId = (id: number) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllTasks = () => setSelectedTaskIds(all54TaskIds);
  const deselectAllTasks = () => setSelectedTaskIds([]);

  // Edit Client Form State
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editRespId, setEditRespId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editService, setEditService] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (editingClient) {
      setEditName(editingClient.name);
      setEditContact(editingClient.contactName);
      setEditRespId(editingClient.responsibleId);
      setEditStartDate(editingClient.startDate);
      setEditService(editingClient.serviceDescription);
      setEditNotes(editingClient.internalNotes || '');
    }
  }, [editingClient]);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskClientId, setNewTaskClientId] = useState(selectedClientId || clients[0]?.id || '');
  const [newTaskStageId, setNewTaskStageId] = useState('1');
  const [newTaskContentId, setNewTaskContentId] = useState('');
  const [newTaskRespId, setNewTaskRespId] = useState(users[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-11-11');
  const [newTaskDueTime, setNewTaskDueTime] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [newTaskStatus, setNewTaskStatus] = useState<'a_fazer' | 'em_andamento' | 'bloqueada' | 'concluida'>('a_fazer');

  useEffect(() => {
    if (selectedClientId) {
      setNewTaskClientId(selectedClientId);
    } else if (clients.length > 0 && !newTaskClientId) {
      setNewTaskClientId(clients[0].id);
    }
  }, [selectedClientId, clients]);

  // New Content Form State
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentFormat, setNewContentFormat] = useState<'Reel' | 'Post Estático' | 'Carrossel' | 'Vídeo Longo' | 'Stories'>('Reel');
  const [newContentClientId, setNewContentClientId] = useState(selectedClientId || clients[0]?.id || '');
  const [newContentRespId, setNewContentRespId] = useState(users[0]?.id || '');
  const [newContentTargetDate, setNewContentTargetDate] = useState('2026-11-18');
  const [newContentStage, setNewContentStage] = useState(1);
  const [newContentScriptUrl, setNewContentScriptUrl] = useState('');
  const [newContentFilesUrl, setNewContentFilesUrl] = useState('');
  const [newContentNotes, setNewContentNotes] = useState('');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'gravacao' | 'reuniao' | 'entrega' | 'publicacao'>('gravacao');
  const [newEventClientId, setNewEventClientId] = useState(selectedClientId || clients[0]?.id || '');
  const [newEventDate, setNewEventDate] = useState('2026-11-12');
  const [newEventStart, setNewEventStart] = useState('14:00');
  const [newEventEnd, setNewEventEnd] = useState('18:00');
  const [newEventRespId, setNewEventRespId] = useState(users[0]?.id || '');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Checklist sub-item input inside task detail
  const [newChecklistText, setNewChecklistText] = useState('');

  const currentDetailTask = tasks.find((t) => t.id === selectedTaskId);

  // Submit New Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const resp = users.find((u) => u.id === newClientRespId) || users[0];
    addClient(
      {
        name: newClientName.trim(),
        contactName: newClientContact.trim() || newClientName.trim(),
        responsibleId: resp.id,
        responsibleName: resp.name,
        startDate: newClientStartDate,
        status: 'ativo',
        serviceDescription: newClientService.trim() || 'Gestão de Conteúdo e Posicionamento Digital',
        internalNotes: newClientNotes.trim(),
      },
      newClientGenerateTasks,
      newClientGenerateTasks ? selectedTaskIds : []
    );

    // Reset & close
    setNewClientName('');
    setNewClientContact('');
    setNewClientService('');
    setNewClientNotes('');
    setSelectedTaskIds(all54TaskIds);
    setShowTaskSelector(false);
    setIsNewClientModalOpen(false);
  };

  // Submit Edit Client
  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editName.trim()) return;

    const resp = users.find((u) => u.id === editRespId) || users[0];
    updateClient({
      ...editingClient,
      name: editName.trim(),
      contactName: editContact.trim() || editName.trim(),
      responsibleId: resp.id,
      responsibleName: resp.name,
      startDate: editStartDate,
      serviceDescription: editService.trim(),
      internalNotes: editNotes.trim(),
    });

    setEditingClient(null);
  };

  // Submit New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const cl = clients.find((c) => c.id === newTaskClientId) || clients[0];
    const resp = users.find((u) => u.id === newTaskRespId) || users[0];

    addTask({
      clientId: cl?.id || 'geral',
      clientName: cl?.name || 'Geral',
      stageId: newTaskStageId,
      contentId: newTaskContentId || undefined,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      responsibleId: resp.id,
      responsibleName: resp.name,
      dueDate: newTaskDueDate,
      dueTime: newTaskDueTime || undefined,
      priority: newTaskPriority,
      status: newTaskStatus,
      checklist: [],
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDueTime('');
    setIsNewTaskModalOpen(false);
  };

  // Submit New Content
  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;

    const cl = clients.find((c) => c.id === newContentClientId) || clients[0];
    const resp = users.find((u) => u.id === newContentRespId) || users[0];

    addContent({
      clientId: cl?.id || 'geral',
      clientName: cl?.name || 'Geral',
      title: newContentTitle.trim(),
      format: newContentFormat,
      responsibleId: resp.id,
      responsibleName: resp.name,
      targetDate: newContentTargetDate,
      stage: newContentStage,
      hasPendingReview: false,
      scriptUrl: newContentScriptUrl.trim() || undefined,
      filesUrl: newContentFilesUrl.trim() || undefined,
      notes: newContentNotes.trim() || undefined,
    });

    setNewContentTitle('');
    setNewContentScriptUrl('');
    setNewContentFilesUrl('');
    setNewContentNotes('');
    setIsNewContentModalOpen(false);
  };

  // Submit New Calendar Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const cl = clients.find((c) => c.id === newEventClientId);
    const resp = users.find((u) => u.id === newEventRespId) || users[0];

    addCalendarEvent({
      clientId: cl?.id,
      clientName: cl?.name,
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      startTime: newEventStart,
      endTime: newEventEnd,
      responsibleId: resp.id,
      responsibleName: resp.name,
      description: newEventDesc.trim() || undefined,
    });

    setNewEventTitle('');
    setNewEventDesc('');
    setIsNewEventModalOpen(false);
  };

  return (
    <>
      {/* 1. MODAL: NOVO CLIENTE (COM SELETOR DAS 54 TAREFAS DO MODELO RX) */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#651D32]" />
                <h3 className="font-bold text-base text-[#202020]">Cadastrar Novo Cliente</h3>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">
                    Nome do Cliente ou Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: Empresa X / Dr. Fulano"
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">
                    Nome do Contato Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    placeholder="Ex: Responsável direto"
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">
                    Responsável Interno RX *
                  </label>
                  <select
                    value={newClientRespId}
                    onChange={(e) => setNewClientRespId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={newClientStartDate}
                    onChange={(e) => setNewClientStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">
                  Serviço Contratado
                </label>
                <input
                  type="text"
                  value={newClientService}
                  onChange={(e) => setNewClientService(e.target.value)}
                  placeholder="Ex: Gestão de Instagram, produção de Reels e autoridade digital"
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">
                  Observações Internas & Parâmetros Operacionais
                </label>
                <textarea
                  rows={2}
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Ex: Até 2 gravações/mês (máx 5h). Até 2 reuniões mensais. Regras de validação..."
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              {/* OPÇÃO: APLICAR MODELO PADRÃO RX COM PERSONALIZAÇÃO DAS 54 TAREFAS */}
              <div className="p-3.5 bg-[#F4E9ED] rounded-xl border border-[#E8DFE3] space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="genTasks"
                      checked={newClientGenerateTasks}
                      onChange={(e) => setNewClientGenerateTasks(e.target.checked)}
                      className="mt-0.5 rounded text-[#651D32] focus:ring-[#651D32]"
                    />
                    <label htmlFor="genTasks" className="text-xs text-[#202020] cursor-pointer">
                      <span className="font-bold text-[#651D32] block">
                        Aplicar modelo padrão de processos RX
                      </span>
                      Gera as 9 etapas operacionais e suas tarefas correspondentes para este cliente.
                    </label>
                  </div>

                  {newClientGenerateTasks && (
                    <button
                      type="button"
                      onClick={() => setShowTaskSelector(!showTaskSelector)}
                      className="text-[11px] font-bold text-[#651D32] hover:underline flex items-center space-x-1 shrink-0"
                    >
                      <span>{showTaskSelector ? 'Recolher' : 'Personalizar tarefas'}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition transform ${showTaskSelector ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Seletor detalhado de tarefas do modelo */}
                {newClientGenerateTasks && showTaskSelector && (
                  <div className="pt-2 border-t border-[#E2D4D9] space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#202020]">
                        {selectedTaskIds.length} de 54 tarefas selecionadas
                      </span>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={selectAllTasks}
                          className="text-[#651D32] hover:underline font-semibold"
                        >
                          Marcar todas
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={deselectAllTasks}
                          className="text-[#777777] hover:underline"
                        >
                          Desmarcar todas
                        </button>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 bg-white p-2.5 rounded-lg border border-[#E8DFE3]">
                      {STAGE_TEMPLATES.map((s) => (
                        <div key={s.id} className="space-y-1">
                          <div className="font-bold text-[10px] text-[#651D32] uppercase">
                            Etapa {s.id}: {s.title}
                          </div>
                          <div className="space-y-1 pl-2">
                            {s.defaultTasks.map((t) => (
                              <label
                                key={t.id}
                                className="flex items-start space-x-2 text-[11px] text-[#333333] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTaskIds.includes(t.id)}
                                  onChange={() => toggleTaskId(t.id)}
                                  className="mt-0.5 rounded text-[#651D32]"
                                />
                                <span className="leading-tight">{t.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 text-[#777777] hover:text-[#202020] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
                >
                  Salvar e Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: EDITAR CLIENTE */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <h3 className="font-bold text-base text-[#202020]">Editar Cliente</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Contato Principal</label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Responsável RX</label>
                  <select
                    value={editRespId}
                    onChange={(e) => setEditRespId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">Serviço Contratado</label>
                <input
                  type="text"
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">Observações & Regras</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-[#777777] hover:text-[#202020] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: NOVA TAREFA (COM SELEÇÃO DE ETAPA OU "SEM ETAPA") */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <h3 className="font-bold text-base text-[#202020]">Criar Nova Tarefa</h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#202020] block mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Roteirizar primeiro lote de Reels do cliente"
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">Descrição (opcional)</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Orientações e especificações da atividade..."
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Cliente Vinculado</label>
                  <select
                    value={newTaskClientId}
                    onChange={(e) => setNewTaskClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {clients.length === 0 ? (
                      <option value="">Nenhum cliente (Crie um cliente antes)</option>
                    ) : (
                      clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Etapa do Processo</label>
                  <select
                    value={newTaskStageId}
                    onChange={(e) => setNewTaskStageId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="sem_etapa">Sem etapa específica</option>
                    {STAGE_TEMPLATES.map((s) => (
                      <option key={s.id} value={s.id}>
                        Etapa {s.id}: {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Responsável</label>
                  <select
                    value={newTaskRespId}
                    onChange={(e) => setNewTaskRespId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Horário (opcional)</label>
                  <input
                    type="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Prioridade</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Conteúdo Relacionado</label>
                  <select
                    value={newTaskContentId}
                    onChange={(e) => setNewTaskContentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="">Nenhum conteúdo vinculado</option>
                    {contents
                      .filter((c) => !newTaskClientId || c.clientId === newTaskClientId)
                      .map((cnt) => (
                        <option key={cnt.id} value={cnt.id}>
                          {cnt.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-[#777777] hover:text-[#202020] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: NOVO CONTEÚDO (KANBAN) */}
      {isNewContentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <h3 className="font-bold text-base text-[#202020]">Adicionar Conteúdo ao Kanban</h3>
              <button
                onClick={() => setIsNewContentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#202020] block mb-1">Título do Conteúdo *</label>
                <input
                  type="text"
                  required
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  placeholder="Ex: Reel: Análise de caso prático"
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Formato</label>
                  <select
                    value={newContentFormat}
                    onChange={(e) => setNewContentFormat(e.target.value as typeof newContentFormat)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="Reel">Reel</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Post Estático">Post Estático</option>
                    <option value="Vídeo Longo">Vídeo Longo</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Cliente</label>
                  <select
                    value={newContentClientId}
                    onChange={(e) => setNewContentClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Responsável</label>
                  <select
                    value={newContentRespId}
                    onChange={(e) => setNewContentRespId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={newContentTargetDate}
                    onChange={(e) => setNewContentTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Link do Roteiro</label>
                  <input
                    type="url"
                    value={newContentScriptUrl}
                    onChange={(e) => setNewContentScriptUrl(e.target.value)}
                    placeholder="https://docs.google.com/..."
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Link dos Arquivos</label>
                  <input
                    type="url"
                    value={newContentFilesUrl}
                    onChange={(e) => setNewContentFilesUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={newContentNotes}
                  onChange={(e) => setNewContentNotes(e.target.value)}
                  placeholder="Orientações de edição, gancho, CTA..."
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => setIsNewContentModalOpen(false)}
                  className="px-4 py-2 text-[#777777] hover:text-[#202020] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
                >
                  Adicionar ao Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: NOVO EVENTO DE CALENDÁRIO */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <h3 className="font-bold text-base text-[#202020]">Agendar Atividade Operacional</h3>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#202020] block mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Ex: Gravação Presencial (Diária 1)"
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Tipo de Evento</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as typeof newEventType)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="gravacao">Gravação</option>
                    <option value="reuniao">Reunião</option>
                    <option value="entrega">Entrega</option>
                    <option value="publicacao">Publicação</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Cliente Vinculado</label>
                  <select
                    value={newEventClientId}
                    onChange={(e) => setNewEventClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="">Geral (Sem cliente)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Data</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Início</label>
                  <input
                    type="time"
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202020] block mb-1">Término</label>
                  <input
                    type="time"
                    value={newEventEnd}
                    onChange={(e) => setNewEventEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202020] block mb-1">Responsável RX</label>
                <select
                  value={newEventRespId}
                  onChange={(e) => setNewEventRespId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 text-[#777777] hover:text-[#202020] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DRAWER / MODAL: DETALHES & EDIÇÃO DA TAREFA */}
      {selectedTaskId && currentDetailTask && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE8EB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E9ED]">
              <span className="text-[10px] font-bold text-[#651D32] uppercase bg-[#F4E9ED] px-2.5 py-0.5 rounded">
                Etapa {currentDetailTask.stageId} • {currentDetailTask.clientName}
              </span>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#777777] block mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  value={currentDetailTask.title}
                  onChange={(e) => updateTask({ ...currentDetailTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg font-bold text-sm text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#777777] block mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={currentDetailTask.description || ''}
                  onChange={(e) => updateTask({ ...currentDetailTask, description: e.target.value })}
                  placeholder="Orientações e especificações técnicas..."
                  className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#777777] block mb-1">Responsável</label>
                  <select
                    value={currentDetailTask.responsibleId}
                    onChange={(e) => {
                      const u = users.find((usr) => usr.id === e.target.value);
                      if (u) {
                        updateTask({
                          ...currentDetailTask,
                          responsibleId: u.id,
                          responsibleName: u.name,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#777777] block mb-1">Vencimento</label>
                  <div className="flex space-x-1">
                    <input
                      type="date"
                      value={currentDetailTask.dueDate || ''}
                      onChange={(e) => updateTask({ ...currentDetailTask, dueDate: e.target.value })}
                      className="w-full px-2 py-1.5 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                    />
                    <input
                      type="time"
                      value={currentDetailTask.dueTime || ''}
                      onChange={(e) => updateTask({ ...currentDetailTask, dueTime: e.target.value })}
                      className="w-24 px-1.5 py-1.5 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#777777] block mb-1">Prioridade</label>
                  <select
                    value={currentDetailTask.priority}
                    onChange={(e) =>
                      updateTask({
                        ...currentDetailTask,
                        priority: e.target.value as typeof currentDetailTask.priority,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#777777] block mb-1">Status</label>
                  <select
                    value={currentDetailTask.status}
                    onChange={(e) => {
                      const newSt = e.target.value as typeof currentDetailTask.status;
                      updateTask({
                        ...currentDetailTask,
                        status: newSt,
                        completedAt: newSt === 'concluida' ? new Date().toISOString() : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-[#202020] font-semibold focus:ring-1 focus:ring-[#651D32]"
                  >
                    <option value="a_fazer">A Fazer</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="bloqueada">Bloqueada</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>

              {/* Sub-Checklist */}
              <div className="pt-2 border-t border-[#F8F8F8]">
                <label className="font-bold text-[#202020] block mb-2">Checklist Interno</label>
                <div className="space-y-1.5 mb-2">
                  {(currentDetailTask.checklist || []).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {
                          const updatedChecklist = (currentDetailTask.checklist || []).map((c) =>
                            c.id === item.id ? { ...c, done: !c.done } : c
                          );
                          updateTask({ ...currentDetailTask, checklist: updatedChecklist });
                        }}
                        className="rounded text-[#651D32] focus:ring-[#651D32]"
                      />
                      <span className={`text-xs ${item.done ? 'line-through text-gray-400' : 'text-[#202020]'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newChecklistText.trim()) {
                          const newItem = {
                            id: `chk_${Date.now()}`,
                            text: newChecklistText.trim(),
                            done: false,
                          };
                          updateTask({
                            ...currentDetailTask,
                            checklist: [...(currentDetailTask.checklist || []), newItem],
                          });
                          setNewChecklistText('');
                        }
                      }
                    }}
                    placeholder="Adicionar sub-item (Pressione Enter)..."
                    className="flex-1 px-3 py-1.5 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistText.trim()) {
                        const newItem = {
                          id: `chk_${Date.now()}`,
                          text: newChecklistText.trim(),
                          done: false,
                        };
                        updateTask({
                          ...currentDetailTask,
                          checklist: [...(currentDetailTask.checklist || []), newItem],
                        });
                        setNewChecklistText('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#F4E9ED] text-[#651D32] font-semibold rounded-lg hover:bg-[#ebd9df]"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F4E9ED]">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir "${currentDetailTask.title}"?`)) {
                      deleteTask(currentDetailTask.id);
                      setSelectedTaskId(null);
                    }
                  }}
                  className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Tarefa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTaskId(null)}
                  className="px-5 py-2 bg-[#651D32] text-white font-semibold rounded-lg hover:bg-[#521627] cursor-pointer"
                >
                  Concluir Edição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
