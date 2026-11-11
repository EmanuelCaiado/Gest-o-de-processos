import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInitialSeedDatabase, AppDatabase } from './src/data/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function ensureData(): AppDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = getInitialSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file, restoring initial seed:', err);
    const seed = getInitialSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

function saveData(data: AppDatabase) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'RX Workspace', timestamp: new Date().toISOString() });
  });

  app.get('/api/data', (req, res) => {
    try {
      const data = ensureData();
      res.json(data);
    } catch (err) {
      console.error('Failed to get data:', err);
      res.status(500).json({ error: 'Erro ao carregar dados' });
    }
  });

  app.post('/api/data', (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Dados inválidos' });
        return;
      }
      saveData(req.body);
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to save data:', err);
      res.status(500).json({ error: 'Erro ao persistir dados' });
    }
  });

  app.post('/api/reset', (req, res) => {
    try {
      const seed = getInitialSeedDatabase();
      saveData(seed);
      res.json({ success: true, data: seed });
    } catch (err) {
      console.error('Failed to reset data:', err);
      res.status(500).json({ error: 'Erro ao reiniciar banco de dados' });
    }
  });

  app.get('/api/supabase/status', async (req, res) => {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dwrithtmlchmuygobgjj.supabase.co';
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OVwFkjQBKuPYyxL8AVDRxA_X6he97in';
    const jwksUrl = process.env.SUPABASE_JWKS_URL ||
      (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_JWKS_URL) ||
      `${url}/auth/v1/.well-known/jwks.json`;

    const checks: Record<string, any> = {
      projectUrl: url,
      configured: true,
      timestamp: new Date().toISOString(),
      jwks: { ok: false },
      auth: { ok: false },
      database: { ok: false },
    };

    try {
      const resJwks = await fetch(jwksUrl);
      checks.jwks.status = resJwks.status;
      if (resJwks.ok) {
        const d: any = await resJwks.json();
        checks.jwks.ok = true;
        checks.jwks.keysCount = Array.isArray(d?.keys) ? d.keys.length : 0;
      }
    } catch (e: any) {
      checks.jwks.error = e.message;
    }

    try {
      const resAuth = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: key },
      });
      checks.auth.status = resAuth.status;
      if (resAuth.ok) {
        checks.auth.ok = true;
        const d: any = await resAuth.json();
        checks.auth.emailEnabled = Boolean(d?.external?.email);
      }
    } catch (e: any) {
      checks.auth.error = e.message;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(url, key);
      const { error } = await client.from('clients').select('id').limit(1);
      checks.database.reachable = true;
      if (!error) {
        checks.database.ok = true;
        checks.database.tablesReady = true;
        checks.database.message = 'Tabelas criadas e ativas no Supabase.';
      } else {
        checks.database.ok = true;
        checks.database.tablesReady = false;
        checks.database.message =
          error.code === 'PGRST205' || error.message?.includes('schema cache')
            ? 'Banco Supabase online e acessível. Tabelas prontas para inicialização via schema.sql.'
            : error.message;
      }
    } catch (e: any) {
      checks.database.error = e.message;
    }

    res.json(checks);
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RX Workspace] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
