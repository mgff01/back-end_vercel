"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Inbox, Eye, PenLine, FileSignature, Clock } from "lucide-react";
import { CoordinatorReviewView } from "./CoordinatorReviewView";
import { CoordinatorSignView } from "./CoordinatorSignView";
import { getItensCoordenador, TIPOS, type CoordenadorItem } from "@/lib/api";

type View = "list" | "review" | "sign";

function ItemCard({
  item,
  onAbrir,
}: {
  item: CoordenadorItem;
  onAbrir: (item: CoordenadorItem) => void;
}) {
  const { documento, solicitacao, alunoNome, tipo } = item;
  const cfg = TIPOS[tipo];
  const emAssinatura = documento.status === "EM_ASSINATURA";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div
          className={`rounded-full p-3 shrink-0 ${
            emAssinatura ? "bg-blue-50 text-blue-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {emAssinatura ? <PenLine size={20} /> : <FileSignature size={20} />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#041e3a]">
            Solicitação #{solicitacao.id} — {alunoNome}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Enviado em {new Date(documento.dataEnvio).toLocaleDateString("pt-BR")} · {cfg.label}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              emAssinatura ? "bg-blue-50 text-blue-800" : "bg-amber-100 text-amber-700"
            }`}
          >
            <Clock size={12} />
            {emAssinatura ? "Pendente: enviar assinado" : "Aguardando revisão"}
          </span>
        </div>
      </div>

      <button
        onClick={() => onAbrir(item)}
        className="flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-sm shrink-0"
      >
        {emAssinatura ? <PenLine size={16} /> : <Eye size={16} />}
        {emAssinatura ? "Enviar Assinado" : "Visualizar"}
      </button>
    </div>
  );
}

export function CoordinatorDashboard() {
  const [itens, setItens] = useState<CoordenadorItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selecionado, setSelecionado] = useState<CoordenadorItem | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setItens(await getItensCoordenador());
    } catch (e) {
      console.error("Erro ao carregar itens do coordenador:", e);
      setItens([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    getItensCoordenador()
      .then((i) => ativo && setItens(i))
      .catch((e) => {
        console.error("Erro ao carregar itens do coordenador:", e);
        if (ativo) setItens([]);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const abrir = (item: CoordenadorItem) => {
    setSelecionado(item);
    setView(item.documento.status === "EM_ASSINATURA" ? "sign" : "review");
  };

  const voltarEAtualizar = () => {
    setView("list");
    setSelecionado(null);
    carregar();
  };

  if (view === "review" && selecionado) {
    return (
      <CoordinatorReviewView
        item={selecionado}
        onBack={() => {
          setView("list");
          setSelecionado(null);
        }}
        onDone={voltarEAtualizar}
      />
    );
  }

  if (view === "sign" && selecionado) {
    return (
      <CoordinatorSignView
        item={selecionado}
        onBack={() => {
          setView("list");
          setSelecionado(null);
        }}
        onSuccess={voltarEAtualizar}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#041e3a]">Solicitações para análise</h2>
        <span className="text-xs text-gray-500">{itens.length} pendente(s)</span>
      </div>

      {carregando ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
          <Loader2 size={32} className="text-[#041e3a] animate-spin mb-3" />
          <p className="text-sm text-gray-500">Carregando solicitações...</p>
        </div>
      ) : itens.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[280px]">
          <div className="bg-gray-100 rounded-full p-4 mb-5">
            <Inbox size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#041e3a] mb-2">Nenhuma solicitação pendente</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Quando um aluno enviar o TCE assinado, a solicitação aparecerá aqui para revisão e assinatura.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {itens.map((item) => (
            <ItemCard key={`${item.tipo}-${item.documento.id}`} item={item} onAbrir={abrir} />
          ))}
        </div>
      )}
    </div>
  );
}
