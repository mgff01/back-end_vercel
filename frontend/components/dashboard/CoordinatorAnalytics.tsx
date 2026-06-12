"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  DollarSign,
  Building2,
  PieChart,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { KpiCard, DonutChart, BarChart } from "./Charts";
import { getAnaliseCoordenador, type Documento, type SolicitacaoEstagio } from "@/lib/api";

const STATUS_META: Record<string, { label: string; color: string }> = {
  GERADO: { label: "Gerado", color: "#f59e0b" },
  ENVIADO: { label: "Enviado", color: "#3b82f6" },
  EM_ASSINATURA: { label: "Em assinatura", color: "#6366f1" },
  APROVADO: { label: "Aprovado", color: "#22c55e" },
  REJEITADO: { label: "Rejeitado", color: "#ef4444" },
  CONCLUIDA: { label: "Concluída", color: "#041e3a" },
  EM_REVISAO: { label: "Em revisão", color: "#94a3b8" },
};
const STATUS_ORDER = ["GERADO", "ENVIADO", "EM_ASSINATURA", "APROVADO", "CONCLUIDA", "REJEITADO", "EM_REVISAO"];

const num = (v?: string): number | null => {
  const n = parseFloat((v ?? "").toString().replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const media = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const fmtReal = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
const fmtHoras = (v: number) => `${v.toFixed(1).replace(".", ",")} h`;

function agruparMedia(
  contratos: Documento[],
  chaveGrupo: string,
  chaveValor: string,
): { label: string; value: number }[] {
  const grupos = new Map<string, number[]>();
  for (const c of contratos) {
    const grupo = c.dados?.[chaveGrupo];
    const valor = num(c.dados?.[chaveValor]);
    if (!grupo || valor == null) continue;
    if (!grupos.has(grupo)) grupos.set(grupo, []);
    grupos.get(grupo)!.push(valor);
  }
  return [...grupos.entries()]
    .map(([label, valores]) => ({ label, value: media(valores) }))
    .sort((a, b) => b.value - a.value);
}

export function CoordinatorAnalytics({ onBack }: { onBack: () => void }) {
  const [dados, setDados] = useState<{
    contratos: Documento[];
    solicitacoes: SolicitacaoEstagio[];
    totalAlunos: number;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    getAnaliseCoordenador()
      .then((d) => ativo && setDados(d))
      .catch((e) => ativo && setErro((e as Error).message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const m = useMemo(() => {
    if (!dados) return null;
    const { contratos, solicitacoes, totalAlunos } = dados;
    const cargas = contratos.map((c) => num(c.dados?.carga_horaria)).filter((x): x is number => x != null);
    const bolsas = contratos.map((c) => num(c.dados?.valor_bolsa)).filter((x): x is number => x != null);
    const empresas = new Set(contratos.map((c) => c.dados?.nome_empresa).filter(Boolean));

    const contagemStatus = contratos.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});
    const donutStatus = STATUS_ORDER.filter((s) => contagemStatus[s]).map((s) => ({
      label: STATUS_META[s].label,
      value: contagemStatus[s],
      color: STATUS_META[s].color,
    }));

    return {
      totalSolicitacoes: solicitacoes.length,
      totalContratos: contratos.length,
      totalAlunos,
      mediaCarga: media(cargas),
      mediaBolsa: media(bolsas),
      empresas: empresas.size,
      donutStatus,
      bolsaPorEmpresa: agruparMedia(contratos, "nome_empresa", "valor_bolsa").slice(0, 6),
      cargaPorCurso: agruparMedia(contratos, "curso_aluno", "carga_horaria").slice(0, 6),
    };
  }, [dados]);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#041e3a] transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para as solicitações
      </button>

      <div>
        <h2 className="text-2xl font-semibold text-[#041e3a]">Dashboard de Análise</h2>
        <p className="text-sm text-gray-500 mt-1">Visão geral dos estágios a partir das solicitações dos alunos.</p>
      </div>

      {carregando ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
          <Loader2 size={32} className="text-[#041e3a] animate-spin mb-3" />
          <p className="text-sm text-gray-500">Carregando análises...</p>
        </div>
      ) : erro ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">{erro}</div>
      ) : m ? (
        <>
          {/* Contadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Solicitações de estágio"
              value={m.totalSolicitacoes}
              sub={`${m.totalContratos} TCEs registrados`}
              icon={<FileText size={18} />}
            />
            <KpiCard
              label="Carga horária média"
              value={fmtHoras(m.mediaCarga)}
              sub="por semana"
              icon={<Clock size={18} />}
              accent="#6366f1"
            />
            <KpiCard
              label="Bolsa mensal média"
              value={fmtReal(m.mediaBolsa)}
              sub="por aluno"
              icon={<DollarSign size={18} />}
              accent="#22c55e"
            />
            <KpiCard
              label="Empresas parceiras"
              value={m.empresas}
              sub={`${m.totalAlunos} alunos no sistema`}
              icon={<Building2 size={18} />}
              accent="#f59e0b"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#041e3a] mb-5">
                <PieChart size={18} /> Solicitações TCE por status
              </h3>
              <DonutChart data={m.donutStatus} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#041e3a] mb-5">
                <DollarSign size={18} /> Bolsa média por empresa
              </h3>
              <BarChart data={m.bolsaPorEmpresa} color="#22c55e" formatValue={fmtReal} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm lg:col-span-2">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#041e3a] mb-5">
                <BarChart3 size={18} /> Carga horária média por curso
              </h3>
              <BarChart data={m.cargaPorCurso} color="#6366f1" formatValue={fmtHoras} />
            </div>
          </div>

          {m.totalContratos === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center text-center">
              <GraduationCap size={36} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Ainda não há TCEs com dados preenchidos. As análises aparecerão conforme os alunos enviarem solicitações.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
