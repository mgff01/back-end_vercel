---
id: diagrama_de_sequencia
title: Diagrama de Sequência
---

# Diagrama de Sequência

## Introdução

O diagrama de sequência descreve, ao longo do tempo, a troca de mensagens entre os atores e os componentes do sistema durante o fluxo principal de uma solicitação de estágio: a geração do documento pelo aluno, o envio do documento assinado, a revisão e assinatura pelo coordenador e a conclusão pelo aluno.

---

## Fluxo Principal — Solicitação de Estágio

```plantuml
@startuml
actor Aluno
participant "Frontend" as FE
participant "API (Django)" as API
actor Coordenador

== Geração do documento ==
Aluno -> FE : Abre solicitação (TCE) e preenche o formulário
FE -> API : Cria SolicitacaoEstagio
FE -> API : Gera documento (modelo + dados do formulário)
API -> API : Preenche o modelo e converte para PDF
API --> FE : PDF gerado (status GERADO)
FE --> Aluno : Baixa o PDF para assinatura

== Envio do documento assinado ==
Aluno -> FE : Envia TCE + apólice assinados
FE -> API : Atualiza documentos (arquivo, status ENVIADO)
API --> FE : Confirmação
FE --> Aluno : "Aguardando assinatura da instituição"

== Revisão e assinatura institucional ==
Coordenador -> FE : Abre solicitação pendente
FE -> API : Consulta documentos
API --> FE : PDF para visualização
Coordenador -> FE : Baixa para assinar
FE -> API : Atualiza status EM_ASSINATURA
Coordenador -> FE : Envia documento assinado pela instituição
FE -> API : Atualiza arquivo + status APROVADO
API --> FE : Confirmação

== Conclusão ==
Aluno -> FE : Confirma a conclusão
FE -> API : Atualiza status CONCLUIDA
API --> FE : Confirmação
FE --> Aluno : Processo concluído

note over Coordenador, API
  Caso o documento não esteja assinado, o coordenador
  pode rejeitar a solicitação informando o motivo
  (status REJEITADO), e o aluno reenvia o documento.
end note
@enduml
```

---

## Conclusão

O diagrama de sequência evidencia a ordem das interações e a responsabilidade de cada participante no fluxo, servindo de apoio para a implementação e a validação do comportamento do sistema.

---

## Autor(es)

| Data     | Versão | Descrição            | Autor(es)                                                                                              |
| -------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| 11/06/26 | 1.0    | Substituição do conteúdo de exemplo pelo diagrama de sequência do fluxo de estágio implementado | Equipe |
