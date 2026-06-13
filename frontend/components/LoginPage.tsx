"use client";

import { useState } from "react";
import { Loader2, LogIn, Mail, Lock, AlertCircle, Shield, ExternalLink } from "lucide-react";
import { login, type Usuario } from "@/lib/auth";
import { ADMIN_URL } from "@/lib/api";

const CREDENCIAIS_TESTE = [
  { papel: "Aluno", email: "joao.silva@aluno.edu.br", senha: "senha123" },
  { papel: "Aluno", email: "maria.santos@aluno.edu.br", senha: "senha456" },
  { papel: "Coordenador", email: "coord.geral@edu.br", senha: "coord123" },
];

export function LoginPage({ onLogin }: { onLogin: (u: Usuario) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const fazerLogin = async (em: string, sn: string) => {
    setEntrando(true);
    setErro("");
    try {
      const usuario = await login(em.trim(), sn);
      onLogin(usuario);
    } catch (err) {
      setErro((err as Error).message);
      setEntrando(false);
    }
  };

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    fazerLogin(email, senha);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#041e3a] p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-Ibmec.svg" alt="Ibmec" className="h-9 w-auto object-contain mb-3 brightness-0 invert" />
          <p className="text-blue-200 text-sm">Sistema de Validação de Estágios</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-[#041e3a] mb-1">Entrar</h1>
          <p className="text-sm text-gray-500 mb-6">Acesse com seu e-mail institucional.</p>

          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="seu.email@edu.br"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-slate-800"
                />
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
                <AlertCircle size={16} className="shrink-0" />
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="w-full flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              {entrando ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Credenciais de teste (protótipo): preenchem o formulário ao clicar */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Credenciais de teste
            </p>
            <div className="space-y-2">
              {CREDENCIAIS_TESTE.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  disabled={entrando}
                  onClick={() => {
                    setEmail(c.email);
                    setSenha(c.senha);
                    setErro("");
                  }}
                  className="w-full flex items-center justify-between gap-2 text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 transition-colors disabled:opacity-50"
                >
                  <span className="font-semibold text-[#041e3a]">{c.papel}</span>
                  <span className="text-gray-500 truncate">{c.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Shield size={16} />
              Admin Django
              <ExternalLink size={14} />
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Frontend
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
