// Autenticação (login só no frontend): valida as credenciais no backend, recebe
// um JWT e guarda o usuário/token no localStorage como porta de entrada do app.
import { API_BASE } from "./api";

export type Papel = "aluno" | "coordenador" | null;

export interface Usuario {
  nome: string;
  email: string;
  papel: Papel;
}

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh";
const USER_KEY = "auth_user";

/** Autentica por e-mail + senha. Em sucesso, persiste token e usuário. */
export async function login(email: string, senha: string): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || "Não foi possível entrar.");

  const usuario: Usuario = { nome: data.nome, email: data.email, papel: data.papel };
  window.localStorage.setItem(TOKEN_KEY, data.access);
  window.localStorage.setItem(REFRESH_KEY, data.refresh);
  window.localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  return usuario;
}

export function logout(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}

/** Usuário logado (lido do localStorage) ou null. */
export function getUsuario(): Usuario | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Iniciais para o avatar do header (até 2 letras). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
