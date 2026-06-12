---
id: diagrama_de_classes
title: Diagrama de Classes
---

# Diagrama de Classes

## Introdução

O diagrama de classes é o diagrama UML mais usado principalmente por servir como uma ponte entre os requisitos do sistema e a implementanção em código, devido à sua estrutura similar à usada nas principais linguagens de programação com suporte a Orientação a Objeto, como Python e Java.

Além disso, o diagrama de classes funciona como uma representação visual geral de como o código do sistema vai ser implementado, como veremos no diagrama a seguir.

---

## Mapeamento das Classes do Sistema

```plantuml
@startuml

abstract class Usuario {
	+ nome: String
	+ email: String
}

class Aluno extends Usuario {
	+ matricula: String
	+ anexarDocumentoGerado(solicitacao, classeDocumento, arquivo, dados): DocumentoPreenchido
}

class Coordenador extends Usuario {
	+ aprovar(solicitacao: SolicitacaoEstagio): void
	+ rejeitar(solicitacao: SolicitacaoEstagio): void
	+ solicitarRetificacao(solicitacao: SolicitacaoEstagio, motivo: String): void
}

class SolicitacaoEstagio {
	+ id: int
	+ data: Date
	+ status: String
	+ motivoRetificacao: String
}

abstract class DocumentoPreenchido {
	+ id: int
	+ arquivo: String
	+ dataEnvio: Date
	+ scoreConformidade: float
	+ status: String
	+ dados: Map
	+ realizarTriagemAutomatica(): void
}

class Contrato extends DocumentoPreenchido {
	+ motivoRejeicao: String
}

class Apolice extends DocumentoPreenchido {}

class Relatorio extends DocumentoPreenchido {
	+ conceitoFinal: String
	+ motivoRejeicao: String
}

class ModeloDocumento {
	+ titulo: String
	+ arquivoUrl: String
	+ camposDinamicos: List
	+ baixarModelo(): File
}

note right of DocumentoPreenchido
  status segue o ciclo:
  GERADO -> ENVIADO -> EM_ASSINATURA
  -> APROVADO -> CONCLUIDA
  (ramo de rejeicao: REJEITADO)
end note

Aluno "1" -- "*" SolicitacaoEstagio : cria >
Coordenador "1" -- "*" SolicitacaoEstagio : avalia >
SolicitacaoEstagio "1" *-- "1..*" DocumentoPreenchido : contem >
ModeloDocumento "1" -- "*" DocumentoPreenchido : gera >

@enduml
```

---

## Conclusão

Com o Diagrama de Classes pronto, a implementação dos modelos elaborados para descrever o funcionamento do sistema em código será muito mais fluida e direta, mantendo a estrtura de Orientação a Objetos e apenas traduzindo os detalhes de implementação para cada linguagem de programação.

---

## Autor(es)

| Data     | Versão | Descrição            | Autor(es)                                                                                              |
| -------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| 01/04/26 | 1.0    | Criação do documento | Bruno Norton, Christian Werneck, Gianluca Leonardi, Marcos Paulo Assunção, Maurício Gomes, Micael Dali |
| 11/06/26 | 1.1    | Atualização para refletir o escopo implementado (remoção de Professor, Parecer Técnico, Assinatura Digital e Notificação) | Equipe |
