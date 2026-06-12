---
id: Requisitos
title: Requisitos
---

# Levantamento de Requisitos e Caso de Uso

**Sistema:** Sistema de Validação de Estágios

---

## 1. Identificação dos Stakeholders

* **Alunos:** Estudantes universitários que geram, baixam, assinam e enviam os documentos de estágio (TCE/contrato, apólice e relatório final) e acompanham o status de suas solicitações.
* **Coordenadores (e Setor de Estágios):** Responsáveis por visualizar o painel de solicitações pendentes, revisar os documentos enviados, aprovar (assinar pela instituição) ou rejeitar com um motivo, e acompanhar indicadores gerais dos estágios.
* **Empresas Concedentes:** Organizações que empregam os estagiários e que assinam os documentos junto ao aluno (de forma externa ao sistema, antes do envio).

---

## 2. Requisitos Funcionais

| ID | Descrição | Prioridade |
| :--- | :--- | :--- |
| RF01 | O sistema deve gerar o documento de estágio (TCE ou Relatório Final) em PDF a partir de um formulário dinâmico baseado em um modelo, para o aluno baixar, assinar e enviar. | Alta |
| RF02 | O aluno deve poder enviar (upload) os documentos já assinados — o TCE acompanhado da apólice de seguro, ou o Relatório Final. | Alta |
| RF03 | O sistema deve listar as solicitações pendentes de análise em um dashboard para o coordenador. | Alta |
| RF04 | O coordenador deve poder aprovar (assinar pela instituição) ou rejeitar a solicitação, informando o motivo da rejeição ao aluno. | Alta |
| RF05 | O coordenador deve poder visualizar o PDF enviado, baixá-lo para assinatura e reenviar o documento assinado pela instituição. | Alta |
| RF06 | O sistema deve centralizar e disponibilizar os modelos de documentos institucionais padronizados para download. | Média |
| RF07 | O aluno deve poder acompanhar o status da solicitação ao longo do fluxo, até a sua conclusão. | Média |
| RF08 | O sistema deve oferecer ao coordenador um dashboard de análise com indicadores e gráficos sobre os estágios (carga horária média, bolsa média, empresas e distribuição por status). | Média |
| RF09 | O sistema deve autenticar o acesso por e-mail institucional, distinguindo os perfis de Aluno e Coordenador. | Alta |

---

## 3. Requisitos Não Funcionais

* **Performance:** A geração do PDF do documento a partir do formulário preenchido deve ocorrer em poucos segundos após a confirmação pelo aluno.
* **Segurança:** O acesso ao sistema deve ser restrito a usuários autenticados via login institucional, garantindo a proteção e a privacidade dos dados pessoais e acadêmicos transitados nos contratos.
* **Usabilidade:** A interface deve seguir princípios de design limpo e acessível, sendo plenamente responsiva para acesso via computadores e dispositivos móveis, facilitando a visualização de PDFs integrados.
* **Confiabilidade:** O sistema deve manter o registro do histórico de status dos documentos ao longo do fluxo de aprovação, preservando os arquivos enviados.
* **Disponibilidade:** O sistema deve estar operacional e escalável para suportar picos de acesso, especialmente durante os finais de semestre acadêmico, quando o volume de envio de relatórios é consideravelmente maior.

## Autor(es)

| Data     | Versão | Descrição            | Autor(es)                                                                                              |
| -------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| 01/04/26 | 1.0 | Criação do documento | Bruno Norton, Christian Werneck, Gianluca Leonardi, Marcos Paulo Assunção, Maurício Gomes, Micael Dali |
| 11/06/26 | 1.1 | Atualização dos requisitos para refletir o escopo implementado (envio com assinatura externa, dashboard de análise; remoção de parecer técnico e assinatura digital interna) | Equipe |