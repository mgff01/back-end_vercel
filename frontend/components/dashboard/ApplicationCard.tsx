"use client";

import { CheckCircle, Send, Download, Clock, FileSignature } from "lucide-react";
import { API_BASE, type AplicacaoAtiva } from "@/lib/api";

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

function urlAbsoluta(arquivo: string | null): string | null {
  if (!arquivo) return null;
  return arquivo.startsWith("http") ? arquivo : `${API_BASE}${arquivo}`;
}

export function ApplicationCard({
  aplicacao,
  onEnviarDocumentos,
}: {
  aplicacao: AplicacaoAtiva;
  onEnviarDocumentos: () => void;
}) {
  const { solicitacao, contrato } = aplicacao;
  const enviado = contrato.status === "ENVIADO";
  const arquivo = urlAbsoluta(contrato.arquivo);

  const steps: { label: string; status: StepStatus }[] = [
    { label: "Solicitação criada", status: "done" },
    { label: "Documento enviado", status: enviado ? "done" : "active" },
    { label: "Assinatura do Ibmec", status: enviado ? "active" : "pending" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#041e3a]">
            Solicitação de Estágio #{solicitacao.id}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Termo de Compromisso de Estágio (TCE)
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
            enviado ? "bg-blue-50 text-blue-800" : "bg-amber-100 text-amber-700"
          }`}
        >
          {enviado ? <Clock size={13} /> : <FileSignature size={13} />}
          {enviado ? "Aguardando instituição" : "Ação necessária"}
        </span>
      </div>

      <div className="mb-6">
        <Timeline steps={steps} />
      </div>

      {enviado ? (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Documento enviado com sucesso!
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              Aguardando assinatura da instituição.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <FileSignature size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Seu TCE foi gerado. Assine o documento (aluno e empresa) e, em seguida, envie-o para dar continuidade ao processo.
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
    </div>
  );
}
