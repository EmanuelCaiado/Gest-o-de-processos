import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createSession, handleAuth, SESSION_COOKIE, sessionUser } from './auth.ts';

const server = createServer(handleAuth);
let base = '';
before(async () => {
  process.env.SESSION_SECRET = 'isolated-test-key-with-at-least-32-characters';
  process.env.RX_EMANUEL_PASSWORD = 'fixture-first-password';
  process.env.RX_RENAN_PASSWORD = 'fixture-second-password';
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  base = `http://127.0.0.1:${address.port}`;
});
after(() => new Promise<void>(resolve => server.close(() => resolve())));
const post = (action: string, body: unknown, cookie = '', headers = {}) => fetch(`${base}/api/auth?action=${action}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers }, body: JSON.stringify(body),
});
const login = () => post('login', { login: 'emanuel', password: 'fixture-first-password' });
const cookieOf = (response: Response) => response.headers.get('set-cookie')!.split(';')[0];

test('fresh access has no session; partial usernames and wrong passwords fail', async () => {
  assert.deepEqual(await (await fetch(`${base}/api/auth?action=session`)).json(), { user: null });
  for (const body of [{ login: 'ema', password: 'fixture-first-password' }, { login: 'emanuel', password: 'wrong' }]) {
    const response = await post('login', body);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('login issues private persistent cookie and restores the canonical account', async () => {
  const response = await login();
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie')!;
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Lax/);
  assert.match(setCookie, /Max-Age=2592000/);
  const session = await fetch(`${base}/api/auth?action=session`, { headers: { Cookie: cookieOf(response) } });
  const { user } = await session.json();
  assert.equal(user.id, 'usr_emanuel');
  assert.equal(user.password, undefined);
  assert.equal(session.headers.get('cache-control'), 'no-store');
  const secure = await post('login', { login: 'emanuel', password: 'fixture-first-password' }, '', { 'x-forwarded-proto': 'https' });
  assert.match(secure.headers.get('set-cookie')!, /; Secure/);
});

test('tampered, expired and unknown-account sessions are rejected', () => {
  const token = createSession('usr_emanuel');
  assert.equal(sessionUser(`${SESSION_COOKIE}=${token}x`), null);
  assert.equal(sessionUser(`${SESSION_COOKIE}=${createSession('usr_emanuel', Date.now() - 31 * 86400000)}`), null);
  assert.equal(sessionUser(`${SESSION_COOKIE}=${createSession('unknown')}`), null);
  assert.equal(sessionUser(`${SESSION_COOKIE}=unsigned`), null);
});

test('switch requires a session and the target password, preserving the original on failure', async () => {
  assert.equal((await post('switch', { userId: 'usr_renan', password: 'fixture-second-password' })).status, 401);
  const original = cookieOf(await login());
  const wrong = await post('switch', { userId: 'usr_renan', password: 'fixture-first-password' }, original);
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get('set-cookie'), null);
  assert.equal(sessionUser(original)?.id, 'usr_emanuel');
  const switched = await post('switch', { userId: 'usr_renan', password: 'fixture-second-password' }, original);
  assert.equal(switched.status, 200);
  assert.equal(sessionUser(cookieOf(switched))?.id, 'usr_renan');
});

test('logout clears cookie; cross-site requests and malformed bodies fail', async () => {
  const logout = await post('logout', {}, cookieOf(await login()));
  assert.match(logout.headers.get('set-cookie')!, /Max-Age=0/);
  assert.equal((await post('login', {}, '', { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await post('login', [])).status, 400);
  assert.equal((await fetch(`${base}/api/auth?action=login`)).status, 405);
});

test('missing signing configuration never issues a session', async () => {
  const previous = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  try {
    const response = await login();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
  } finally { process.env.SESSION_SECRET = previous; }
});
