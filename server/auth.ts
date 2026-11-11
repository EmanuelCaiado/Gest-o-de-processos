import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { INITIAL_USERS } from '../src/data/seedData.ts';
import type { UserItem } from '../src/data/seedData.ts';

export const SESSION_COOKIE = 'rx_workspace_session';
const SESSION_SECONDS = 30 * 24 * 60 * 60;
type Request = IncomingMessage & { body?: unknown };

// Existing account passwords are configured only in the private server environment.
const passwords: Record<string, () => string> = {
  usr_emanuel: () => process.env.RX_EMANUEL_PASSWORD || '',
  usr_renan: () => process.env.RX_RENAN_PASSWORD || '',
  usr_vitor: () => process.env.RX_VITOR_PASSWORD || '',
};

function signingKey() {
  const key = process.env.SESSION_SECRET;
  if (!key || key.length < 32) throw new Error('SESSION_NOT_CONFIGURED');
  return key;
}

function signature(payload: string) {
  return createHmac('sha256', signingKey()).update(payload).digest();
}

export function createSession(userId: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    userId, expiresAt: now + SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex'),
  })).toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
}

export function sessionUser(cookieHeader = '', now = Date.now()): UserItem | null {
  const token = cookieHeader.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!token || token.length > 2048 || !/^[\w-]+\.[\w-]+$/.test(token)) return null;
  const [payload, mac] = token.split('.');
  const expected = signature(payload);
  const supplied = Buffer.from(mac, 'base64url');
  if (supplied.length !== expected.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!Number.isSafeInteger(value.expiresAt) || value.expiresAt <= now) return null;
    return INITIAL_USERS.find(user => user.id === value.userId) || null;
  } catch {
    return null;
  }
}

function secureRequest(req: Request) {
  return process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
}

function cookie(req: Request, value: string, maxAge: number) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureRequest(req) ? '; Secure' : ''}`;
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  let body = req.body;
  if (body === undefined) {
    let text = '';
    for await (const chunk of req) {
      text += chunk.toString();
      if (text.length > 4096) throw new Error('INVALID_BODY');
    }
    body = JSON.parse(text || '{}');
  } else if (typeof body === 'string') {
    if (body.length > 4096) throw new Error('INVALID_BODY');
    body = JSON.parse(body);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_BODY');
  return body as Record<string, unknown>;
}

function verifyPassword(user: UserItem, password: string) {
  const expected = Buffer.from(passwords[user.id]?.() || '');
  const supplied = Buffer.from(password);
  return expected.length > 0 && supplied.length === expected.length && timingSafeEqual(expected, supplied);
}

function findUser(login: string) {
  const normalized = login.trim().toLowerCase();
  return INITIAL_USERS.find(user => [user.id, user.username, user.email, user.id.replace('usr_', '')]
    .some(alias => alias.toLowerCase() === normalized));
}

export async function handleAuth(req: Request, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const respond = (status: number, value: unknown) => {
    res.statusCode = status;
    res.end(JSON.stringify(value));
  };
  const action = new URL(req.url || '/', 'http://internal').searchParams.get('action') || 'session';
  try {
    if (req.method === 'GET' && action === 'session') {
      return respond(200, { user: sessionUser(req.headers.cookie) });
    }
    if (req.method !== 'POST' || !['login', 'switch', 'logout'].includes(action)) {
      res.setHeader('Allow', 'GET, POST');
      return respond(405, { success: false, error: 'Método não permitido.' });
    }
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (req.headers['sec-fetch-site'] === 'cross-site' || (origin && new URL(origin).host !== host)) {
      return respond(403, { success: false, error: 'Origem da solicitação não permitida.' });
    }
    if (action === 'logout') {
      res.setHeader('Set-Cookie', cookie(req, '', 0));
      return respond(200, { success: true });
    }
    signingKey(); // Never issue an unsigned or predictably signed session.
    if (action === 'switch' && !sessionUser(req.headers.cookie)) {
      return respond(401, { success: false, error: 'Sua sessão expirou. Entre novamente.' });
    }
    const body = await readBody(req);
    const identifier = action === 'switch' ? body.userId : body.login;
    if (typeof identifier !== 'string' || typeof body.password !== 'string' ||
        identifier.length > 254 || body.password.length > 256) {
      return respond(400, { success: false, error: 'Informe usuário e senha.' });
    }
    const user = findUser(identifier);
    if (!user || !verifyPassword(user, body.password)) {
      return respond(401, { success: false, error: 'Usuário ou senha incorretos.' });
    }
    res.setHeader('Set-Cookie', cookie(req, createSession(user.id), SESSION_SECONDS));
    return respond(200, { success: true, user });
  } catch (error) {
    const notConfigured = error instanceof Error && error.message === 'SESSION_NOT_CONFIGURED';
    return respond(notConfigured ? 503 : 400, {
      success: false,
      error: notConfigured
        ? 'O acesso ainda não foi configurado. Contate o administrador do sistema.'
        : 'Solicitação de acesso inválida.',
    });
  }
}
