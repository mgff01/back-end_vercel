"use client";

import { useState } from "react";
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { PdfDropzone } from "./PdfDropzone";
import { finalizarDocumento, TIPOS, type CoordenadorItem } from "@/lib/api";

export function CoordinatorSignView({
  item,
  onBack,
  onSuccess,
}: {
  item: CoordenadorItem;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { documento, solicitacao, alunoNome, tipo } = item;
  const cfg = TIPOS[tipo];
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async () => {
    if (!file) {
      setErro(`Anexe o ${cfg.label} assinado pela instituição em PDF para finalizar.`);
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await finalizarDocumento(tipo, documento.id, file);
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

      <h2 className="text-2xl font-semibold text-[#041e3a] mb-1">Enviar {cfg.label} Assinado</h2>
      <p className="text-sm text-gray-500 mb-6">
        Solicitação #{solicitacao.id} · {alunoNome}
      </p>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Anexe o {cfg.label} já <strong>assinado pela instituição</strong>. Ao enviar, a análise é finalizada e o aluno é notificado da conclusão.
        </p>
      </div>

      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {cfg.label} assinado pela instituição (PDF) <span className="text-red-500">*</span>
      </label>
      <PdfDropzone id="tce-assinado-coord" file={file} onFile={setFile} />

      {erro && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {erro}
        </div>
      )}

      <button
        onClick={enviar}
        disabled={enviando || !file}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
      >
        {enviando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        {enviando ? "Finalizando..." : "Finalizar e Enviar Assinado"}
      </button>
    </div>
  );
}
