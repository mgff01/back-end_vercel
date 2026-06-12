// Camada central de acesso à API Django do sistema de estágios.
// Concentra a base URL, o aluno de teste (enquanto não há autenticação) e os
// helpers usados pelos fluxos do aluno e do coordenador. Os documentos do fluxo
// (TCE/Contrato e Relatório Final) são tratados de forma genérica por "tipo".

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ??
  "https://back-end-vercel-mgff01s-projects.vercel.app/admin/";

// Sem autenticação ainda: identificamos o aluno atual pela matrícula (João Silva,
// criado pelo populate_db.py). Resolvemos o id em runtime porque o reseed do banco
// muda os ids do autoincremento — fixar um número quebra após cada reseed.
// Trocar por dados do login quando a autenticação for implementada.
export const ALUNO_ATUAL_MATRICULA = "2021001";

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
// Tipos de documento do fluxo
// ----------------------------------------------------------------------------
export type TipoDocumento = "contrato" | "relatorio";

interface TipoConfig {
  endpoint: string; // segmento da API REST
  modeloTitulo: string; // título do ModeloDocumento correspondente
  label: string; // rótulo curto
  labelLongo: string; // rótulo descritivo
  temApolice: boolean; // exige envio de apólice junto
}

export const TIPOS: Record<TipoDocumento, TipoConfig> = {
  contrato: {
    endpoint: "contratos",
    modeloTitulo: "Modelo de Contrato",
    label: "TCE",
    labelLongo: "Termo de Compromisso de Estágio (TCE)",
    temApolice: true,
  },
  relatorio: {
    endpoint: "relatorios",
    modeloTitulo: "Relatório Final de Estágio",
    label: "Relatório Final",
    labelLongo: "Relatório Final de Estágio",
    temApolice: false,
  },
};

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
  arquivoUrl: string | null;
  campos_dinamicos: CampoDinamico[] | string;
}

export type DocumentoStatus =
  | "GERADO"
  | "ENVIADO"
  | "EM_ASSINATURA"
  | "APROVADO"
  | "REJEITADO"
  | "CONCLUIDA"
  | "EM_REVISAO";

export interface SolicitacaoEstagio {
  id: number;
  aluno: number;
  data: string;
  status: string;
  motivo_retificacao: string | null;
  avaliador: number | null;
}

/** Documento do fluxo (Contrato/TCE ou Relatório Final). */
export interface Documento {
  id: number;
  solicitacao: number;
  arquivo: string | null;
  dataEnvio: string;
  scoreConformidade: number;
  status: DocumentoStatus;
  motivo_rejeicao: string | null;
  dados?: Record<string, string>;
}

export interface Apolice {
  id: number;
  solicitacao: number;
  arquivo: string | null;
  dataEnvio: string;
  scoreConformidade: number;
  status: DocumentoStatus;
}

/** Solicitação ativa do aluno + o documento principal associado. */
export interface AplicacaoAtiva {
  tipo: TipoDocumento;
  solicitacao: SolicitacaoEstagio;
  documento: Documento;
  apolice: Apolice | null; // só para o tipo contrato
}

/** Item da caixa de entrada do coordenador. */
export interface CoordenadorItem {
  tipo: TipoDocumento;
  documento: Documento;
  apolice: Apolice | null; // só para o tipo contrato
  solicitacao: SolicitacaoEstagio;
  alunoNome: string;
}

// Status que o aluno ainda acompanha no painel (CONCLUIDA encerra o fluxo).
const STATUS_ATIVOS_ALUNO: DocumentoStatus[] = [
  "GERADO",
  "ENVIADO",
  "EM_ASSINATURA",
  "REJEITADO",
  "APROVADO",
];

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

/** Retorna o modelo correspondente ao tipo do fluxo (contrato ou relatório). */
export async function getModeloPorTipo(tipo: TipoDocumento): Promise<ModeloDocumento> {
  const { modeloTitulo } = TIPOS[tipo];
  const modelos = await getModelos();
  const modelo =
    modelos.find((m) => m.titulo === modeloTitulo) ??
    modelos.find((m) => m.titulo.toLowerCase().includes(tipo === "relatorio" ? "relat" : "contrato"));
  if (!modelo) {
    throw new Error(`Modelo "${modeloTitulo}" não encontrado. Rode o populate_db.py no backend.`);
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
// Geração do documento (preview e confirmação)
// ----------------------------------------------------------------------------
interface GerarDocumentoResposta {
  mensagem: string;
  documento_base64: string;
  documento_id?: number;
}

export async function gerarDocumento(params: {
  tipo: TipoDocumento;
  modeloId: number;
  solicitacaoId: number;
  dados: Record<string, string>;
  preview: boolean;
}): Promise<GerarDocumentoResposta> {
  const res = await fetch(`${API_BASE}/api/documentos/gerar/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: params.tipo,
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

// Junta documentos de todos os tipos numa lista anotada com o tipo.
async function getDocumentosPorTipo(): Promise<{ tipo: TipoDocumento; doc: Documento }[]> {
  const [contratos, relatorios] = await Promise.all([
    getJson(`/api/${TIPOS.contrato.endpoint}/`).then(comoLista<Documento>),
    getJson(`/api/${TIPOS.relatorio.endpoint}/`).then(comoLista<Documento>),
  ]);
  return [
    ...contratos.map((doc) => ({ tipo: "contrato" as TipoDocumento, doc })),
    ...relatorios.map((doc) => ({ tipo: "relatorio" as TipoDocumento, doc })),
  ];
}

async function getApolicePorSolicitacao(): Promise<Map<number, Apolice>> {
  const apolices = await getJson("/api/apolices/").then(comoLista<Apolice>);
  const mapa = new Map<number, Apolice>();
  for (const ap of [...apolices].sort((a, b) => a.id - b.id)) mapa.set(ap.solicitacao, ap);
  return mapa;
}

/**
 * Retorna a aplicação ativa do aluno: a solicitação mais recente (de qualquer
 * tipo) cujo documento ainda está em andamento (qualquer status, exceto
 * CONCLUIDA, que encerra a solicitação e devolve o painel ao estado vazio).
 * Por regra de negócio o aluno tem no máximo uma solicitação ativa por vez.
 */
export async function getAplicacaoAtiva(): Promise<AplicacaoAtiva | null> {
  const [alunoId, solicitacoes, documentos, apolices] = await Promise.all([
    getAlunoAtualId(),
    getJson("/api/solicitacoes-estagio/").then(comoLista<SolicitacaoEstagio>),
    getDocumentosPorTipo(),
    getApolicePorSolicitacao(),
  ]);

  const solPorId = new Map(solicitacoes.map((s) => [s.id, s]));
  const idsDoAluno = new Set(
    solicitacoes.filter((s) => s.aluno === alunoId).map((s) => s.id),
  );

  const ativo = documentos
    .filter(
      ({ doc }) =>
        idsDoAluno.has(doc.solicitacao) && STATUS_ATIVOS_ALUNO.includes(doc.status),
    )
    .sort((a, b) => b.doc.dataEnvio.localeCompare(a.doc.dataEnvio))[0];

  if (!ativo) return null;

  const solicitacao = solPorId.get(ativo.doc.solicitacao);
  if (!solicitacao) return null;

  return {
    tipo: ativo.tipo,
    solicitacao,
    documento: ativo.doc,
    apolice: ativo.tipo === "contrato" ? apolices.get(ativo.doc.solicitacao) ?? null : null,
  };
}

/**
 * Caixa de entrada do coordenador: solicitações (de qualquer tipo) cujo documento
 * foi enviado pelo aluno (ENVIADO) ou já baixado para assinar (EM_ASSINATURA).
 * Protótipo: vê tudo, sem filtro por curso.
 */
export async function getItensCoordenador(): Promise<CoordenadorItem[]> {
  const [alunos, solicitacoes, documentos, apolices] = await Promise.all([
    getJson("/api/alunos/").then(
      comoLista<{ id: number; nome: string; matricula: string }>,
    ),
    getJson("/api/solicitacoes-estagio/").then(comoLista<SolicitacaoEstagio>),
    getDocumentosPorTipo(),
    getApolicePorSolicitacao(),
  ]);

  const nomePorAluno = new Map(alunos.map((a) => [a.id, a.nome || a.matricula]));
  const solPorId = new Map(solicitacoes.map((s) => [s.id, s]));

  return documentos
    .filter(({ doc }) => doc.status === "ENVIADO" || doc.status === "EM_ASSINATURA")
    .sort((a, b) => b.doc.dataEnvio.localeCompare(a.doc.dataEnvio))
    .map(({ tipo, doc }) => {
      const solicitacao = solPorId.get(doc.solicitacao);
      if (!solicitacao) return null;
      return {
        tipo,
        documento: doc,
        apolice: tipo === "contrato" ? apolices.get(doc.solicitacao) ?? null : null,
        solicitacao,
        alunoNome: nomePorAluno.get(solicitacao.aluno) ?? "Aluno",
      };
    })
    .filter((x): x is CoordenadorItem => x !== null);
}

/**
 * Dados brutos para o dashboard de análise do coordenador: todos os contratos
 * (TCE, que carregam os atributos numéricos em `dados`), as solicitações e o
 * total de alunos. A agregação é feita no componente.
 */
export async function getAnaliseCoordenador(): Promise<{
  contratos: Documento[];
  solicitacoes: SolicitacaoEstagio[];
  totalAlunos: number;
}> {
  const [contratos, solicitacoes, alunos] = await Promise.all([
    getJson(`/api/${TIPOS.contrato.endpoint}/`).then(comoLista<Documento>),
    getJson("/api/solicitacoes-estagio/").then(comoLista<SolicitacaoEstagio>),
    getJson("/api/alunos/").then(comoLista<{ id: number }>),
  ]);
  return { contratos, solicitacoes, totalAlunos: alunos.length };
}

// ----------------------------------------------------------------------------
// URLs de arquivo / visualização de PDF
// ----------------------------------------------------------------------------
/** Garante uma URL absoluta para o arquivo (o Django pode devolver relativa). */
export function arquivoUrl(arquivo: string | null): string | null {
  if (!arquivo) return null;
  return arquivo.startsWith("http") ? arquivo : `${API_BASE}${arquivo}`;
}

/**
 * Baixa o PDF como blob e devolve uma object URL local. Evita o
 * `X-Frame-Options: DENY` do Django ao exibir num <iframe>. Lembre de revogar
 * a URL (URL.revokeObjectURL) quando não precisar mais.
 */
export async function getPdfBlobUrl(arquivo: string): Promise<string> {
  const url = arquivoUrl(arquivo);
  if (!url) throw new Error("Documento sem arquivo.");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Não foi possível carregar o PDF.");
  return URL.createObjectURL(await res.blob());
}

/** Baixa um arquivo do backend (via blob, para forçar download cross-origin). */
export async function baixarArquivo(arquivo: string, nome: string): Promise<void> {
  const url = await getPdfBlobUrl(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome.endsWith(".pdf") ? nome : `${nome}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// Transições de status do documento (PATCH genérico por tipo)
// ----------------------------------------------------------------------------
async function patchDocumentoJson(
  tipo: TipoDocumento,
  id: number,
  fields: Record<string, string>,
): Promise<Documento> {
  const res = await fetch(`${API_BASE}/api/${TIPOS[tipo].endpoint}/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Falha ao atualizar o documento.");
  return res.json();
}

async function patchDocumentoArquivo(
  tipo: TipoDocumento,
  id: number,
  arquivo: File,
  fields: Record<string, string>,
): Promise<Documento> {
  const form = new FormData();
  form.append("arquivo", arquivo);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);

  const res = await fetch(`${API_BASE}/api/${TIPOS[tipo].endpoint}/${id}/`, {
    method: "PATCH",
    body: form,
  });
  if (!res.ok) throw new Error("Falha ao enviar o documento.");
  return res.json();
}

/** Aluno envia (ou reenvia) o documento assinado → ENVIADO (limpa rejeição anterior). */
export function enviarDocumentoAssinado(tipo: TipoDocumento, id: number, arquivo: File) {
  return patchDocumentoArquivo(tipo, id, arquivo, { status: "ENVIADO", motivo_rejeicao: "" });
}

/** Coordenador baixou o documento para assinar → EM_ASSINATURA. */
export function marcarEmAssinatura(tipo: TipoDocumento, id: number) {
  return patchDocumentoJson(tipo, id, { status: "EM_ASSINATURA" });
}

/** Coordenador rejeita o documento (ex.: não assinado) → REJEITADO + motivo. */
export function rejeitarDocumento(tipo: TipoDocumento, id: number, motivo: string) {
  return patchDocumentoJson(tipo, id, { status: "REJEITADO", motivo_rejeicao: motivo });
}

/** Coordenador envia o documento assinado por ele → APROVADO (finaliza a análise). */
export function finalizarDocumento(tipo: TipoDocumento, id: number, arquivo: File) {
  return patchDocumentoArquivo(tipo, id, arquivo, { status: "APROVADO" });
}

/** Aluno confirma o sucesso ao final → CONCLUIDA (encerra o fluxo). */
export function concluirDocumento(tipo: TipoDocumento, id: number) {
  return patchDocumentoJson(tipo, id, { status: "CONCLUIDA" });
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
