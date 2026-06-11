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
  rejeitarDocumento,
  TIPOS,
  type CoordenadorItem,
} from "@/lib/api";

const MOTIVO_PADRAO = "Documento não assinado pelo aluno e/ou pela empresa.";

type Etapa = "doc" | "apolice";

export function CoordinatorReviewView({
  item,
  onBack,
  onDone,
}: {
  item: CoordenadorItem;
  onBack: () => void;
  onDone: () => void;
}) {
  const { documento, apolice, solicitacao, alunoNome, tipo } = item;
  const cfg = TIPOS[tipo];
  const temApolice = cfg.temApolice;

  const [etapa, setEtapa] = useState<Etapa>("doc");
  const [acao, setAcao] = useState<"aprovar" | "rejeitar" | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVO_PADRAO);
  const [erro, setErro] = useState("");

  const ocupado = acao !== null;
  const noDoc = etapa === "doc";
  const naApolice = etapa === "apolice";
  // No fluxo com apólice, a aprovação acontece na etapa da apólice; sem apólice,
  // acontece direto na etapa do documento.
  const etapaDeAprovacao = temApolice ? naApolice : noDoc;

  // Aprova: baixa o(s) documento(s) e marca como EM_ASSINATURA.
  const aprovarEBaixar = async () => {
    setAcao("aprovar");
    setErro("");
    try {
      await baixarArquivo(documento.arquivo!, `${cfg.label}_solicitacao_${solicitacao.id}`);
      if (temApolice && apolice?.arquivo) {
        await baixarArquivo(apolice.arquivo, `Apolice_solicitacao_${solicitacao.id}`);
      }
      await marcarEmAssinatura(tipo, documento.id);
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
      await rejeitarDocumento(tipo, documento.id, motivo.trim());
      onDone();
    } catch (e) {
      setErro((e as Error).message);
      setAcao(null);
    }
  };

  const arquivoAtual = noDoc ? documento.arquivo : apolice?.arquivo ?? null;
  const titulo = noDoc ? `Revisar ${cfg.label}` : "Revisar Apólice";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#041e3a] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para o painel
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-2xl font-semibold text-[#041e3a]">{titulo}</h2>
        {temApolice && (
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
            Etapa {noDoc ? "1" : "2"} de 2
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Solicitação #{solicitacao.id} · {alunoNome} · enviado em{" "}
        {new Date(documento.dataEnvio).toLocaleDateString("pt-BR")}
      </p>

      {/* Visualizador do documento da etapa atual */}
      {naApolice && !apolice?.arquivo ? (
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
          {naApolice
            ? "Revise a apólice de seguro. Ao aprovar, os dois documentos (TCE e apólice) serão baixados para assinatura e a solicitação seguirá para assinatura da instituição."
            : temApolice
            ? `Revise o ${cfg.label}. Se estiver assinado por aluno e empresa, prossiga para a apólice. Caso contrário, rejeite a solicitação.`
            : `Revise o ${cfg.label}. Se estiver assinado por aluno e empresa, aprove para baixá-lo e assinar. Caso contrário, rejeite a solicitação.`}
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
          <label className="block text-sm font-semibold text-red-800 mb-2">Motivo da rejeição</label>
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
          {temApolice && noDoc && (
            <button
              onClick={() => {
                setEtapa("apolice");
                setErro("");
              }}
              disabled={ocupado}
              className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              Aprovar {cfg.label} e continuar <ArrowRight size={16} />
            </button>
          )}

          {temApolice && naApolice && (
            <button
              onClick={() => {
                setEtapa("doc");
                setErro("");
              }}
              disabled={ocupado}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Voltar ao {cfg.label}
            </button>
          )}

          {etapaDeAprovacao && (
            <button
              onClick={aprovarEBaixar}
              disabled={ocupado}
              className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              {acao === "aprovar" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {acao === "aprovar"
                ? "Baixando..."
                : temApolice
                ? "Aprovar e Baixar (TCE + Apólice)"
                : "Aprovar e Baixar"}
            </button>
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
