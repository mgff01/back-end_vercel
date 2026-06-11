// Camada central de acesso à API Django do sistema de estágios.
// Concentra a base URL, o aluno de teste (enquanto não há autenticação) e os
// helpers usados pelo fluxo do aluno.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

// Sem autenticação ainda: identificamos o aluno atual pela matrícula (João Silva,
// criado pelo populate_db.py). Resolvemos o id em runtime porque o reseed do banco
// muda os ids do autoincremento — fixar um número quebra após cada reseed.
// Trocar por dados do login quando a autenticação for implementada.
export const ALUNO_ATUAL_MATRICULA = "2021001";

// Título do modelo usado no fluxo do aluno (único documento disponível).
export const MODELO_CONTRATO_TITULO = "Modelo de Contrato";

let _alunoIdCache: number | null = null;

/** Resolve (e memoiza) o id do aluno atual a partir da matrícula. */
export async function getAlunoAtualId(): Promise<number> {
  if (_alunoIdCache != null) return _alunoIdCache;
  const alunos = comoLista<{ id: number; matricula: string }>(
    await getJson("/api/alunos/"),
  );
  const aluno =
    alunos.find((a) => a.matricula === ALUNO_ATUAL_MATRICULA) ?? alunos[0];
  if (!aluno) {
    throw new Error("Nenhum aluno cadastrado. Rode o populate_db.py no backend.");
  }
  _alunoIdCache = aluno.id;
  return aluno.id;
}

// ----------------------------------------------------------------------------
// Tipagens
// ----------------------------------------------------------------------------
export interface CampoDinamico {
  id: string;
  label: string;
  tipo: string;
}

export interface ModeloDocumento {
  id: number;
  titulo: string;
  campos_dinamicos: CampoDinamico[] | string;
}

export type DocumentoStatus =
  | "GERADO"
  | "ENVIADO"
  | "APROVADO"
  | "REJEITADO"
  | "EM_REVISAO";

export interface SolicitacaoEstagio {
  id: number;
  aluno: number;
  data: string;
  status: string;
  motivo_retificacao: string | null;
  avaliador: number | null;
}

export interface Contrato {
  id: number;
  solicitacao: number;
  arquivo: string | null;
  dataEnvio: string;
  scoreConformidade: number;
  status: DocumentoStatus;
}

/** Solicitação ativa do aluno + o contrato (TCE) associado. */
export interface AplicacaoAtiva {
  solicitacao: SolicitacaoEstagio;
  contrato: Contrato;
}

// ----------------------------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------------------------
function comoLista<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray((data as { results?: T[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status} em ${path}`);
  return res.json();
}

// ----------------------------------------------------------------------------
// Modelos de documento
// ----------------------------------------------------------------------------
export async function getModelos(): Promise<ModeloDocumento[]> {
  return comoLista<ModeloDocumento>(await getJson("/api/modelos-documento/"));
}

/** Retorna o modelo de contrato (TCE) — único documento do fluxo do aluno. */
export async function getModeloContrato(): Promise<ModeloDocumento> {
  const modelos = await getModelos();
  const modelo =
    modelos.find((m) => m.titulo === MODELO_CONTRATO_TITULO) ??
    modelos.find((m) => m.titulo.toLowerCase().includes("contrato"));
  if (!modelo) {
    throw new Error(
      `Modelo "${MODELO_CONTRATO_TITULO}" não encontrado. Rode o populate_db.py no backend.`,
    );
  }
  return modelo;
}

/** Normaliza campos_dinamicos, que o Django pode devolver como string JSON. */
export function lerCampos(modelo: ModeloDocumento | null): CampoDinamico[] {
  if (!modelo?.campos_dinamicos) return [];
  if (Array.isArray(modelo.campos_dinamicos)) return modelo.campos_dinamicos;
  if (typeof modelo.campos_dinamicos === "string") {
    try {
      return JSON.parse(modelo.campos_dinamicos);
    } catch {
      return [];
    }
  }
  return [];
}

// ----------------------------------------------------------------------------
// Geração do TCE (preview e confirmação)
// ----------------------------------------------------------------------------
interface GerarDocumentoResposta {
  mensagem: string;
  documento_base64: string;
  documento_id?: number;
}

export async function gerarDocumento(params: {
  modeloId: number;
  solicitacaoId: number;
  dados: Record<string, string>;
  preview: boolean;
}): Promise<GerarDocumentoResposta> {
  const res = await fetch(`${API_BASE}/api/documentos/gerar/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelo_id: params.modeloId,
      solicitacao_id: params.solicitacaoId,
      dados: params.dados,
      preview: params.preview,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.erro || "Erro ao gerar o documento.");
  return result as GerarDocumentoResposta;
}

/** Dispara o download de um PDF recebido em base64. */
export function baixarPdfBase64(base64: string, nomeArquivo: string): void {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = nomeArquivo.endsWith(".pdf") ? nomeArquivo : `${nomeArquivo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------------------------------------------------------------
// Solicitação de estágio
// ----------------------------------------------------------------------------
export async function criarSolicitacao(): Promise<SolicitacaoEstagio> {
  const alunoId = await getAlunoAtualId();
  const res = await fetch(`${API_BASE}/api/solicitacoes-estagio/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aluno: alunoId }),
  });
  if (!res.ok) throw new Error("Não foi possível criar a solicitação de estágio.");
  return res.json();
}

/**
 * Retorna a aplicação ativa do aluno: a solicitação mais recente cujo contrato
 * (TCE) ainda está em andamento no fluxo do aluno (GERADO ou ENVIADO).
 * Documentos já APROVADOS pertencem ao fluxo do coordenador (fora de escopo).
 */
export async function getAplicacaoAtiva(): Promise<AplicacaoAtiva | null> {
  const [alunoId, solicitacoes, contratos] = await Promise.all([
    getAlunoAtualId(),
    getJson("/api/solicitacoes-estagio/").then(comoLista<SolicitacaoEstagio>),
    getJson("/api/contratos/").then(comoLista<Contrato>),
  ]);

  const idsDoAluno = new Set(
    solicitacoes.filter((s) => s.aluno === alunoId).map((s) => s.id),
  );

  const contratoAtivo = contratos
    .filter(
      (c) =>
        idsDoAluno.has(c.solicitacao) &&
        (c.status === "GERADO" || c.status === "ENVIADO"),
    )
    .sort((a, b) => b.id - a.id)[0];

  if (!contratoAtivo) return null;

  const solicitacao = solicitacoes.find((s) => s.id === contratoAtivo.solicitacao);
  if (!solicitacao) return null;

  return { solicitacao, contrato: contratoAtivo };
}

// ----------------------------------------------------------------------------
// Envio dos documentos assinados (passo do card)
// ----------------------------------------------------------------------------
/** Substitui o arquivo do contrato pelo PDF assinado e marca como ENVIADO. */
export async function enviarContratoAssinado(
  contratoId: number,
  arquivo: File,
): Promise<Contrato> {
  const form = new FormData();
  form.append("arquivo", arquivo);
  form.append("status", "ENVIADO");

  const res = await fetch(`${API_BASE}/api/contratos/${contratoId}/`, {
    method: "PATCH",
    body: form,
  });
  if (!res.ok) throw new Error("Falha ao enviar o contrato assinado.");
  return res.json();
}

/** Cria a apólice de seguro assinada vinculada à solicitação. */
export async function enviarApolice(
  solicitacaoId: number,
  arquivo: File,
): Promise<unknown> {
  const form = new FormData();
  form.append("solicitacao", String(solicitacaoId));
  form.append("arquivo", arquivo);
  form.append("status", "ENVIADO");

  const res = await fetch(`${API_BASE}/api/apolices/`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Falha ao enviar a apólice de seguro.");
  return res.json();
}
