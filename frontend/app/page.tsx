"use client";

import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
          <button title="Início" aria-label="Início" className="flex justify-center p-3 mx-2 bg-blue-50 text-blue-900 rounded-lg">
  BookOpen,
  Menu,
          <button title="Acompanhamento" aria-label="Acompanhamento" className="flex justify-center p-3 mx-2 text-gray-400 hover:text-[#041e3a] transition-colors">
  ArrowLeft,
  Loader2,
          <button title="Documentos" aria-label="Documentos" className="flex justify-center p-3 mx-2 text-gray-400 hover:text-[#041e3a] transition-colors">
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { CoordinatorAnalytics } from '@/components/dashboard/CoordinatorAnalytics';
import { LoginPage } from '@/components/LoginPage';
import { ADMIN_URL } from '@/lib/api';
import { getUsuario, logout as fazerLogout, iniciais, type Usuario } from '@/lib/auth';

type Modo = "aluno" | "coordenador";
type CoordView = "inbox" | "analytics";

const PERFIL: Record<Modo, { iniciais: string; nome: string; tituloBanner: string; subtitulo: string; descricao: string }> = {
  aluno: {
    iniciais: "MF",
    nome: "Mauricio Filho",
    tituloBanner: "Gerenciamento do TCE",
    subtitulo: "Área do Aluno • Lei nº 11.788/2008",
    descricao: "Gerencie sua aplicação de estágio, acompanhe o status do seu TCE e envie documentos de acompanhamento.",
  },
  coordenador: {
    iniciais: "CG",
    nome: "Coordenador Geral",
    tituloBanner: "Análise de Solicitações",
    subtitulo: "Área do Coordenador • Lei nº 11.788/2008",
    descricao: "Revise os TCEs enviados pelos alunos, assine os documentos e finalize as solicitações de estágio.",
  },
};

export default function ValidadorEstagio() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coordView, setCoordView] = useState<CoordView>("inbox");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [montado, setMontado] = useState(false);

  // Lê a sessão após a montagem. Fazê-lo aqui (e não num initializer) evita
  // divergência de hidratação, já que o localStorage não existe no SSR.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sessão lida pós-montagem */
    setUsuario(getUsuario());
    setMontado(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const sair = () => {
    fazerLogout();
    setCoordView("inbox");
    setUsuario(null);
  };

  // Enquanto lê o localStorage, evita piscar entre login e app.
  if (!montado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#041e3a]">
        <Loader2 size={32} className="text-white animate-spin" />
      </div>
    );
  }

  // Gate de autenticação: sem usuário logado, mostra o login.
  if (!usuario) {
    return <LoginPage onLogin={setUsuario} />;
  }

  // O papel do usuário logado define o fluxo (sem toggle manual).
  const modo: Modo = usuario.papel === "coordenador" ? "coordenador" : "aluno";
  const perfil = PERFIL[modo];

  return (
    <div className="flex h-screen bg-[#f4f5f6] font-sans text-slate-800 overflow-hidden">

      {/* Overlay escuro para mobile quando o menu está aberto */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Lateral (Responsiva) */}
      <aside className={`
        fixed md:relative z-50 h-full w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8 shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <img
          src="/ibmec_icon.svg"
          alt="Ibmec"
          className="mb-4 h-10 w-10 object-contain"
        />
        <nav className="flex flex-col gap-6 w-full">
          <button className="flex justify-center p-3 mx-2 bg-blue-50 text-blue-900 rounded-lg">
            <Home size={24} />
          </button>
          <button className="flex justify-center p-3 mx-2 text-gray-400 hover:text-[#041e3a] transition-colors">
            <BookOpen size={24} />
          </button>
          <button className="flex justify-center p-3 mx-2 text-gray-400 hover:text-[#041e3a] transition-colors">
            <FileText size={24} />
          </button>
        </nav>
        <button
          onClick={sair}
          title="Sair"
          aria-label="Sair"
          className="mt-auto flex justify-center p-3 text-gray-400 hover:text-red-600 transition-colors"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto w-full relative">

        {/* Header Superior */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Ícone Menu Hambúrguer (Mobile) */}
            <button
              title="Abrir menu"
              aria-label="Abrir menu"
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <img
              src="/logo-Ibmec.svg"
              alt="Ibmec"
              className="h-6 md:h-8 w-auto object-contain"
            />
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-xs md:text-sm font-medium text-gray-600">
              Sistema de Validação de Estágios
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {iniciais(usuario.nome)}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{usuario.nome}</span>
            </div>

            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
            >
              Abrir admin
            </a>

            <button
              onClick={sair}
              title="Sair"
              aria-label="Sair"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Container Principal */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">

          {/* Banner Principal */}
          <section className="bg-[#041e3a] rounded-xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg mb-6">
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-blue-200 font-medium tracking-wide uppercase">
                {perfil.subtitulo}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">{perfil.tituloBanner}</h2>
              <p className="text-sm md:text-base text-blue-100 max-w-xl">
                {perfil.descricao}
              </p>
            </div>

            {/* Acesso ao dashboard de análise — somente coordenador (à direita do card) */}
            {modo === "coordenador" && (
              <button
                onClick={() => setCoordView((v) => (v === "analytics" ? "inbox" : "analytics"))}
                className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-[#041e3a] hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm text-sm md:text-base"
              >
                {coordView === "analytics" ? <ArrowLeft size={20} /> : <BarChart3 size={20} />}
                {coordView === "analytics" ? "Voltar às Solicitações" : "Abrir Dashboard de Análise"}
              </button>
            )}
          </section>

          {modo === "aluno" ? (
            <StudentDashboard />
          ) : coordView === "analytics" ? (
            <CoordinatorAnalytics onBack={() => setCoordView("inbox")} />
          ) : (
            <CoordinatorDashboard />
          )}

        </div>
      </main>
    </div>
  );
}
