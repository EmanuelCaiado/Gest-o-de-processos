import { ClientItem, TaskItem, ContentItem, CalendarEventItem } from '../utils/metrics';

export interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'integrante';
  avatar: string;
  title: string;
  password?: string;
}

export interface AuditLogItem {
  id: string;
  entityType: 'task' | 'content' | 'client' | 'event';
  entityId: string;
  action: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface AppDatabase {
  users: UserItem[];
  clients: ClientItem[];
  tasks: TaskItem[];
  contents: ContentItem[];
  calendarEvents: CalendarEventItem[];
  auditLogs: AuditLogItem[];
}

export const INITIAL_USERS: UserItem[] = [
  {
    id: 'usr_emanuel',
    name: 'Emanuel (Cofundador)',
    username: 'emanuelrx',
    email: 'emanuelrx@rxestudio.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Cofundador & Direção Geral',
  },
  {
    id: 'usr_renan',
    name: 'Renan (Cofundador)',
    username: 'renanrx',
    email: 'renanrx@rxestudio.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Cofundador & Estratégia',
  },
  {
    id: 'usr_vitor',
    name: 'Vitor (Editor)',
    username: 'vitorrx',
    email: 'vitorrx@rxestudio.com',
    role: 'integrante',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    title: 'Editor Chefe & Produção',
  },
];

/**
 * Retorna o estado limpo inicial para operação real com os 3 membros oficiais:
 * Zero clientes, zero tarefas, zero conteúdos, zero eventos.
 */
export function getInitialSeedDatabase(): AppDatabase {
  return {
    users: INITIAL_USERS,
    clients: [],
    tasks: [],
    contents: [],
    calendarEvents: [],
    auditLogs: [],
  };
}
