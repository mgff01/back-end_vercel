"use client";

import { useState, useEffect } from "react";
import { Loader2, FileWarning } from "lucide-react";
import { getPdfBlobUrl } from "@/lib/api";

/**
 * Exibe um PDF embutido. Busca o arquivo como blob (object URL local) para
 * contornar o X-Frame-Options do Django ao usar <iframe>.
 */
export function PdfViewer({ arquivo }: { arquivo: string | null }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!arquivo) return;
    let url: string | null = null;
    let ativo = true;
    getPdfBlobUrl(arquivo)
      .then((u) => {
        url = u;
        if (ativo) setBlobUrl(u);
        else URL.revokeObjectURL(u);
      })
      .catch((e) => ativo && setErro((e as Error).message));
    return () => {
      ativo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [arquivo]);

  if (!arquivo) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50 border border-gray-200 rounded-lg text-center">
        <FileWarning size={32} className="text-amber-500 mb-3" />
        <p className="text-sm text-gray-600">Documento sem arquivo.</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50 border border-gray-200 rounded-lg text-center">
        <FileWarning size={32} className="text-amber-500 mb-3" />
        <p className="text-sm text-gray-600">{erro}</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50 border border-gray-200 rounded-lg">
        <Loader2 size={28} className="text-[#041e3a] animate-spin mb-2" />
        <p className="text-sm text-gray-500">Carregando documento...</p>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      title="Visualizador de PDF"
      className="w-full h-[60vh] border border-gray-200 rounded-lg bg-white"
    />
  );
}
