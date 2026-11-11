import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClientItem,
  TaskItem,
  ContentItem,
  CalendarEventItem,
  generateClientTemplateTasks,
  STAGE_TEMPLATES,
} from '../utils/metrics';
import { UserItem, AuditLogItem, AppDatabase, INITIAL_USERS, getInitialSeedDatabase } from '../data/seedData';
import {
  supabase,
  isSupabaseConfigured,
  SupabaseHealthResult,
  checkSupabaseConnection,
  syncClientToSupabase,
  syncTaskToSupabase,
  deleteClientFromSupabase,
} from '../lib/supabase';

import { requestAuth, restoreSession, type AuthResult } from '../lib/auth';

interface DataContextType {
  // State
  currentUser: UserItem | null;
  isSessionLoading: boolean;
  users: UserItem[];
  clients: ClientItem[];
  tasks: TaskItem[];
  contents: ContentItem[];
  calendarEvents: CalendarEventItem[];
  auditLogs: AuditLogItem[];
  activeTab: 'overview' | 'clients' | 'tasks' | 'calendar' | 'processes';
  selectedClientId: string | null;
  clientActiveTab: 'tasks' | 'contents' | 'processes' | 'overview';
  selectedTaskId: string | null;
  selectedStageId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  editingClient: ClientItem | null;

  // Navigation & UI controls
  setActiveTab: (tab: 'overview' | 'clients' | 'tasks' | 'calendar' | 'processes') => void;
  setSelectedClientId: (clientId: string | null) => void;
  setClientActiveTab: (tab: 'tasks' | 'contents' | 'processes' | 'overview') => void;
  setSelectedTaskId: (taskId: string | null) => void;
  setSelectedStageId: (stageId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setEditingClient: (client: ClientItem | null) => void;
  canGoBack: boolean;
  goBack: () => void;
  navigateToTab: (tab: 'overview' | 'clients' | 'tasks' | 'calendar' | 'processes') => void;
  navigateToClient: (clientId: string | null) => void;

  // Modals
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  isNewContentModalOpen: boolean;
  setIsNewContentModalOpen: (open: boolean) => void;
  isNewEventModalOpen: boolean;
  setIsNewEventModalOpen: (open: boolean) => void;
  supabaseStatus: SupabaseHealthResult | null;
  checkSupabase: () => Promise<void>;

  // Auth
  login: (loginInput: string, passwordInput: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  switchUser: (userId: string, password: string) => Promise<AuthResult>;

  // Client operations
  addClient: (
    client: Omit<ClientItem, 'id' | 'cycleNumber' | 'createdAt' | 'updatedAt'>,
    generateStandardTasks?: boolean,
    selectedTaskIds?: number[]
  ) => ClientItem;
  updateClient: (client: ClientItem) => void;
  deleteClient: (clientId: string) => void;
  pauseClient: (clientId: string) => void;
  reactivateClient: (clientId: string) => void;
  archiveClient: (clientId: string) => void;
  repeatClientCycle: (clientId: string, selectedTaskIds?: number[]) => void;

  // Task operations
  addTask: (
    task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'cycleNumber' | 'orderIndex'>,
    cycleOverride?: number
  ) => TaskItem;
  updateTask: (task: TaskItem) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;

  // Content operations
  addContent: (
    content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'cycleNumber'>,
    cycleOverride?: number
  ) => ContentItem;
  updateContent: (content: ContentItem) => void;
  deleteContent: (contentId: string) => void;
  moveContentStage: (contentId: string, newStage: number) => void;

  // Event operations
  addCalendarEvent: (event: Omit<CalendarEventItem, 'id'>) => CalendarEventItem;
  updateCalendarEvent: (event: CalendarEventItem) => void;
  deleteCalendarEvent: (eventId: string) => void;

  // System
  resetDatabase: () => Promise<void>;
  logAudit: (entityType: 'task' | 'content' | 'client' | 'event', entityId: string, action: string, details: string) => void;
}

const LOCAL_STORAGE_KEY = 'rx_workspace_db_v2';
const CURRENT_USER_KEY = 'rx_workspace_user_v2';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppDatabase>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // If the cache contains old demo clients like Alochio, purge it so it starts 100% clean
        if (parsed && Array.isArray(parsed.clients) && parsed.clients.some((c: any) => c.name?.includes('Alochio'))) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return getInitialSeedDatabase();
        }
        return { ...parsed, users: INITIAL_USERS };
      }
    } catch {
      // ignore
    }
    return getInitialSeedDatabase();
  });

  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Old browser storage never authenticates a user.
    try { localStorage.removeItem(CURRENT_USER_KEY); } catch { /* Storage may be disabled. */ }
    restoreSession().then(user => { if (mounted) setCurrentUser(user); })
      .catch(() => { if (mounted) setCurrentUser(null); })
      .finally(() => { if (mounted) setIsSessionLoading(false); });
    return () => { mounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'tasks' | 'calendar' | 'processes'>('overview');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  // Default to 'tasks' when opening a client as requested in Section 4!
  const [clientActiveTab, setClientActiveTab] = useState<'tasks' | 'contents' | 'processes' | 'overview'>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  // Navigation history stack for the back button
  const [navHistory, setNavHistory] = useState<
    { tab: 'overview' | 'clients' | 'tasks' | 'calendar' | 'processes'; selectedClientId: string | null }[]
  >([]);

  const navigateToTab = useCallback(
    (tab: 'overview' | 'clients' | 'tasks' | 'calendar' | 'processes') => {
      setNavHistory((prev) => [...prev.slice(-20), { tab: activeTab, selectedClientId }]);
      setActiveTab(tab);
    },
    [activeTab, selectedClientId]
  );

  const navigateToClient = useCallback(
    (clientId: string | null) => {
      setNavHistory((prev) => [...prev.slice(-20), { tab: activeTab, selectedClientId }]);
      setSelectedClientId(clientId);
      setClientActiveTab('tasks');
    },
    [activeTab, selectedClientId]
  );

  const goBack = useCallback(() => {
    if (selectedClientId) {
      setSelectedClientId(null);
      return;
    }
    if (navHistory.length > 0) {
      const last = navHistory[navHistory.length - 1];
      setNavHistory((h) => h.slice(0, -1));
      setActiveTab(last.tab);
      setSelectedClientId(last.selectedClientId);
      return;
    }
    if (activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [selectedClientId, navHistory, activeTab]);

  const canGoBack = Boolean(selectedClientId || navHistory.length > 0 || activeTab !== 'overview');

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewContentModalOpen, setIsNewContentModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealthResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const checkSupabase = useCallback(async () => {
    try {
      const res = await checkSupabaseConnection();
      setSupabaseStatus(res);
    } catch (e) {
      console.warn('Erro ao verificar Supabase:', e);
    }
  }, []);

  useEffect(() => {
    checkSupabase();
  }, [checkSupabase]);

  // Sync to server, Supabase & localStorage
  const persistDatabase = useCallback(async (newDb: AppDatabase) => {
    setData(newDb);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDb));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb),
      });
    } catch (err: unknown) {
      console.warn('Backend sync note (using persistent cache):', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Fetch from server / Supabase on mount
  useEffect(() => {
    let mounted = true;
    if (!currentUser) { setIsLoading(false); return; }
    async function loadFromServer() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/data');
        if (res.ok) {
          const serverDb: AppDatabase = await res.json();
          // Filter out any lingering Alochio demo data if present in old files
          if (mounted && serverDb && Array.isArray(serverDb.clients)) {
            const cleanClients = serverDb.clients.filter((c) => !c.name.includes('Alochio'));
            const cleanClientIds = new Set(cleanClients.map((c) => c.id));
            const cleanDb: AppDatabase = {
              ...serverDb,
              users: INITIAL_USERS,
              clients: cleanClients,
              tasks: serverDb.tasks.filter((t) => cleanClientIds.has(t.clientId)),
              contents: serverDb.contents.filter((c) => cleanClientIds.has(c.clientId)),
              calendarEvents: serverDb.calendarEvents.filter((e) => !e.clientId || cleanClientIds.has(e.clientId)),
            };
            setData(cleanDb);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanDb));
          }
        }
      } catch (err) {
        console.warn('Could not load from /api/data, using local cache:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadFromServer();
    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  // Audit log helper
  const logAudit = useCallback(
    (entityType: 'task' | 'content' | 'client' | 'event', entityId: string, action: string, details: string) => {
      const newLog: AuditLogItem = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        entityType,
        entityId,
        action,
        userName: currentUser?.name || 'Sistema',
        timestamp: new Date().toISOString(),
        details,
      };
      setData((prev) => {
        const updated = {
          ...prev,
          auditLogs: [newLog, ...prev.auditLogs].slice(0, 100),
        };
        persistDatabase(updated);
        return updated;
      });
    },
    [currentUser, persistDatabase]
  );

  // Password verification and remembered sessions are handled by the server.
  const login = useCallback(async (loginInput: string, passwordInput: string): Promise<AuthResult> => {
    const result = await requestAuth('login', { login: loginInput.trim(), password: passwordInput });
    if (!result.success || !result.user) return { success: false, error: result.error };
    setCurrentUser(result.user);
    setActiveTab('overview');
    setSelectedClientId(null);
    logAudit('client', result.user.id, 'Login efetuado', 'Acesso validado.');
    return { success: true };
  }, [logAudit]);

  const logout = useCallback(async (): Promise<AuthResult> => {
    const result = await requestAuth('logout');
    if (!result.success) return result;
    setCurrentUser(null);
    setActiveTab('overview');
    setSelectedClientId(null);
    setSelectedTaskId(null);
    setNavHistory([]);
    try { localStorage.removeItem(CURRENT_USER_KEY); } catch { /* Storage may be disabled. */ }
    return { success: true };
  }, []);

  const switchUser = useCallback(async (userId: string, password: string): Promise<AuthResult> => {
    const result = await requestAuth('switch', { userId, password });
    if (!result.success || !result.user) return { success: false, error: result.error };
    setCurrentUser(result.user);
    setActiveTab('overview');
    setSelectedClientId(null);
    setSelectedTaskId(null);
    setNavHistory([]);
    logAudit('client', result.user.id, 'Integrante alternado', 'Senha validada para troca de conta.');
    return { success: true };
  }, [logAudit]);

  // Client operations
  const addClient = useCallback(
    (
      clientData: Omit<ClientItem, 'id' | 'cycleNumber' | 'createdAt' | 'updatedAt'>,
      generateStandardTasks = true,
      selectedTaskIds?: number[]
    ): ClientItem => {
      const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newClient: ClientItem = {
        ...clientData,
        id: clientId,
        cycleNumber: 1,
        createdAt: now,
        updatedAt: now,
      };

      let newTasks: TaskItem[] = [];
      if (generateStandardTasks) {
        newTasks = generateClientTemplateTasks({
          clientId,
          clientName: clientData.name,
          responsibleId: clientData.responsibleId,
          responsibleName: clientData.responsibleName,
          cycleNumber: 1,
          startDateStr: clientData.startDate || now.split('T')[0],
          selectedTaskIds,
        });
      }

      setData((prev) => {
        const updated = {
          ...prev,
          clients: [newClient, ...prev.clients],
          tasks: [...newTasks, ...prev.tasks],
        };
        persistDatabase(updated);
        return updated;
      });

      logAudit(
        'client',
        clientId,
        'Cliente cadastrado',
        `Cliente "${newClient.name}" cadastrado com ${newTasks.length} tarefas geradas.`
      );

      // Async sync to Supabase
      syncClientToSupabase(newClient);
      newTasks.forEach((t) => syncTaskToSupabase(t));

      return newClient;
    },
    [logAudit, persistDatabase]
  );

  const updateClient = useCallback(
    (updatedClient: ClientItem) => {
      setData((prev) => {
        const updated = {
          ...prev,
          clients: prev.clients.map((c) =>
            c.id === updatedClient.id ? { ...updatedClient, updatedAt: new Date().toISOString() } : c
          ),
          tasks: prev.tasks.map((t) =>
            t.clientId === updatedClient.id ? { ...t, clientName: updatedClient.name } : t
          ),
          contents: prev.contents.map((cnt) =>
            cnt.clientId === updatedClient.id ? { ...cnt, clientName: updatedClient.name } : cnt
          ),
          calendarEvents: prev.calendarEvents.map((evt) =>
            evt.clientId === updatedClient.id ? { ...evt, clientName: updatedClient.name } : evt
          ),
        };
        persistDatabase(updated);
        return updated;
      });
      syncClientToSupabase(updatedClient);
      logAudit('client', updatedClient.id, 'Cliente atualizado', `Dados de "${updatedClient.name}" alterados.`);
    },
    [logAudit, persistDatabase]
  );

  const deleteClient = useCallback(
    (clientId: string) => {
      const client = data.clients.find((c) => c.id === clientId);
      setData((prev) => {
        const updated = {
          ...prev,
          clients: prev.clients.filter((c) => c.id !== clientId),
          tasks: prev.tasks.filter((t) => t.clientId !== clientId),
          contents: prev.contents.filter((c) => c.clientId !== clientId),
          calendarEvents: prev.calendarEvents.filter((e) => e.clientId !== clientId),
        };
        persistDatabase(updated);
        return updated;
      });
      deleteClientFromSupabase(clientId);
      if (selectedClientId === clientId) {
        setSelectedClientId(null);
      }
      if (client) {
        logAudit('client', clientId, 'Cliente excluído', `Cliente "${client.name}" e seus registros foram removidos.`);
      }
    },
    [data.clients, logAudit, persistDatabase, selectedClientId]
  );

  const pauseClient = useCallback(
    (clientId: string) => {
      const client = data.clients.find((c) => c.id === clientId);
      if (!client) return;
      updateClient({ ...client, status: 'pausado' });
    },
    [data.clients, updateClient]
  );

  const reactivateClient = useCallback(
    (clientId: string) => {
      const client = data.clients.find((c) => c.id === clientId);
      if (!client) return;
      updateClient({ ...client, status: 'ativo' });
    },
    [data.clients, updateClient]
  );

  const archiveClient = useCallback(
    (clientId: string) => {
      const client = data.clients.find((c) => c.id === clientId);
      if (!client) return;
      updateClient({ ...client, status: 'encerrado' });
    },
    [data.clients, updateClient]
  );

  const repeatClientCycle = useCallback(
    (clientId: string, selectedTaskIds?: number[]) => {
      const client = data.clients.find((c) => c.id === clientId);
      if (!client) return;
      const nextCycle = (client.cycleNumber || 1) + 1;
      const updatedClient: ClientItem = {
        ...client,
        cycleNumber: nextCycle,
        updatedAt: new Date().toISOString(),
      };

      const newCycleTasks = generateClientTemplateTasks({
        clientId: client.id,
        clientName: client.name,
        responsibleId: client.responsibleId,
        responsibleName: client.responsibleName,
        cycleNumber: nextCycle,
        startDateStr: new Date().toISOString().split('T')[0],
        selectedTaskIds,
      });

      setData((prev) => {
        const updated = {
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? updatedClient : c)),
          tasks: [...newCycleTasks, ...prev.tasks],
        };
        persistDatabase(updated);
        return updated;
      });

      logAudit(
        'client',
        clientId,
        'Novo ciclo gerado',
        `Ciclo ${nextCycle} iniciado para "${client.name}" com ${newCycleTasks.length} novas tarefas.`
      );
    },
    [data.clients, logAudit, persistDatabase]
  );

  // Task operations
  const addTask = useCallback(
    (
      taskData: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'cycleNumber' | 'orderIndex'>,
      cycleOverride?: number
    ): TaskItem => {
      const taskId = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const client = data.clients.find((c) => c.id === taskData.clientId);
      const cycle = cycleOverride || client?.cycleNumber || 1;

      const newTask: TaskItem = {
        ...taskData,
        id: taskId,
        orderIndex: 999,
        cycleNumber: cycle,
        createdAt: now,
        updatedAt: now,
      };

      setData((prev) => {
        const updated = {
          ...prev,
          tasks: [newTask, ...prev.tasks],
        };
        persistDatabase(updated);
        return updated;
      });

      logAudit('task', taskId, 'Tarefa criada', `Tarefa "${newTask.title}" adicionada para ${newTask.clientName}.`);
      syncTaskToSupabase(newTask);
      return newTask;
    },
    [data.clients, logAudit, persistDatabase]
  );

  const updateTask = useCallback(
    (updatedTask: TaskItem) => {
      setData((prev) => {
        const now = new Date().toISOString();
        const updated = {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === updatedTask.id ? { ...updatedTask, updatedAt: now } : t
          ),
          // sync linked calendar event date if dueDate changed
          calendarEvents: prev.calendarEvents.map((evt) => {
            if (evt.taskId === updatedTask.id && updatedTask.dueDate) {
              return { ...evt, date: updatedTask.dueDate, title: updatedTask.title };
            }
            return evt;
          }),
        };
        persistDatabase(updated);
        return updated;
      });

      syncTaskToSupabase(updatedTask);
      logAudit('task', updatedTask.id, 'Tarefa atualizada', `"${updatedTask.title}" atualizada.`);
    },
    [logAudit, persistDatabase]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      const task = data.tasks.find((t) => t.id === taskId);
      setData((prev) => {
        const updated = {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
          calendarEvents: prev.calendarEvents.filter((e) => e.taskId !== taskId),
        };
        persistDatabase(updated);
        return updated;
      });
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      if (task) {
        logAudit('task', taskId, 'Tarefa excluída', `Tarefa "${task.title}" removida.`);
      }
    },
    [data.tasks, logAudit, persistDatabase, selectedTaskId]
  );

  const toggleTaskComplete = useCallback(
    (taskId: string) => {
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const isNowCompleted = task.status !== 'concluida';
      const now = new Date().toISOString();
      const updated: TaskItem = {
        ...task,
        status: isNowCompleted ? 'concluida' : 'em_andamento',
        completedAt: isNowCompleted ? now : undefined,
        completedBy: isNowCompleted ? currentUser?.name || 'Equipe RX' : undefined,
        updatedAt: now,
      };
      updateTask(updated);
    },
    [currentUser, data.tasks, updateTask]
  );

  // Content operations
  const addContent = useCallback(
    (
      contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'cycleNumber'>,
      cycleOverride?: number
    ): ContentItem => {
      const contentId = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const client = data.clients.find((c) => c.id === contentData.clientId);
      const cycle = cycleOverride || client?.cycleNumber || 1;

      const newContent: ContentItem = {
        ...contentData,
        id: contentId,
        cycleNumber: cycle,
        createdAt: now,
        updatedAt: now,
      };

      setData((prev) => {
        const updated = {
          ...prev,
          contents: [newContent, ...prev.contents],
        };
        persistDatabase(updated);
        return updated;
      });

      logAudit('content', contentId, 'Conteúdo criado', `"${newContent.title}" adicionado ao Kanban.`);
      return newContent;
    },
    [data.clients, logAudit, persistDatabase]
  );

  const updateContent = useCallback(
    (updatedContent: ContentItem) => {
      setData((prev) => {
        const updated = {
          ...prev,
          contents: prev.contents.map((c) =>
            c.id === updatedContent.id ? { ...updatedContent, updatedAt: new Date().toISOString() } : c
          ),
        };
        persistDatabase(updated);
        return updated;
      });
      logAudit('content', updatedContent.id, 'Conteúdo atualizado', `"${updatedContent.title}" atualizado.`);
    },
    [logAudit, persistDatabase]
  );

  const deleteContent = useCallback(
    (contentId: string) => {
      const content = data.contents.find((c) => c.id === contentId);
      setData((prev) => {
        const updated = {
          ...prev,
          contents: prev.contents.filter((c) => c.id !== contentId),
        };
        persistDatabase(updated);
        return updated;
      });
      if (content) {
        logAudit('content', contentId, 'Conteúdo excluído', `"${content.title}" excluído do Kanban.`);
      }
    },
    [data.contents, logAudit, persistDatabase]
  );

  const moveContentStage = useCallback(
    (contentId: string, newStage: number) => {
      const content = data.contents.find((c) => c.id === contentId);
      if (!content) return;
      updateContent({ ...content, stage: newStage });
    },
    [data.contents, updateContent]
  );

  // Calendar event operations
  const addCalendarEvent = useCallback(
    (eventData: Omit<CalendarEventItem, 'id'>): CalendarEventItem => {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newEvent: CalendarEventItem = {
        ...eventData,
        id: eventId,
      };
      setData((prev) => {
        const updated = {
          ...prev,
          calendarEvents: [newEvent, ...prev.calendarEvents],
        };
        persistDatabase(updated);
        return updated;
      });
      logAudit('event', eventId, 'Evento agendado', `"${newEvent.title}" agendado para ${newEvent.date}.`);
      return newEvent;
    },
    [logAudit, persistDatabase]
  );

  const updateCalendarEvent = useCallback(
    (updatedEvent: CalendarEventItem) => {
      setData((prev) => {
        const updated = {
          ...prev,
          calendarEvents: prev.calendarEvents.map((e) =>
            e.id === updatedEvent.id ? updatedEvent : e
          ),
          tasks: prev.tasks.map((t) => {
            if (t.id === updatedEvent.taskId && updatedEvent.date) {
              return { ...t, dueDate: updatedEvent.date, updatedAt: new Date().toISOString() };
            }
            return t;
          }),
        };
        persistDatabase(updated);
        return updated;
      });
      logAudit('event', updatedEvent.id, 'Evento atualizado', `"${updatedEvent.title}" reagendado.`);
    },
    [logAudit, persistDatabase]
  );

  const deleteCalendarEvent = useCallback(
    (eventId: string) => {
      const evt = data.calendarEvents.find((e) => e.id === eventId);
      setData((prev) => {
        const updated = {
          ...prev,
          calendarEvents: prev.calendarEvents.filter((e) => e.id !== eventId),
        };
        persistDatabase(updated);
        return updated;
      });
      if (evt) {
        logAudit('event', eventId, 'Evento removido', `Evento "${evt.title}" cancelado.`);
      }
    },
    [data.calendarEvents, logAudit, persistDatabase]
  );

  const resetDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const resData = await res.json();
        setData(resData.data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resData.data));
      } else {
        const clean = getInitialSeedDatabase();
        setData(clean);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
      }
    } catch {
      const clean = getInitialSeedDatabase();
      setData(clean);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isSessionLoading,
      users: data.users,
      clients: data.clients,
      tasks: data.tasks,
      contents: data.contents,
      calendarEvents: data.calendarEvents,
      auditLogs: data.auditLogs,
      activeTab,
      selectedClientId,
      clientActiveTab,
      selectedTaskId,
      selectedStageId,
      searchQuery,
      isLoading,
      isSaving,
      saveError,
      editingClient,
      setActiveTab,
      setSelectedClientId,
      setClientActiveTab,
      setSelectedTaskId,
      setSelectedStageId,
      setSearchQuery,
      setEditingClient,
      canGoBack,
      goBack,
      navigateToTab,
      navigateToClient,
      isNewClientModalOpen,
      setIsNewClientModalOpen,
      isNewTaskModalOpen,
      setIsNewTaskModalOpen,
      isNewContentModalOpen,
      setIsNewContentModalOpen,
      isNewEventModalOpen,
      setIsNewEventModalOpen,
      supabaseStatus,
      checkSupabase,
      login,
      logout,
      switchUser,
      addClient,
      updateClient,
      deleteClient,
      pauseClient,
      reactivateClient,
      archiveClient,
      repeatClientCycle,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      addContent,
      updateContent,
      deleteContent,
      moveContentStage,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      resetDatabase,
      logAudit,
    }),
    [
      currentUser,
      isSessionLoading,
      data.users,
      data.clients,
      data.tasks,
      data.contents,
      data.calendarEvents,
      data.auditLogs,
      activeTab,
      selectedClientId,
      clientActiveTab,
      selectedTaskId,
      selectedStageId,
      searchQuery,
      isLoading,
      isSaving,
      saveError,
      editingClient,
      canGoBack,
      goBack,
      navigateToTab,
      navigateToClient,
      isNewClientModalOpen,
      isNewTaskModalOpen,
      isNewContentModalOpen,
      isNewEventModalOpen,
      supabaseStatus,
      checkSupabase,
      login,
      logout,
      switchUser,
      addClient,
      updateClient,
      deleteClient,
      pauseClient,
      reactivateClient,
      archiveClient,
      repeatClientCycle,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      addContent,
      updateContent,
      deleteContent,
      moveContentStage,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      resetDatabase,
      logAudit,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
