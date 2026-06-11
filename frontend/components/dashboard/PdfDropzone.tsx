"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

/** Zona de upload de PDF (drag-and-drop), reutilizada nos fluxos de envio. */
export function PdfDropzone({
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
