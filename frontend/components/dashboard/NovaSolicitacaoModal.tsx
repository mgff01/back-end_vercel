"use client";

import {
  FileText,
  ClipboardCheck,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Modal } from "./Modal";
import type { TipoDocumento } from "@/lib/api";

const OPCOES: {
  tipo: TipoDocumento;
  titulo: string;
  publico: string;
  descricao: string;
  icon: React.ReactNode;
}[] = [
  {
    tipo: "contrato",
    titulo: "TCE / Apólice de Seguro",
    publico: "Para quem vai começar um estágio",
    descricao:
      "Gera o Termo de Compromisso de Estágio (TCE) para assinatura de aluno e empresa. No envio também é anexada a apólice de seguro.",
    icon: <FileText size={22} />,
  },
  {
    tipo: "relatorio_intermediario",
    titulo: "Relatório Intermediário",
    publico: "Durante o estágio",
    descricao:
      "Gera o Relatório Intermediário de Estágio para assinatura e envio, relatando o progresso do seu estágio.",
    icon: <BarChart3 size={22} />,
  },
  {
    tipo: "relatorio",
    titulo: "Relatório Final",
    publico: "Para quem concluiu o estágio",
    descricao:
      "Gera o Relatório Final de Estágio para assinatura e envio, encerrando o ciclo do seu estágio.",
    icon: <ClipboardCheck size={22} />,
  },
];

export function NovaSolicitacaoModal({
  onSelect,
  onClose,
}: {
  onSelect: (tipo: TipoDocumento) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Nova Solicitação de Estágio"
      subtitle="Escolha o tipo de solicitação que deseja iniciar."
      onClose={onClose}
    >
      <div className="space-y-3">
        {OPCOES.map((op) => (
          <button
            key={op.tipo}
            onClick={() => onSelect(op.tipo)}
            className="w-full text-left group flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#041e3a] hover:bg-slate-50 transition-colors"
          >
            <div className="rounded-lg bg-blue-50 text-[#041e3a] p-3 shrink-0">
              {op.icon}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-[#041e3a]">
                {op.titulo}
              </p>
              <p className="text-xs font-medium text-amber-700 mt-0.5">
                {op.publico}
              </p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                {op.descricao}
              </p>
            </div>
            <ChevronRight
              size={20}
              className="text-gray-300 group-hover:text-[#041e3a] shrink-0 mt-1"
            />
          </button>
        ))}
      </div>
    </Modal>
  );
}
