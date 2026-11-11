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
import { ArrowRight, Lock, Mail, LoaderCircle } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, login, isSessionLoading } = useData();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const result = await login(loginUser, loginPassword);
      if (!result.success) setLoginError(result.error || 'Usuário ou senha incorretos.');
      else setLoginPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F8F8]" role="status">
      <BrandLogo className="w-16 h-16" />
      <span className="text-sm text-[#777777]">Verificando acesso…</span>
    </div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#EFE8EB] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <BrandLogo className="w-16 h-16 mx-auto" />
            <h1 className="text-xl font-bold text-[#202020] tracking-tight">
              RX Workspace
            </h1>
            <p className="text-xs text-[#777777]">
              Sistema Interno de Gestão Operacional • RX Estúdio
            </p>
          </div>

          {loginError && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2 animate-in fade-in">
              <span className="font-semibold">Erro:</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="login-user" className="font-semibold text-[#202020] block mb-1">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="login-user"
                  name="username"
                  autoComplete="username"
                  placeholder="Digite seu usuário ou e-mail"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F8F8] border border-[#E8DFE3] rounded-lg text-xs font-medium text-[#202020] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#651D32] focus:border-[#651D32]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="font-semibold text-[#202020] block mb-1">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
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
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#651D32] text-white font-bold rounded-lg hover:bg-[#521627] transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
            >
              <span>{isSubmitting ? 'Entrando…' : 'Acessar RX Workspace'}</span>
              {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>


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
