"use client";

import { useState } from "react";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { PdfDropzone } from "./PdfDropzone";
import {
  enviarContratoAssinado,
  enviarApolice,
  type AplicacaoAtiva,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Página de envio dos documentos assinados.
// ---------------------------------------------------------------------------
export function SendDocumentsView({
  aplicacao,
  onBack,
  onSuccess,
}: {
  aplicacao: AplicacaoAtiva;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { solicitacao, contrato } = aplicacao;
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [apoliceFile, setApoliceFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async () => {
    if (!contratoFile || !apoliceFile) {
      setErro("Anexe o TCE e a apólice de seguro, ambos assinados em PDF, para continuar.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await enviarContratoAssinado(contrato.id, contratoFile);
      await enviarApolice(solicitacao.id, apoliceFile);
      onSuccess();
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#041e3a] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para o painel
      </button>

      <h2 className="text-2xl font-semibold text-[#041e3a] mb-1">Enviar Documentos do Estágio</h2>
      <p className="text-sm text-gray-500 mb-6">Solicitação #{solicitacao.id} — Termo de Compromisso de Estágio (TCE)</p>

      {/* Aviso */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Atenção:</strong> envie os documentos somente após estarem assinados pelo <strong>aluno</strong> e pela <strong>empresa</strong>. Isso vale tanto para o TCE quanto para a apólice de seguro.
        </p>
      </div>

      <div className="space-y-6">
        {/* TCE assinado (obrigatório) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            TCE assinado (PDF) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            O contrato de estágio gerado, já assinado por aluno e empresa.
          </p>
          <PdfDropzone id="contrato-assinado" file={contratoFile} onFile={setContratoFile} />
        </div>

        {/* Apólice (opcional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Apólice de seguro (PDF) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Seguro contra acidentes do estagiário, já assinado por aluno e empresa.
          </p>
          <PdfDropzone id="apolice-assinada" file={apoliceFile} onFile={setApoliceFile} />
        </div>

        {erro && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {erro}
          </div>
        )}

        <button
          onClick={enviar}
          disabled={enviando || !contratoFile || !apoliceFile}
          className="w-full flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
        >
          {enviando && <Loader2 size={18} className="animate-spin" />}
          {enviando ? "Enviando..." : "Enviar Documentos"}
        </button>
      </div>
    </div>
  );
}
