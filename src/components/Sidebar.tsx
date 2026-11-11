import React, { useState } from 'react';
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
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Sidebar: React.FC = () => {
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

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'processes', label: 'Processos', icon: GitFork },
  ] as const;

  const handleNavClick = (tabId: typeof navItems[number]['id']) => {
    setActiveTab(tabId);
    if (tabId === 'clients') {
      setSelectedClientId(null);
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#EFE8EB] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#F4E9ED] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#651D32] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              RX
            </div>
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
                    switchUser(u.id);
                    setShowUserDropdown(false);
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
              onClick={logout}
              className="p-1.5 text-[#777777] hover:text-[#651D32] hover:bg-[#F4E9ED] rounded-lg transition ml-1 cursor-pointer"
              title="Sair do sistema"
              aria-label="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => switchUser(users[0]?.id || '')}
            className="w-full py-2 bg-[#651D32] text-white text-xs font-semibold rounded-lg hover:bg-[#521627] transition cursor-pointer"
          >
            Entrar no Sistema
          </button>
        )}
      </div>
    </aside>
  );
};
