/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { ProcessesFlowchartView } from './components/ProcessesFlowchartView';
import { Modals } from './components/Modals';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, login, users } = useData();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const result = login(loginUser, loginPassword);
    if (!result.success) {
      setLoginError(result.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
    }
  };

  const handleQuickFill = (username: string, pass: string) => {
    setLoginUser(username);
    setLoginPassword(pass);
    setLoginError(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#EFE8EB] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#651D32] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              RX
            </div>
            <h1 className="text-xl font-bold text-[#202020] tracking-tight">
              RX Workspace
            </h1>
            <p className="text-xs text-[#777777]">
              Sistema Interno de Gestão Operacional • RX Estúdio
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2 animate-in fade-in">
              <span className="font-semibold">Erro:</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#202020] block mb-1">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: emanuelrx, renanrx ou vitorrx"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs font-medium text-[#202020] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#651D32] focus:border-[#651D32]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#202020] block mb-1">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs font-medium text-[#202020] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#651D32] focus:border-[#651D32]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
            >
              <span>Acessar RX Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Equipe autorizada */}
          <div className="pt-4 border-t border-[#F4E9ED]">
            <span className="text-[10px] font-semibold text-[#777777] uppercase tracking-wider block mb-2 text-center">
              Integrantes Autorizados da Equipe:
            </span>
            <div className="space-y-1.5">
              {users.map((u) => {
                const pass = u.id === 'usr_vitor' ? 'rx0001' : 'adminrx';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickFill(u.username, pass)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-[#F8F8F8] hover:bg-[#F4E9ED] border border-[#EFE8EB] transition cursor-pointer text-left"
                    title={`Preencher credenciais de ${u.name}`}
                  >
                    <div className="flex items-center space-x-2">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-[#202020]">{u.name}</div>
                        <div className="text-[10px] text-[#777777]">
                          Login: <code className="text-[#651D32] font-mono font-semibold">{u.username}</code>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        u.role === 'admin' ? 'bg-[#651D32]/10 text-[#651D32]' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {u.title.split('&')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-[#999999] mt-2">
              Clique em um integrante para autopreencher as credenciais
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden select-none">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'overview' && <DashboardView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'processes' && <ProcessesFlowchartView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <Modals />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
}
