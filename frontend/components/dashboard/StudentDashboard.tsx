"use client";

import { useState, useEffect, useMemo } from "react";
import { FilePlus, Download, FileX, ArrowLeft } from "lucide-react";
import { ApplicationTimeline } from "./ApplicationTimeline";
import { SubsequentUploads } from "./SubsequentUploads";
import { RequirementsCard } from "./RequirementsCard";

// 1. TIPAGENS
interface CampoDinamico {
  id: string;
  label: string;
  tipo: string;
}

interface ModeloDocumento {
  id: number;
  titulo: string;
  campos_dinamicos: any; // Deixamos 'any' aqui para poder tratar se vier como String do Django
}

type View = "dashboard" | "new-application";

// ============================================================================
// 2. O FORMULÁRIO DINÂMICO (À Prova de Balas)
// ============================================================================
function DynamicApplicationForm({ 
  onBack, 
  onSuccess 
}: { 
  onBack: () => void; 
  onSuccess: () => void;
}) {
  const [modelos, setModelos] = useState<ModeloDocumento[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloDocumento | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const SOLICITACAO_TESTE_ID = 1;

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/modelos-documento/")
      .then((res) => {
        if (!res.ok) throw new Error("Erro na resposta do servidor.");
        return res.json();
      })
      .then((data) => {
        // TRAVA 1: Garante que 'modelos' sempre será um Array, independente se o Django usar paginação ou não.
        if (Array.isArray(data)) {
          setModelos(data);
        } else if (data && Array.isArray(data.results)) {
          setModelos(data.results);
        } else {
          setModelos([]);
        }
      })
      .catch((err) => console.error("Erro ao buscar modelos:", err));
  }, []);

  const handleInputChange = (id: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [id]: valor }));
  };

  const enviarParaAPI = async (isPreview: boolean) => {
    if (!modeloSelecionado) return;
    setLoading(true);
    setMensagem("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/documentos/gerar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelo_id: modeloSelecionado.id,
          solicitacao_id: SOLICITACAO_TESTE_ID,
          dados: formData,
          preview: isPreview,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.erro || "Erro na requisição");

      if (isPreview) {
        const linkSource = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.documento_base64}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = `preview_${modeloSelecionado.titulo.replace(/\s+/g, '_')}.docx`;
        downloadLink.click();
        setMensagem("Preview baixado! Verifique o arquivo e clique em 'Confirmar e Assinar' se estiver tudo certo.");
      } else {
        setMensagem(`✅ Sucesso! TCE gerado e salvo.`);
        setFormData({});
        setTimeout(() => onSuccess(), 2000); 
      }
    } catch (error: any) {
      setMensagem(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // TRAVA 2: Converte os campos dinâmicos caso o Django tenha enviado como String (Texto)
  const camposSeguros = useMemo<CampoDinamico[]>(() => {
    if (!modeloSelecionado?.campos_dinamicos) return [];
    
    // Se já for uma lista bonitinha, retorna
    if (Array.isArray(modeloSelecionado.campos_dinamicos)) {
      return modeloSelecionado.campos_dinamicos;
    }
    
    // Se for texto (comum no JSONField do Django), tenta transformar em lista
    if (typeof modeloSelecionado.campos_dinamicos === 'string') {
      try {
        return JSON.parse(modeloSelecionado.campos_dinamicos);
      } catch (e) {
        console.error("Erro ao ler os campos do Django:", e);
        return [];
      }
    }
    return [];
  }, [modeloSelecionado]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#041e3a] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar para o painel
      </button>

      <h2 className="text-2xl font-semibold text-[#041e3a] mb-6">Nova Solicitação de Estágio</h2>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione o tipo de documento:</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
          onChange={(e) => {
            const modelo = modelos.find((m) => m.id === Number(e.target.value));
            setModeloSelecionado(modelo || null);
            setFormData({});
            setMensagem("");
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Escolha um modelo --</option>
          {Array.isArray(modelos) && modelos.map((m) => (
            <option key={m.id} value={m.id}>{m.titulo}</option>
          ))}
        </select>
      </div>

      {modeloSelecionado && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6">
          <div className="space-y-4">
            {/* O React agora mapeia uma lista 100% segura e garantida */}
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
              onClick={() => enviarParaAPI(true)}
              disabled={loading}
              className="flex-1 bg-white border-2 border-[#041e3a] text-[#041e3a] hover:bg-slate-50 font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? "Processando..." : "1. Baixar Preview para Conferência"}
            </button>
            <button
              onClick={() => enviarParaAPI(false)}
              disabled={loading}
              className="flex-1 bg-[#041e3a] hover:bg-[#062d56] text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : "2. Confirmar, Assinar e Enviar"}
            </button>
          </div>
        </div>
      )}

      {mensagem && (
        <div className={`mt-6 p-4 rounded-lg font-medium ${mensagem.includes("❌") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. DASHBOARD (Intacto)
// ============================================================================
export function StudentDashboard() {
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [view, setView] = useState<View>("dashboard");

  if (view === "new-application") {
    return (
      <DynamicApplicationForm 
        onBack={() => setView("dashboard")} 
        onSuccess={() => {
          setHasActiveApplication(true); 
          setView("dashboard"); 
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <span>Teste: Simular aplicação ativa</span>
          <button
            type="button"
            role="switch"
            aria-checked={hasActiveApplication}
            onClick={() => setHasActiveApplication(!hasActiveApplication)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              hasActiveApplication ? "bg-[#041e3a]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                hasActiveApplication ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {hasActiveApplication ? (
            <>
              <ApplicationTimeline />
              <SubsequentUploads />
            </>
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
    </div>
  );
}