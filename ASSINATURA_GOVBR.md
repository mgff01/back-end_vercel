# 🔐 Integração de Assinatura Digital Gov.BR

Este documento explica como configurar e usar a integração com a **API de Assinatura Eletrônica do Gov.BR** no seu projeto de estágios.

## 📋 Pré-requisitos

1. **Conta Gov.BR** (Nível Prata ou Ouro) para cada usuário que deseja assinar
2. **Órgão/Instituição Registrado** no programa de integração gov.br
3. **CLIENT_ID e CLIENT_SECRET** obtidos através do formulário de integração

## 🔧 Configuração

### 1. Registrar Sua Instituição

Acesse: https://www.gov.br/governodigital/pt-br/estrategias-e-governanca-digital/transformacao-digital/servico-de-integracao-aos-produtos-de-identidade-digital-gov.br

E preencha o formulário de solicitação de integração.

**Você receberá por email:**

- `CLIENT_ID`
- `CLIENT_SECRET`
- Instruções de integração

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

```bash
# Copia template
cp .env.example .env.local

# Edita .env.local com seus dados
GOVBR_CLIENT_ID=seu-client-id
GOVBR_CLIENT_SECRET=seu-client-secret
GOVBR_REDIRECT_URI=http://seu-dominio.com/api/govbr-callback/
```

### 3. Instalar Dependências

As bibliotecas necessárias já estão em `requirements.txt`:

- `requests` - Para chamadas HTTP à API gov.br
- `pyHanko` - Para validação de assinaturas PDF

```bash
pip install -r requirements.txt
```

## 🔄 Fluxo de Assinatura

```
┌─────────────────┐
│     Aluno       │
│  (No Navegador) │
└────────┬────────┘
         │ 1. Clica "Assinar com Gov.BR"
         │
         ▼
┌─────────────────────┐
│   Backend Django    │
│  (seu servidor)     │
│  POST /documentos/  │
│    assinar-govbr/   │
└────────┬────────────┘
         │ 2. Gera URL de assinatura
         │
         ▼
┌─────────────────────┐
│   Gov.BR Portal     │
│  (assinador.iti.br) │
│                     │
│  - Login CPF        │
│  - Assina doc       │
│  - Retorna PDF      │
└────────┬────────────┘
         │ 3. POST /govbr-callback/
         │
         ▼
┌─────────────────────┐
│   Backend Django    │
│   (webhook)         │
│                     │
│  - Recebe PDF       │
│  - Valida assinatura│
│  - Salva arquivo    │
│  - Atualiza status  │
└─────────────────────┘
```

## 📝 Como Usar no Frontend (Next.js)

### Importar Função de Assinatura

```typescript
import { redirecionarAssinatura } from "@/lib/govbr_assinatura";
```

### Criar Botão de Assinatura

```typescript
import { redirecionarAssinatura } from "@/lib/govbr_assinatura";
import { Edit3, Loader2 } from "lucide-react";

export function BotaoAssinarComGovBr({
  documentoId,
  tipo,
}: {
  documentoId: number;
  tipo: "contrato" | "relatorio";
}) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleAssinar = async () => {
    setCarregando(true);
    setErro("");

    try {
      // Inicia assinatura e redireciona para gov.br
      await redirecionarAssinatura(documentoId, tipo);
      // User será redirecionado para gov.br, depois volta
    } catch (e) {
      setErro((e as Error).message);
      setCarregando(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAssinar}
        disabled={carregando}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {carregando ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Redirecionando para Gov.BR...
          </>
        ) : (
          <>
            <Edit3 size={18} />
            Assinar com Gov.BR
          </>
        )}
      </button>

      {erro && (
        <div className="text-red-600 text-sm mt-2">
          Erro: {erro}
        </div>
      )}
    </div>
  );
}
```

### Integrar no Dashboard

```typescript
import { ApplicationCard } from "./ApplicationCard";
import { BotaoAssinarComGovBr } from "./BotaoAssinarComGovBr";

export function StatusDocumento({
  documento,
}: {
  documento: {
    id: number;
    status: string;
    tipo: "contrato" | "relatorio";
  };
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3>Status: {documento.status}</h3>

      {documento.status === "GERADO" && (
        <BotaoAssinarComGovBr
          documentoId={documento.id}
          tipo={documento.tipo}
        />
      )}

      {documento.status === "EM_ASSINATURA" && (
        <p className="text-yellow-600">
          ⏳ Aguardando assinatura no portal Gov.BR...
        </p>
      )}

      {documento.status === "ENVIADO" && (
        <p className="text-green-600">✓ Documento assinado com sucesso!</p>
      )}

      {documento.status === "REJEITADO" && (
        <p className="text-red-600">✗ Assinatura cancelada</p>
      )}
    </div>
  );
}
```

## 🔌 Endpoints da API

### POST /api/documentos/assinar-govbr/

**Inicia assinatura e retorna URL para gov.br**

```javascript
// Request
{
  "documento_id": 123,
  "tipo": "contrato"  // ou "relatorio"
}

// Response (200)
{
  "mensagem": "Redirecionando para gov.br...",
  "url_assinatura": "https://acesso.gov.br/authorize?...",
  "documento_id": 123
}

// Error (400/403/500)
{
  "erro": "Descrição do erro"
}
```

### POST /api/govbr-callback/

**Webhook que recebe o documento assinado (chamado por gov.br, não pelo frontend)**

```javascript
// Request (de gov.br)
{
  "id": "uuid-da-assinatura",
  "status": "ASSINADO",  // ou "CANCELADO"
  "conteudo": "JVBERi0xLjQK...",  // PDF em base64
  "state": "contrato_123_2021001"  // informação rastreamento
}

// Response (201)
{
  "mensagem": "Documento assinado e salvo com sucesso!",
  "documento_id": 123
}
```

## 🔐 Segurança

### Checklist de Implementação

- ✅ Validação de propriedade: Aluno só pode assinar seus próprios docs
- ✅ Validação de estado: Documento deve estar "GERADO" antes de assinar
- ✅ Token JWT obrigatório no endpoint de assinatura
- ✅ Webhook sem auth (gov.br não envia token, mas valida dados)
- ✅ Logging de eventos de assinatura
- ✅ Tratamento de cancelamentos

### Validação de Assinatura

A validação está implementada em `GovBRAssinador.validar_assinatura()`, que:

1. Verifica se arquivo existe e não está vazio
2. Registra assinatura no log
3. Para validação completa, use: https://validar.iti.gov.br/

## 🧪 Testar Localmente

### 1. Usar Variáveis de Teste (Sandbox)

Gov.BR oferece ambiente de testes:

```bash
GOVBR_API_ENDPOINT=https://api-assinatura-homologacao.servicos.gov.br
```

### 2. Simular Webhook Localmente

Use `curl` para simular retorno de gov.br:

```bash
curl -X POST http://127.0.0.1:8000/api/govbr-callback/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-teste",
    "status": "ASSINADO",
    "conteudo": "JVBERi0xLjQK...",
    "state": "contrato_1_2021001"
  }'
```

### 3. Verificar Status

```bash
curl http://127.0.0.1:8000/api/documentos/123/ \
  -H "Authorization: Bearer seu-token-jwt"
```

## 📚 Documentação Oficial

- **Manual de Integração**: https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt_BR/latest/
- **OAuth Gov.BR**: https://manual-roteiro-integracao-login-unico.servicos.gov.br/pt/stable/iniciarintegracao.html
- **Validador de Assinatura**: https://validar.iti.gov.br/
- **Portal de Assinatura**: http://assinador.iti.br/

## ⚠️ Troubleshooting

### "Erro: CLIENT_ID não configurado"

Verifique se você preencheu `.env.local`:

```bash
echo $GOVBR_CLIENT_ID
```

Se vazio, configure e reinicie o servidor Django.

### "Erro 403 ao chamar API gov.br"

Verifique:

1. CLIENT_SECRET está correto?
2. Você está em homologação ou produção?
3. Horário do servidor sincronizado (gov.br usa timestamp)?

### "Documento não encontrado no webhook"

O `state` enviado por gov.br não corresponde ao documento. Verifique se o formato está certo: `{tipo}_{id}_{matricula}`

### "Assinatura cancelada"

User cancelou a assinatura no portal gov.br. Status muda para "REJEITADO". Aluno pode tentar novamente.

## 🔄 Próximos Passos (Opcional)

1. **Integração com Login Único**: Fazer login no app usando conta gov.br
2. **Validação de Certificado**: Verificar validade do certificado digital
3. **Assinatura de Múltiplos Documentos**: Um único fluxo assinando TCE + Relatório
4. **Integração com Sistema de Protocolo**: Protocolar documentos assinados automaticamente

## 📞 Suporte

Para dúvidas sobre integração gov.br:

**Email**: integracaoid@gestao.gov.br  
**Portal**: https://www.gov.br/governodigital/pt-br/identidade/identidade-digital-para-gestores-publicos

---

**Desenvolvido com ❤️ usando PyHanko + Gov.BR**
