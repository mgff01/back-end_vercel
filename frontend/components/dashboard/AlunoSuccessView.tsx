"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Download } from "lucide-react";
import {
  concluirContrato,
  baixarArquivo,
  type AplicacaoAtiva,
} from "@/lib/api";

export function AlunoSuccessView({
  aplicacao,
  onBack,
  onSuccess,
}: {
  aplicacao: AplicacaoAtiva;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { contrato, solicitacao } = aplicacao;
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState("");

  const confirmar = async () => {
    setConfirmando(true);
    setErro("");
    try {
      await concluirContrato(contrato.id);
      onSuccess();
    } catch (e) {
      setErro((e as Error).message);
      setConfirmando(false);
    }
  };

  const baixar = async () => {
    if (!contrato.arquivo) return;
    try {
      await baixarArquivo(contrato.arquivo, `TCE_assinado_solicitacao_${solicitacao.id}`);
    } catch (e) {
      setErro((e as Error).message);
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

      <div className="flex flex-col items-center text-center py-6">
        <div className="bg-green-100 rounded-full p-5 mb-5">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-[#041e3a] mb-2">
          Solicitação aprovada!
        </h2>
        <p className="text-sm text-gray-600 max-w-md mb-2">
          Seu TCE (Solicitação #{solicitacao.id}) foi assinado pela instituição e o
          processo de estágio está completo. Você já pode baixar o documento final
          assinado por todas as partes.
        </p>

        {contrato.arquivo && (
          <button
            onClick={baixar}
            className="mt-3 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            Baixar Documento Final
          </button>
        )}

        {erro && (
          <div className="mt-4 w-full p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {erro}
          </div>
        )}

        <button
          onClick={confirmar}
          disabled={confirmando}
          className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-8 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
        >
          {confirmando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          {confirmando ? "Finalizando..." : "Confirmar e Concluir"}
        </button>
      </div>
    </div>
  );
}
