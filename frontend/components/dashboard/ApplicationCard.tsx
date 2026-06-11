"use client";

import {
  CheckCircle,
  Send,
  Download,
  Clock,
  FileSignature,
  PenLine,
  XCircle,
  PartyPopper,
} from "lucide-react";
import { arquivoUrl, TIPOS, type AplicacaoAtiva, type DocumentoStatus } from "@/lib/api";

type StepStatus = "done" | "active" | "pending";

function Timeline({ steps }: { steps: { label: string; status: StepStatus }[] }) {
  return (
    <div className="relative flex items-start gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex-1 flex flex-col items-center relative">
          {i > 0 && (
            <div
              className={`absolute top-4 right-1/2 -left-1/2 h-0.5 -translate-y-1/2 ${
                step.status === "pending" ? "bg-gray-200" : "bg-[#041e3a]"
              }`}
            />
          )}
          <div
            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
              step.status === "done"
                ? "bg-[#041e3a] border-[#041e3a]"
                : step.status === "active"
                ? "bg-amber-400 border-amber-400"
                : "bg-white border-gray-300"
            }`}
          >
            {step.status === "done" ? (
              <CheckCircle size={16} className="text-white" />
            ) : step.status === "active" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            )}
          </div>
          <div className="mt-2 text-center px-1">
            <p
              className={`text-xs font-medium leading-tight ${
                step.status === "done"
                  ? "text-[#041e3a]"
                  : step.status === "active"
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </p>
            {step.status === "active" && (
              <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Atual
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: DocumentoStatus }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    GERADO: { label: "Ação necessária", cls: "bg-amber-100 text-amber-700", icon: <FileSignature size={13} /> },
    ENVIADO: { label: "Aguardando instituição", cls: "bg-blue-50 text-blue-800", icon: <Clock size={13} /> },
    EM_ASSINATURA: { label: "Instituição assinando", cls: "bg-blue-50 text-blue-800", icon: <PenLine size={13} /> },
    REJEITADO: { label: "Rejeitado", cls: "bg-red-50 text-red-700", icon: <XCircle size={13} /> },
    APROVADO: { label: "Finalizada", cls: "bg-green-100 text-green-700", icon: <PartyPopper size={13} /> },
  };
  const cfg = map[status] ?? map.ENVIADO;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function ApplicationCard({
  aplicacao,
  onEnviarDocumentos,
  onAbrirSucesso,
}: {
  aplicacao: AplicacaoAtiva;
  onEnviarDocumentos: () => void;
  onAbrirSucesso: () => void;
}) {
  const { solicitacao, documento, tipo } = aplicacao;
  const cfg = TIPOS[tipo];
  const status = documento.status;
  const arquivo = arquivoUrl(documento.arquivo);

  const concluido = status === "APROVADO";
  const precisaEnviar = status === "GERADO" || status === "REJEITADO";

  const steps: { label: string; status: StepStatus }[] = [
    { label: "Solicitação criada", status: "done" },
    { label: "Documento enviado", status: precisaEnviar ? "active" : "done" },
    { label: "Assinatura do Ibmec", status: concluido ? "done" : status === "EM_ASSINATURA" || status === "ENVIADO" ? "active" : "pending" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#041e3a]">
            Solicitação #{solicitacao.id} — {cfg.label}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{cfg.labelLongo}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mb-6">
        <Timeline steps={steps} />
      </div>

      {/* GERADO — precisa enviar o assinado */}
      {status === "GERADO" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <FileSignature size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Seu {cfg.label} foi gerado. Assine o documento (aluno e empresa) e, em seguida, envie-o para dar continuidade ao processo.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onEnviarDocumentos}
              className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
            >
              <Send size={16} />
              Enviar Documento Assinado
            </button>
            {arquivo && (
              <a
                href={arquivo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                Baixar Documento Gerado
              </a>
            )}
          </div>
        </div>
      )}

      {/* ENVIADO — aguardando o coordenador */}
      {status === "ENVIADO" && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Documento enviado com sucesso!</p>
            <p className="text-sm text-green-700 mt-0.5">Aguardando assinatura da instituição.</p>
          </div>
        </div>
      )}

      {/* EM_ASSINATURA — instituição assinando */}
      {status === "EM_ASSINATURA" && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <PenLine size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Documento em assinatura</p>
            <p className="text-sm text-blue-700 mt-0.5">
              A instituição está revisando e assinando seu {cfg.label}. Aguarde a conclusão.
            </p>
          </div>
        </div>
      )}

      {/* REJEITADO — mostra motivo e permite reenviar */}
      {status === "REJEITADO" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Solicitação rejeitada</p>
              <p className="text-sm text-red-700 mt-0.5">
                {documento.motivo_rejeicao || "Reenvie os documentos corrigidos."}
              </p>
            </div>
          </div>
          <button
            onClick={onEnviarDocumentos}
            className="w-full flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
          >
            <Send size={16} />
            Reenviar Documentos
          </button>
        </div>
      )}

      {/* APROVADO — finalizada, abrir tela de sucesso */}
      {status === "APROVADO" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <PartyPopper size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Solicitação finalizada!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Seu {cfg.label} foi assinado pela instituição. Confira e conclua o processo.
              </p>
            </div>
          </div>
          <button
            onClick={onAbrirSucesso}
            className="w-full flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
          >
            <CheckCircle size={16} />
            Ver e Concluir
          </button>
        </div>
      )}
    </div>
  );
}
