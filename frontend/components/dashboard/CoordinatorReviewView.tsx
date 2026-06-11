"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  XCircle,
  Loader2,
  AlertTriangle,
  FileWarning,
} from "lucide-react";
import { PdfViewer } from "./PdfViewer";
import {
  baixarArquivo,
  marcarEmAssinatura,
  rejeitarContrato,
  type CoordenadorItem,
} from "@/lib/api";

const MOTIVO_PADRAO = "Documento não assinado pelo aluno e/ou pela empresa.";

type Etapa = "tce" | "apolice";

export function CoordinatorReviewView({
  item,
  onBack,
  onDone,
}: {
  item: CoordenadorItem;
  onBack: () => void;
  onDone: () => void;
}) {
  const { contrato, apolice, solicitacao, alunoNome } = item;
  const [etapa, setEtapa] = useState<Etapa>("tce");
  const [acao, setAcao] = useState<"aprovar" | "rejeitar" | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVO_PADRAO);
  const [erro, setErro] = useState("");

  const ocupado = acao !== null;

  // Aprova: baixa TCE + apólice e marca o contrato como EM_ASSINATURA.
  const aprovarEBaixar = async () => {
    setAcao("aprovar");
    setErro("");
    try {
      await baixarArquivo(contrato.arquivo!, `TCE_solicitacao_${solicitacao.id}`);
      if (apolice?.arquivo) {
        await baixarArquivo(apolice.arquivo, `Apolice_solicitacao_${solicitacao.id}`);
      }
      await marcarEmAssinatura(contrato.id);
      onDone();
    } catch (e) {
      setErro((e as Error).message);
      setAcao(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!motivo.trim()) {
      setErro("Informe um motivo para a rejeição.");
      return;
    }
    setAcao("rejeitar");
    setErro("");
    try {
      await rejeitarContrato(contrato.id, motivo.trim());
      onDone();
    } catch (e) {
      setErro((e as Error).message);
      setAcao(null);
    }
  };

  const noTce = etapa === "tce";
  const arquivoAtual = noTce ? contrato.arquivo : apolice?.arquivo ?? null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#041e3a] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para o painel
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-2xl font-semibold text-[#041e3a]">
          {noTce ? "Revisar TCE" : "Revisar Apólice"}
        </h2>
        <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
          Etapa {noTce ? "1" : "2"} de 2
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Solicitação #{solicitacao.id} · {alunoNome} · enviado em{" "}
        {new Date(contrato.dataEnvio).toLocaleDateString("pt-BR")}
      </p>

      {/* Visualizador do documento da etapa atual */}
      {!noTce && !apolice?.arquivo ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-50 border border-gray-200 rounded-lg text-center">
          <FileWarning size={32} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-600">Nenhuma apólice de seguro foi enviada para esta solicitação.</p>
        </div>
      ) : (
        <PdfViewer arquivo={arquivoAtual} />
      )}

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <AlertTriangle size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {noTce
            ? "Revise o TCE. Se estiver assinado por aluno e empresa, prossiga para a apólice. Caso contrário, rejeite a solicitação."
            : "Revise a apólice de seguro. Ao aprovar, os dois documentos (TCE e apólice) serão baixados para assinatura e a solicitação seguirá para assinatura da instituição."}
        </p>
      </div>

      {erro && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {erro}
        </div>
      )}

      {/* Painel de rejeição com mensagem editável */}
      {rejeitando ? (
        <div className="mt-6 border border-red-200 bg-red-50 rounded-lg p-4">
          <label className="block text-sm font-semibold text-red-800 mb-2">
            Motivo da rejeição
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full p-3 border border-red-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-300 focus:border-red-300 outline-none resize-none"
            placeholder="Descreva o motivo da rejeição..."
          />
          <p className="text-xs text-red-600 mt-1">
            Mensagem padrão preenchida — edite se quiser personalizar antes de confirmar.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={confirmarRejeicao}
              disabled={ocupado}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {acao === "rejeitar" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              {acao === "rejeitar" ? "Rejeitando..." : "Confirmar Rejeição"}
            </button>
            <button
              onClick={() => {
                setRejeitando(false);
                setErro("");
              }}
              disabled={ocupado}
              className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {noTce ? (
            <button
              onClick={() => {
                setEtapa("apolice");
                setErro("");
              }}
              disabled={ocupado}
              className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              Aprovar TCE e continuar <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEtapa("tce");
                  setErro("");
                }}
                disabled={ocupado}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <ArrowLeft size={16} /> Voltar ao TCE
              </button>
              <button
                onClick={aprovarEBaixar}
                disabled={ocupado}
                className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
              >
                {acao === "aprovar" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {acao === "aprovar" ? "Baixando..." : "Aprovar e Baixar (TCE + Apólice)"}
              </button>
            </>
          )}
          <button
            onClick={() => {
              setRejeitando(true);
              setMotivo(MOTIVO_PADRAO);
              setErro("");
            }}
            disabled={ocupado}
            className="flex items-center justify-center gap-2 bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <XCircle size={16} /> Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}
