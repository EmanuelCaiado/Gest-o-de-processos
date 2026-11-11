import type { UserItem } from '../data/seedData';

export interface AuthResult { success: boolean; error?: string }

export async function restoreSession(): Promise<UserItem | null> {
  const response = await fetch('/api/auth?action=session', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()).user || null;
}

export async function requestAuth(action: 'login' | 'switch' | 'logout', body: Record<string, string> = {}): Promise<AuthResult & { user?: UserItem }> {
  try {
    const response = await fetch(`/api/auth?action=${action}`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Não foi possível validar o acesso.' };
    }
    return result as AuthResult & { user?: UserItem };
  } catch {
    return { success: false, error: 'Não foi possível conectar ao servidor. Tente novamente.' };
  }
}
