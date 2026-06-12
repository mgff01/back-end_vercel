"use client";

import { useState, useEffect } from "react";
import { FileDown, Loader2, FileText } from "lucide-react";
import { Modal } from "./Modal";
import { getModelos, arquivoUrl, type ModeloDocumento } from "@/lib/api";

export function BaixarModelosModal({ onClose }: { onClose: () => void }) {
  const [modelos, setModelos] = useState<ModeloDocumento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    getModelos()
      .then((m) => ativo && setModelos(m))
      .catch((e) => ativo && setErro((e as Error).message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Modal
      title="Baixar Modelos"
      subtitle="Modelos oficiais disponíveis para download."
      onClose={onClose}
    >
      {carregando ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
          <Loader2 size={18} className="animate-spin" /> Carregando modelos...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {erro}
        </div>
      ) : modelos.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">Nenhum modelo disponível.</p>
      ) : (
        <div className="space-y-3">
          {modelos.map((m) => {
            const url = arquivoUrl(m.arquivoUrl);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-blue-50 text-[#041e3a] p-2.5 shrink-0">
                    <FileText size={18} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate">{m.titulo}</p>
                </div>
                {url ? (
                  <a
                    href={url}
                    download
                    className="flex items-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm shrink-0"
                  >
                    <FileDown size={16} /> Baixar
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 shrink-0">indisponível</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
