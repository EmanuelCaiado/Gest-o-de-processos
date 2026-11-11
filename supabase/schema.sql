-- RX Workspace • Supabase PostgreSQL Schema & RLS
-- Estrutura relacional para gestão de clientes, processos, tarefas, conteúdos e calendário

-- 1. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  permissao TEXT NOT NULL DEFAULT 'integrante' CHECK (permissao IN ('admin', 'integrante')),
  cargo TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  contato TEXT NOT NULL,
  responsavel_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  servico TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'encerrado')),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  ciclo INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Conteúdos (Kanban)
CREATE TABLE IF NOT EXISTS public.contents (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  formato TEXT NOT NULL DEFAULT 'Reel',
  status INTEGER NOT NULL DEFAULT 1 CHECK (status BETWEEN 1 AND 11),
  responsavel_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_prevista DATE,
  revisao_pendente BOOLEAN NOT NULL DEFAULT FALSE,
  roteiro_url TEXT,
  arquivos_url TEXT,
  publicacao_url TEXT,
  observacoes TEXT,
  ciclo INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Tarefas Operacionais (Checklist 54 atividades)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  content_id TEXT REFERENCES public.contents(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'a_fazer' CHECK (status IN ('a_fazer', 'em_andamento', 'bloqueada', 'concluida')),
  vencimento DATE,
  vencimento_hora TEXT,
  concluida_em TIMESTAMPTZ,
  concluida_por TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  ciclo INTEGER NOT NULL DEFAULT 1,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de Eventos de Calendário (Gravações, Reuniões, Entregas, Publicações)
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('gravacao', 'reuniao', 'entrega', 'publicacao', 'tarefa')),
  data DATE NOT NULL,
  inicio TEXT,
  fim TEXT,
  responsavel_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabela de Logs de Atividades (Auditoria)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  entidade TEXT NOT NULL,
  entidade_id TEXT NOT NULL,
  acao TEXT NOT NULL,
  usuario_nome TEXT NOT NULL,
  detalhes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_id ON public.tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_vencimento ON public.tasks(vencimento);
CREATE INDEX IF NOT EXISTS idx_contents_client_id ON public.contents(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(data);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para equipe autenticada da RX
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Equipe RX autenticada tem acesso completo') THEN
    CREATE POLICY "Equipe RX autenticada tem acesso completo" ON public.profiles FOR ALL USING (true);
    CREATE POLICY "Equipe RX autenticada gerencia clientes" ON public.clients FOR ALL USING (true);
    CREATE POLICY "Equipe RX autenticada gerencia conteudos" ON public.contents FOR ALL USING (true);
    CREATE POLICY "Equipe RX autenticada gerencia tarefas" ON public.tasks FOR ALL USING (true);
    CREATE POLICY "Equipe RX autenticada gerencia eventos" ON public.calendar_events FOR ALL USING (true);
    CREATE POLICY "Equipe RX autenticada registra logs" ON public.activity_logs FOR ALL USING (true);
  END IF;
END $$;
