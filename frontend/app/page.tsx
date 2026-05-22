"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Clock,
  LogOut,
  BookOpen,
  Menu
} from 'lucide-react';



export default function ValidadorEstagio() {
  const [dragActive, setDragActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Função simulada para o drag and drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(false);
    }
  };

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
        <button className="mt-auto flex justify-center p-3 text-gray-400 hover:text-red-600 transition-colors">
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shrink-0">
              MF
            </div>
            <span className="hidden sm:inline text-sm font-medium">Mauricio Filho</span>
          </div>
        </header>

        {/* Container Principal */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
          
          {/* Banner Principal */}
          <section className="bg-[#041e3a] rounded-xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg">
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-blue-200 font-medium tracking-wide uppercase">
                Área do Aluno • Lei nº 11.788/2008
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">Validação de Contratos e Relatórios</h2>
              <p className="text-sm md:text-base text-blue-100 max-w-xl">
                Faça o upload dos seus documentos de estágio. Nosso sistema automatizado analisará a conformidade jurídica e institucional instantaneamente.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Área de Upload */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-[#041e3a]">Novo Documento</h3>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 md:p-10 flex flex-col items-center justify-center text-center transition-colors
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrag}
              >
                <UploadCloud size={40} className="text-gray-400 mb-4 md:h-12 md:w-12" />
                <p className="text-gray-700 font-medium mb-1 text-sm md:text-base">Arraste e solte seu contrato ou relatório aqui</p>
                <p className="text-xs md:text-sm text-gray-500 mb-6">Formatos suportados: PDF, DOCX (Max 10MB)</p>
                
                <label className="bg-[#ffb600] hover:bg-[#e5a400] text-[#041e3a] font-semibold py-2 px-6 rounded-md cursor-pointer transition-colors shadow-sm text-sm md:text-base">
                  Selecionar Arquivo
                  <input type="file" className="hidden" accept=".pdf,.docx" />
                </label>
              </div>
            </div>

            {/* Mural de Avisos */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm flex flex-col">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#041e3a]">Mural de Status</h3>
                <Link
                  href="/mural-de-status"
                  className="text-sm font-semibold text-[#041e3a] hover:text-[#ffb600] transition-colors"
                >
                  Ver tudo
                </Link>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded">Aprovado</span>
                  </div>
                  <p className="font-medium text-sm text-gray-800 wrap-break-word">Contrato_Estagio_BTG.pdf</p>
                  <p className="text-xs text-gray-500 mt-1">Todas as cláusulas em conformidade.</p>
                </div>

                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#ffb600] text-[#041e3a] text-xs font-bold px-2 py-1 rounded">Em Análise</span>
                  </div>
                  <p className="font-medium text-sm text-gray-800 wrap-break-word">Relatorio_QuestEdu.pdf</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando processamento do backend.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Tabela de Histórico (com rolagem horizontal no mobile) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[#041e3a]">Histórico de Validações</h3>
              <Link
                href="/historico-de-validacoes"
                className="text-sm font-semibold text-[#041e3a] hover:text-[#ffb600] transition-colors"
              >
                Ver tudo
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-150">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200 whitespace-nowrap">
                    <th className="p-4 font-medium">Nome do Arquivo</th>
                    <th className="p-4 font-medium">Data de Envio</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3 font-medium text-gray-700">
                      <FileText size={18} className="text-gray-400 shrink-0" /> 
                      <span className="truncate max-w-50 md:max-w-xs">Contrato_Estagio_BTG.pdf</span>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">22 Mai 2026</td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">Termo de Compromisso</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-green-700 font-medium">
                        <CheckCircle size={16} /> Válido
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3 font-medium text-gray-700">
                      <FileText size={18} className="text-gray-400 shrink-0" /> 
                      <span className="truncate max-w-50 md:max-w-xs">Relatorio_QuestEdu.pdf</span>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">20 Mai 2026</td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">Relatório de Atividades</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        <Clock size={16} /> Processando
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}