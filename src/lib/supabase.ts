import { createClient } from '@supabase/supabase-js';
import { ClientItem, TaskItem, ContentItem, CalendarEventItem } from '../utils/metrics';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://dwrithtmlchmuygobgjj.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_OVwFkjQBKuPYyxL8AVDRxA_X6he97in';

export const SUPABASE_JWKS_URL =
  (import.meta as any).env?.VITE_SUPABASE_JWKS_URL ||
  'https://dwrithtmlchmuygobgjj.supabase.co/auth/v1/.well-known/jwks.json';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export interface SupabaseHealthResult {
  url: string;
  configured: boolean;
  timestamp: string;
  jwks: {
    ok: boolean;
    status?: number;
    keysCount?: number;
    error?: string;
  };
  auth: {
    ok: boolean;
    status?: number;
    emailAuthEnabled?: boolean;
    error?: string;
  };
  database: {
    reachable: boolean;
    tablesFound: boolean;
    details?: string;
  };
}

/**
 * Checks the live connectivity of Supabase Auth, JWKS, and Database APIs.
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealthResult> {
  const result: SupabaseHealthResult = {
    url: SUPABASE_URL,
    configured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
    jwks: { ok: false },
    auth: { ok: false },
    database: { reachable: false, tablesFound: false },
  };

  if (!isSupabaseConfigured) {
    return result;
  }

  // 1. Test JWKS
  try {
    const resJwks = await fetch(SUPABASE_JWKS_URL);
    result.jwks.status = resJwks.status;
    if (resJwks.ok) {
      const data = await resJwks.json();
      result.jwks.ok = true;
      result.jwks.keysCount = Array.isArray(data?.keys) ? data.keys.length : 0;
    } else {
      result.jwks.error = `HTTP ${resJwks.status}`;
    }
  } catch (err: any) {
    result.jwks.error = err.message || 'Erro de rede';
  }

  // 2. Test Auth Settings API
  try {
    const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
    });
    result.auth.status = resAuth.status;
    if (resAuth.ok) {
      const data = await resAuth.json();
      result.auth.ok = true;
      result.auth.emailAuthEnabled = Boolean(data?.external?.email);
    } else {
      result.auth.error = `HTTP ${resAuth.status}`;
    }
  } catch (err: any) {
    result.auth.error = err.message || 'Erro de rede';
  }

  // 3. Test Database Query
  try {
    const { data, error } = await supabase.from('clients').select('id').limit(1);
    result.database.reachable = true;
    if (!error) {
      result.database.tablesFound = true;
      result.database.details = 'Tabela public.clients pronta e acessível.';
    } else if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      result.database.tablesFound = false;
      result.database.details = 'Banco Supabase ativo. As tabelas SQL podem ser criadas via Editor SQL.';
    } else {
      result.database.tablesFound = false;
      result.database.details = error.message;
    }
  } catch (err: any) {
    result.database.reachable = false;
    result.database.details = err.message || 'Falha de conexão com o banco';
  }

  return result;
}

/**
 * Asynchronously syncs a client record to Supabase if the table exists.
 */
export async function syncClientToSupabase(client: ClientItem): Promise<boolean> {
  try {
    const payload = {
      id: client.id,
      nome: client.name,
      contato: client.contactName,
      responsavel_id: client.responsibleId || null,
      servico: client.serviceDescription || null,
      status: client.status,
      data_inicio: client.startDate || new Date().toISOString().split('T')[0],
      observacoes: client.internalNotes || null,
      ciclo: client.cycleNumber || 1,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('clients').upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Asynchronously syncs a task record to Supabase if the table exists.
 */
export async function syncTaskToSupabase(task: TaskItem): Promise<boolean> {
  try {
    const payload = {
      id: task.id,
      client_id: task.clientId,
      stage_id: task.stageId,
      content_id: task.contentId || null,
      titulo: task.title,
      descricao: task.description || null,
      responsavel_id: task.responsibleId || null,
      prioridade: task.priority,
      status: task.status,
      vencimento: task.dueDate || null,
      vencimento_hora: task.dueTime || null,
      concluida_em: task.completedAt || null,
      concluida_por: task.completedBy || null,
      ordem: task.orderIndex || 1,
      ciclo: task.cycleNumber || 1,
      checklist: task.checklist || [],
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('tasks').upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Asynchronously deletes a client from Supabase if the table exists.
 */
export async function deleteClientFromSupabase(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    return !error;
  } catch {
    return false;
  }
}
