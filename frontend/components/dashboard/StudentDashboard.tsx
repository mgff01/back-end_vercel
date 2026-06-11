"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FilePlus, Download, FileX, ArrowLeft, Loader2 } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";
import { SendDocumentsView } from "./SendDocumentsView";
import { AlunoSuccessView } from "./AlunoSuccessView";
import { RequirementsCard } from "./RequirementsCard";
import {
  getModeloContrato,
  lerCampos,
  gerarDocumento,
  baixarPdfBase64,
  criarSolicitacao,
  getAplicacaoAtiva,
  type ModeloDocumento,
  type AplicacaoAtiva,
} from "@/lib/api";

type View = "dashboard" | "new-application" | "send-documents" | "success";

// ============================================================================
// FORMULÁRIO DINÂMICO DO TCE
// ============================================================================
function DynamicApplicationForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [modelo, setModelo] = useState<ModeloDocumento | null>(null);
  const [carregandoModelo, setCarregandoModelo] = useState(true);
  const [erroModelo, setErroModelo] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [acao, setAcao] = useState<"preview" | "confirmar" | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  // Carrega apenas o modelo de contrato (TCE) — único documento do fluxo.
  useEffect(() => {
    let ativo = true;
    getModeloContrato()
      .then((m) => ativo && setModelo(m))
      .catch((e) => ativo && setErroModelo((e as Error).message))
      .finally(() => ativo && setCarregandoModelo(false));
    return () => {
      ativo = false;
    };
  }, []);

  const camposSeguros = useMemo(() => lerCampos(modelo), [modelo]);

  const handleInputChange = (id: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [id]: valor }));
  };

  // Apenas confere: gera o PDF e baixa, sem criar nada no backend.
  const baixarPreview = async () => {
    if (!modelo) return;
    setLoading(true);
    setAcao("preview");
    setMensagem("");
    setErro(false);
    try {
      const { documento_base64 } = await gerarDocumento({
        modeloId: modelo.id,
        solicitacaoId: 0, // ignorado no preview
        dados: formData,
        preview: true,
      });
      baixarPdfBase64(documento_base64, `preview_${modelo.titulo.replace(/\s+/g, "_")}`);
      setMensagem("Preview baixado! Confira o documento e clique em 'Confirmar e Baixar' se estiver tudo certo.");
    } catch (e) {
      setErro(true);
      setMensagem(`Erro: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setAcao(null);
    }
  };

  // Cria a solicitação, salva o TCE gerado no backend e baixa o PDF.
  const confirmarEBaixar = async () => {
    if (!modelo) return;
    setLoading(true);
    setAcao("confirmar");
    setMensagem("");
    setErro(false);
    try {
      const solicitacao = await criarSolicitacao();
      const { documento_base64 } = await gerarDocumento({
        modeloId: modelo.id,
        solicitacaoId: solicitacao.id,
        dados: formData,
        preview: false,
      });
      baixarPdfBase64(documento_base64, `TCE_${modelo.titulo.replace(/\s+/g, "_")}`);
      setMensagem("TCE gerado e salvo! Voltando ao painel...");
      setFormData({});
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setErro(true);
      setMensagem(`Erro: ${(e as Error).message}`);
      setLoading(false);
      setAcao(null);
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

      <h2 className="text-2xl font-semibold text-[#041e3a] mb-1">Nova Solicitação de Estágio</h2>
      <p className="text-sm text-gray-500 mb-6">
        Preencha os dados do Termo de Compromisso de Estágio (TCE).
      </p>

      {carregandoModelo && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
          <Loader2 size={18} className="animate-spin" /> Carregando o formulário...
        </div>
      )}

      {erroModelo && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {erroModelo}
        </div>
      )}

      {modelo && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div className="space-y-4">
            {camposSeguros.map((campo) => (
              <div key={campo.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{campo.label}</label>
                <input
                  type={campo.tipo || "text"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
                  value={formData[campo.id] || ""}
                  onChange={(e) => handleInputChange(campo.id, e.target.value)}
                  required
                />
              </div>
            ))}

            {camposSeguros.length === 0 && (
              <p className="text-sm text-amber-600">Este documento não possui campos configurados.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={baixarPreview}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-[#041e3a] text-[#041e3a] hover:bg-slate-50 font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {acao === "preview" && <Loader2 size={18} className="animate-spin" />}
              {acao === "preview" ? "Gerando..." : "Baixar Preview"}
            </button>
            <button
              onClick={confirmarEBaixar}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {acao === "confirmar" && <Loader2 size={18} className="animate-spin" />}
              {acao === "confirmar" ? "Salvando..." : "Confirmar e Baixar"}
            </button>
          </div>
        </div>
      )}

      {mensagem && (
        <div
          className={`mt-6 p-4 rounded-lg font-medium ${
            erro
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD DO ALUNO
// ============================================================================
export function StudentDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [aplicacao, setAplicacao] = useState<AplicacaoAtiva | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setAplicacao(await getAplicacaoAtiva());
    } catch (e) {
      console.error("Erro ao carregar a aplicação ativa:", e);
      setAplicacao(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carga inicial: atualiza o estado apenas nos callbacks assíncronos para não
  // disparar setState síncrono dentro do efeito.
  useEffect(() => {
    let ativo = true;
    getAplicacaoAtiva()
      .then((a) => ativo && setAplicacao(a))
      .catch((e) => {
        console.error("Erro ao carregar a aplicação ativa:", e);
        if (ativo) setAplicacao(null);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const voltarEAtualizar = useCallback(() => {
    setView("dashboard");
    carregar();
  }, [carregar]);

  if (view === "new-application") {
    return (
      <DynamicApplicationForm onBack={() => setView("dashboard")} onSuccess={voltarEAtualizar} />
    );
  }

  if (view === "send-documents" && aplicacao) {
    return (
      <SendDocumentsView
        aplicacao={aplicacao}
        onBack={() => setView("dashboard")}
        onSuccess={voltarEAtualizar}
      />
    );
  }

  if (view === "success" && aplicacao) {
    return (
      <AlunoSuccessView
        aplicacao={aplicacao}
        onBack={() => setView("dashboard")}
        onSuccess={voltarEAtualizar}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {carregando ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
            <Loader2 size={32} className="text-[#041e3a] animate-spin mb-3" />
            <p className="text-sm text-gray-500">Carregando sua aplicação...</p>
          </div>
        ) : aplicacao ? (
          <ApplicationCard
            aplicacao={aplicacao}
            onEnviarDocumentos={() => setView("send-documents")}
            onAbrirSucesso={() => setView("success")}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[320px]">
            <div className="bg-gray-100 rounded-full p-4 mb-5">
              <FileX size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#041e3a] mb-2">
              Nenhum estágio em andamento
            </h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Você ainda não iniciou nenhuma aplicação de estágio. Clique no botão abaixo para começar o processo de submissão do seu TCE.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setView("new-application")}
                className="flex items-center justify-center gap-2 bg-[#041e3a] hover:bg-[#062d56] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm text-sm"
              >
                <FilePlus size={18} />
                Iniciar Aplicação de Estágio
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm text-sm">
                <Download size={18} />
                Baixar Modelo de TCE (ZIP)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <RequirementsCard />
      </div>
    </div>
  );
}
