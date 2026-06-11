"use client";

import React, { useState } from "react";
import { ArrowLeft, UploadCloud, FileText, AlertTriangle, Loader2, X } from "lucide-react";
import {
  enviarContratoAssinado,
  enviarApolice,
  type AplicacaoAtiva,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Zona de upload de PDF (drag-and-drop), reaproveitando o visual existente.
// ---------------------------------------------------------------------------
function PdfDropzone({
  id,
  file,
  onFile,
}: {
  id: string;
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(false);
      if (e.type === "drop") {
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type === "application/pdf") onFile(dropped);
      }
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
          dragActive ? "border-[#041e3a] bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrag}
      >
        {file ? (
          <>
            <FileText size={28} className="text-[#041e3a] mb-2" />
            <p className="text-sm font-medium text-gray-700 truncate max-w-full px-2">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={() => onFile(null)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <X size={12} /> Remover
            </button>
          </>
        ) : (
          <>
            <UploadCloud size={28} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Arraste o PDF aqui</p>
            <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
          </>
        )}
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          id={id}
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <label
        htmlFor={id}
        className="block text-center text-xs text-[#041e3a] underline mt-1.5 cursor-pointer hover:text-[#062d56]"
      >
        Selecionar arquivo
      </label>
    </div>
  );
}

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
