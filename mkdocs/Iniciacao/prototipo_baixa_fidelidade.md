---
id: prototipobaixa
title: Protótipo de Baixa Fidelidade
---

## Introdução

<p align = "justify">
A construção do protótipo de baixa fidelidade auxilia a equipe de desenvolvimento a encontrar um nível inicial de detalhes, extrair funcionalidades, testar a usabilidade e fornecer uma base para o gerenciamento do projeto, permitindo estimar o esforço necessário em cada funcionalidade antes da implementação.
</p>

## Metodologia

<p align = "justify">
A partir dos levantamentos iniciais da equipe, os wireframes de baixa fidelidade foram produzidos com a ferramenta PlantUML Salt, descrevendo as telas e o fluxo principal da aplicação. Esses esboços serviram de base para o protótipo de alta fidelidade e para a interface final.
</p>

## Protótipo de baixa fidelidade

<p align = "justify">
Este protótipo descreve a experiência básica da aplicação "Sistema de Validação de Estágios" para os dois perfis identificados: aluno e coordenador. O foco está em validar o login, a abertura de solicitação (geração do documento), o envio dos documentos assinados, o acompanhamento de status, a revisão e assinatura pelo coordenador e a visão geral dos estágios.
</p>

### Telas necessárias

- **Login institucional**: acesso por e-mail @ibmec, com direcionamento automático ao painel do perfil (Aluno ou Coordenador).
- **Dashboard do Aluno**: card da solicitação ativa com seu status, além dos botões de nova solicitação e download de modelos.
- **Nova Solicitação**: escolha do tipo de documento (TCE/Apólice ou Relatório Final) e formulário dinâmico para gerar o PDF.
- **Envio de Documentos**: upload dos documentos já assinados (no TCE, contrato e apólice).
- **Painel do Coordenador**: lista de solicitações pendentes de análise.
- **Revisão do Documento**: visualizador de PDF com as ações de baixar para assinar, enviar assinado ou rejeitar (com motivo).
- **Dashboard de Análise**: indicadores e gráficos gerais sobre os estágios.

### PlantUML Salt - Login institucional

```plantuml
@startsalt
title Login - Sistema de Validação de Estágios

{
  **IBMEC | Sistema de Validação de Estágio**
  --
  "E-mail institucional"
  "Senha"
  [Entrar]
}
@endsalt
```

### PlantUML Salt - Dashboard do Aluno

```plantuml
@startsalt
title Dashboard do Aluno

{
  {+
    Olá, Aluno!
    --
    [**Nova Solicitação de Estágio**]
    [Baixar Modelos]
  }
  --
  **Sua Solicitação**
  --
  {+
    **Solicitação #001 - TCE**
    {-
      **Status:** Enviado
      Documento enviado com sucesso.
      Aguardando assinatura da instituição.
    }
  }
}
@endsalt
```

### PlantUML Salt - Nova Solicitação (escolha do tipo)

```plantuml
@startsalt
title Nova Solicitação - Escolha do tipo

{
  **Qual solicitação deseja iniciar?**
  --
  {+
    [**TCE / Apólice de Seguro**]
    Para quem vai começar um estágio.
  }
  --
  {+
    [**Relatório Final**]
    Para quem concluiu o estágio.
  }
}
@endsalt
```

### PlantUML Salt - Formulário de Nova Solicitação (TCE)

```plantuml
@startsalt
title Nova Solicitação - Formulário (TCE)

{
  "Nome da Empresa"
  "CNPJ da Empresa"
  "Curso"
  "Carga Horária Semanal"
  "Valor da Bolsa (R$)"
  "Data de Início"
  "Data de Término"
  --
  [Baixar Preview]
  [Confirmar e Baixar]
}
@endsalt
```

### PlantUML Salt - Envio de Documentos Assinados

```plantuml
@startsalt
title Enviar Documentos Assinados - Aluno

{
  Envie somente após assinado por aluno e empresa.
  --
  **TCE assinado (PDF)**
  [Selecionar arquivo]
  --
  **Apólice de seguro (PDF)**
  [Selecionar arquivo]
  --
  [Enviar Documentos]
}
@endsalt
```

### PlantUML Salt - Painel do Coordenador

```plantuml
@startsalt
title Painel do Coordenador - Solicitações Pendentes

{
  {+
  **Solicitações para análise**
  --
    {+
      {-
      Solicitacao #123 | Ana Silva | TCE | Visualizar
      Solicitacao #124 | Pedro Souza | Relatorio Final | Visualizar
      }
    }
    --
    **Pendentes:** 2
  }
}
@endsalt
```

### PlantUML Salt - Revisão do Documento

```plantuml
@startsalt
title Revisar Documento - Coordenador

{
  **Solicitacao #123 - Ana Silva (TCE)**
  --
  {
    Visualizador de PDF do documento
  }
  --
  [Baixar para Assinar]
  [Enviar Assinado]
  [Rejeitar]
}
@endsalt
```

### PlantUML Salt - Dashboard de Análise

```plantuml
@startsalt
title Dashboard de Analise - Coordenador

{
  {+
    Solicitacoes: 8
    Carga horaria media: 28h
    Bolsa mensal media: R$ 1.650
    Empresas parceiras: 5
  }
  --
  Solicitacoes por status (grafico)
  Bolsa media por empresa (grafico)
  Carga horaria media por curso (grafico)
}
@endsalt
```

## Conclusão

<p align = "justify">
A partir da elaboração do protótipo foi possível ter uma noção inicial da interface do usuário, definindo telas, fluxo e funcionalidades que orientaram a construção do sistema.
</p>

## Referências

> Ferramenta PlantUML para Criação de Protótipos. Disponível em https://plantuml.com/salt

## Autor(es)

| Data     | Versão | Descrição                            | Autor(es)                                                                           |
| -------- | ------ | ------------------------------------ | ----------------------------------------------------------------------------------- |
| 10/04/2026 | 1.0  | Criação de documento | Bruno Norton, Christian Werneck, Gianluca Leonardi, Marcos Paulo Assunção, Maurício Gomes e Micael Dali |
| 11/06/2026 | 1.1  | Atualização do protótipo para refletir o escopo implementado (remoção de score por IA, assinatura digital interna, parecer técnico e encaminhamento à reitoria) | Equipe |
