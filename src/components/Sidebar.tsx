import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  GitFork,
  LogOut,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  RotateCcw,
  Lock,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { UserItem } from '../data/seedData';
import { BrandLogo } from './BrandLogo';

export const Sidebar: React.FC<{ mobileOpen: boolean; onClose: () => void }> = ({ mobileOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    setSelectedClientId,
    currentUser,
    users,
    switchUser,
    logout,
    resetDatabase,
    setIsNewClientModalOpen,
    setIsNewTaskModalOpen,
  } = useData();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [switchTarget, setSwitchTarget] = useState<UserItem | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const switchDialog = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    sidebarRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = [...(sidebarRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not([tabindex="-1"])') || [])].filter(el => el.getClientRects().length);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [mobileOpen, onClose]);

  useEffect(() => {
    if (!switchTarget) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    return () => { previousFocus?.focus(); };
  }, [switchTarget]);

  const closeSwitch = () => {
    if (isSwitching) return;
    setSwitchTarget(null);
    setSwitchPassword('');
    setSwitchError(null);
  };

  const confirmSwitch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!switchTarget || isSwitching) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const result = await switchUser(switchTarget.id, switchPassword);
      if (result.success) {
        setSwitchTarget(null);
        setSwitchPassword('');
      } else setSwitchError(result.error || 'Não foi possível trocar de integrante.');
    } finally { setIsSwitching(false); }
  };

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'processes', label: 'Processos', icon: GitFork },
  ] as const;

  const handleNavClick = (tabId: typeof navItems[number]['id']) => {
    onClose();
    setActiveTab(tabId);
    if (tabId === 'clients') {
      setSelectedClientId(null);
    }
  };

  return (
    <>
    {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-hidden="true" onClick={onClose} />}
    <aside id="workspace-sidebar" ref={sidebarRef} aria-label="Menu e conta" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen || undefined} className={`${mobileOpen ? 'flex' : 'hidden'} lg:flex fixed lg:static inset-y-0 left-0 w-72 max-w-[90vw] lg:w-64 h-dvh overflow-y-auto bg-white border-r border-[#EFE8EB] flex-col justify-between shrink-0 z-40 lg:z-20`}>
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#F4E9ED] flex items-center justify-between">
          <button aria-label="Fechar menu" onClick={onClose} className="lg:hidden absolute top-2 right-2 p-2 rounded-lg"><X className="h-5 w-5" /></button>
          <div className="flex items-center space-x-3">
            <BrandLogo className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-base tracking-tight text-[#202020] leading-none">
                RX Workspace
              </h1>
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                Sistema Operacional
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#651D32] text-white hover:bg-[#521627] transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="flex items-center justify-center p-2 rounded-lg text-xs font-semibold bg-[#F4E9ED] text-[#651D32] hover:bg-[#eddde3] transition cursor-pointer"
              title="Novo Cliente"
              aria-label="Novo Cliente"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#651D32] text-white shadow-xs'
                    : 'text-[#444444] hover:bg-[#F8F8F8] hover:text-[#202020]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-white' : 'text-[#777777]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile Section */}
      <div className="p-3 border-t border-[#F4E9ED] relative bg-white">
        {/* User Switcher Dropdown */}
        {showUserDropdown && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-xl border border-[#EFE8EB] p-2 z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-[11px] font-semibold text-[#777777] uppercase px-2.5 py-1.5">
              Alternar Integrante da RX
            </div>
            <div className="space-y-0.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (u.id !== currentUser?.id) {
                      setSwitchTarget(u);
                      setSwitchPassword('');
                      setSwitchError(null);
                    }
                  }}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    currentUser?.id === u.id
                      ? 'bg-[#F4E9ED] text-[#651D32] font-semibold'
                      : 'hover:bg-[#F8F8F8] text-[#202020]'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 truncate">
                    <div className="truncate">{u.name}</div>
                    <div className="text-[10px] text-[#777777]">{u.title}</div>
                  </div>
                  {u.role === 'admin' ? (
                    <span className="text-[9px] bg-[#651D32]/10 text-[#651D32] px-1.5 py-0.5 rounded font-semibold">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                      Equipe
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#F4E9ED] my-1.5" />

            <button
              onClick={() => {
                setShowUserDropdown(false);
                if (window.confirm('Deseja reiniciar os dados operacionais do sistema para o estado inicial limpo?')) {
                  resetDatabase();
                }
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#651D32] hover:bg-[#F4E9ED] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#651D32]" />
              <span>Reiniciar Dados Operacionais</span>
            </button>
          </div>
        )}

        {/* Current User Card */}
        {currentUser ? (
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F8F8] transition">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 flex-1 text-left min-w-0 cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#E2D9DD]"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-[#202020] truncate">
                  {currentUser.name}
                </div>
                <div className="flex items-center space-x-1">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3 h-3 text-[#651D32]" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                  )}
                  <span className="text-[10px] text-[#777777] font-medium capitalize">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#777777] shrink-0" />
            </button>

            <button
              onClick={async () => {
                const result = await logout();
                setLogoutError(result.success ? null : result.error || 'Não foi possível sair. Tente novamente.');
              }}
              className="p-1.5 text-[#777777] hover:text-[#651D32] hover:bg-[#F4E9ED] rounded-lg transition ml-1 cursor-pointer"
              title="Sair do sistema"
              aria-label="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#777777]">Entre para acessar o sistema.</span>
        )}
        {logoutError && <p role="alert" className="mt-2 text-xs text-red-700">{logoutError}</p>}
      </div>
      {switchTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onKeyDown={event => {
            if (event.key === 'Escape') closeSwitch();
            if (event.key === 'Tab') {
              const controls = switchDialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([tabindex="-1"]):not(:disabled)');
              if (!controls?.length) { event.preventDefault(); return; }
              const first = controls[0], last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
          }}>
          <section ref={switchDialog} role="dialog" aria-modal="true" aria-labelledby="switch-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#EFE8EB]">
            <div className="flex items-center justify-between mb-4">
              <h2 id="switch-title" className="font-bold text-[#202020]">Trocar integrante</h2>
              <button type="button" onClick={closeSwitch} disabled={isSwitching} aria-label="Cancelar troca" className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#777777] mb-4">Informe a senha de <strong className="text-[#202020]">{switchTarget.name}</strong> para continuar.</p>
            <form onSubmit={confirmSwitch} className="space-y-4">
              <input type="text" name="username" autoComplete="username" value={switchTarget.username} readOnly className="sr-only" tabIndex={-1} aria-label="Integrante selecionado" />
              <label htmlFor="switch-password" className="block text-xs font-semibold text-[#202020]">Senha do integrante</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input id="switch-password" name="password" type="password" autoComplete="current-password" autoFocus required
                  value={switchPassword} onChange={event => setSwitchPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#E8DFE3] py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#651D32]" />
              </div>
              {switchError && <p role="alert" className="text-xs text-red-700">{switchError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" disabled={isSwitching} onClick={closeSwitch} className="px-4 py-2 text-sm rounded-lg border border-[#E8DFE3]">Cancelar</button>
                <button type="submit" disabled={isSwitching} className="px-4 py-2 text-sm rounded-lg bg-[#651D32] text-white disabled:opacity-60">{isSwitching ? 'Validando…' : 'Confirmar troca'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </aside>
    </>
  );
};
