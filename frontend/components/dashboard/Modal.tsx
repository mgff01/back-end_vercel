"use client";

import React from "react";
import { X } from "lucide-react";

/** Overlay modal simples e centralizado, consistente com o restante do sistema. */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            <h3 className="text-xl font-semibold text-[#041e3a]">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 pt-3">{children}</div>
      </div>
    </div>
  );
}
