/**
 * Integração de Assinatura Digital com Gov.BR
 *
 * Fluxo:
 * 1. User clica "Assinar com Gov.BR"
 * 2. Frontend chama POST /api/documentos/assinar-govbr/
 * 3. Backend retorna URL para gov.br
 * 4. Frontend redireciona para URL
 * 5. User assina no portal gov.br
 * 6. Gov.br redireciona para POST /api/govbr-callback/
 * 7. Backend processa e salva documento assinado
 * 8. Frontend recebe notificação de sucesso
 */

import { API_BASE } from "./api";
import { getToken } from "./auth";

// ============================================================================
// Tipos
// ============================================================================

export interface IniciarAssinaturaRequest {
  documento_id: number;
  tipo: "contrato" | "relatorio";
}

export interface IniciarAssinaturaResponse {
  mensagem: string;
  url_assinatura: string;
  documento_id: number;
}

export interface StatusAssinatura {
  documento_id: number;
  tipo: "contrato" | "relatorio";
  status: "GERADO" | "EM_ASSINATURA" | "ENVIADO" | "REJEITADO";
  data_assinatura?: string;
  mensagem_erro?: string;
}

// ============================================================================
// Funções de Assinatura
// ============================================================================

/**
 * Inicia o fluxo de assinatura com gov.br
 *
 * @param documento_id - ID do documento
 * @param tipo - Tipo do documento (contrato, relatorio)
 * @returns URL para redirecionamento ao gov.br
 */
export async function iniciarAssinaturaPdf(
  documento_id: number,
  tipo: "contrato" | "relatorio",
): Promise<IniciarAssinaturaResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  const res = await fetch(`${API_BASE}/api/documentos/assinar-govbr/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      documento_id,
      tipo,
    }),
  });

  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro.erro || "Falha ao iniciar assinatura com gov.br");
  }

  return res.json();
}

/**
 * Aguarda a conclusão da assinatura com polling
 *
 * @param documento_id - ID do documento
 * @param maxTentativas - Número máximo de tentativas (padrão: 60 = 5 minutos)
 * @returns Status final da assinatura
 */
export async function aguardarAssinatura(
  documento_id: number,
  maxTentativas: number = 60,
): Promise<StatusAssinatura> {
  const intervalo = 5000; // 5 segundos entre tentativas
  let tentativas = 0;

  return new Promise((resolve, reject) => {
    const verificar = async () => {
      tentativas++;

      try {
        // Aqui você faria uma chamada para verificar o status
        // Por enquanto, apenas retornamos após o tempo
        if (tentativas >= maxTentativas) {
          resolve({
            documento_id,
            tipo: "contrato",
            status: "EM_ASSINATURA",
            mensagem_erro:
              "Timeout: assinatura não foi completada no tempo esperado",
          });
          return;
        }

        setTimeout(verificar, intervalo);
      } catch (erro) {
        reject(erro);
      }
    };

    verificar();
  });
}

/**
 * Redireciona para assinatura gov.br
 *
 * @param documento_id - ID do documento
 * @param tipo - Tipo do documento
 */
export async function redirecionarAssinatura(
  documento_id: number,
  tipo: "contrato" | "relatorio",
): Promise<void> {
  try {
    const resposta = await iniciarAssinaturaPdf(documento_id, tipo);

    // Redireciona para gov.br
    window.location.href = resposta.url_assinatura;

    // Opcionalmente, aguarda resposta (para feedback visual)
    // const statusFinal = await aguardarAssinatura(documento_id);
  } catch (erro) {
    throw new Error(`Erro ao iniciar assinatura: ${(erro as Error).message}`);
  }
}

// ============================================================================
// Exemplo de Uso em Componente React/Next.js
// ============================================================================

/**
 * Exemplo de uso em um componente:

import { redirecionarAssinatura } from "@/lib/govbr_assinatura";

export function BotaoAssinarComGovBr({
  documentoId,
  tipo,
  disabled = false,
  onLoading,
  onError,
}: {
  documentoId: number;
  tipo: "contrato" | "relatorio";
  disabled?: boolean;
  onLoading?: (loading: boolean) => void;
  onError?: (erro: string) => void;
}) {
  const [carregando, setCarregando] = useState(false);

  const handleAssinar = async () => {
    setCarregando(true);
    onLoading?.(true);

    try {
      await redirecionarAssinatura(documentoId, tipo);
      // Usuário será redirecionado para gov.br
    } catch (erro) {
      const mensagem = (erro as Error).message;
      onError?.(mensagem);
      setCarregando(false);
      onLoading?.(false);
    }
  };

  return (
    <button
      onClick={handleAssinar}
      disabled={disabled || carregando}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {carregando ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Redirecionando...
        </>
      ) : (
        <>
          <Edit3 size={18} />
          Assinar com Gov.BR
        </>
      )}
    </button>
  );
}
 */
