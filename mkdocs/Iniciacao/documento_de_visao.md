---
id: documento_de_visao
title: Documento de Visão
---
## Introdução

<p align = "justify">
O propósito deste documento é fornecer uma visão geral sobre o projeto que será realizado na disciplina Projeto Back-End 2026, na Universidade do Rio de Janeiro. Sendo assim, Nesse documento serão descritas de maneira resumida as principais funcionalidades, usabilidades, o problema que será abordado e os objetivos da equipe.
</p>

## Descrição do Problema 

<p align = "justify">
O processo de inserção de estudantes universitários em ambientes de estágio frequentemente esbarra em burocracias e fluxos de trabalho manuais. Atualmente, a validação de documentos, contratos e requisitos acadêmicos depende de uma análise minuciosa por parte da coordenação do curso. Devido ao grande volume de alunos e à falta de uma ferramenta centralizada, essa validação manual torna-se propensa a atrasos e falhas de comunicação. Esse cenário gera um gargalo operacional que desacelera a liberação das contratações, prejudicando tanto a eficiência administrativa da instituição quanto a agilidade necessária para o estudante iniciar suas atividades no mercado de trabalho.
</p>

### Problema

Obstáculos na organização, por parte da coordenação, da documentação necessária para o ingresso dos alunos em estágios. 

### Impactados

Nosso projeto busca automatizar e acelerar a avaliação da documentação dos alunos que desejam iniciar o estágio. Com isso, otimizamos o tempo dos coordenadores e agilizamos a inserção dos estudantes no mercado de trabalho.

### Consequência

A criação de novos gargalos administrativos, aumento no tempo de espera dos alunos para iniciar o estágio (podendo levar à perda de oportunidades de emprego) e sobrecarga crônica de trabalho sobre os coordenadores do curso.

### Solução

Desenvolver um projeto robusto que automatize a triagem, validação e organização dos fluxos documentais, centralizando o processo e reduzindo a intervenção manual.

## Objetivos

<p align = "justify">
O objetivo da equipe de desenvolvimento é fornecer uma API escalável, segura e eficiente que reduza o tempo de processamento de documentos de estágio.
</p>

## Descrição do Usuário 

<p align = "justify">
Os usuários serão divididos em dois perfis principais: os Alunos, que geram, assinam e enviam os documentos e acompanham o status; e os Coordenadores, que revisam as pendências, assinam pela instituição e aprovam ou rejeitam as solicitações.
</p>

## Recursos do produto

### Conta

<p align = "justify">
O usuário (aluno ou coordenador) poderá fazer login com e-mail institucional, sendo direcionado à interface correspondente ao seu perfil.
</p>

### Painel de Estágios

<p align = "justify">
O coordenador terá uma visão unificada das solicitações pendentes, podendo revisar os documentos enviados, assinar pela instituição (aprovar) ou rejeitar informando o motivo.
</p>

### Documento

<p align = "justify">
O aluno poderá iniciar um novo processo de estágio, gerando o documento (Termo de Compromisso de Estágio ou Relatório Final) a partir de um formulário, para baixá-lo, assiná-lo e enviá-lo (no caso do TCE, junto da apólice de seguro).
</p>

### Análise

<p align = "justify">
O coordenador contará com um dashboard de análise, com indicadores e gráficos sobre os estágios (carga horária média, bolsa média, empresas parceiras e distribuição por status).
</p>

## Restrições

<p align = "justify">
O sistema aceitará apenas arquivos no formato PDF com tamanho máximo de 15MB.
</p>

## Referências Bibliográficas

> Documentação oficial da instituição IBMEC

> Requisitos técnicos e operacionais definidos junto à coordenação da universidade

## Versionamento
| Data | Versão | Descrição | Autor(es) |
| -- | -- | -- | -- |
| 11/06/2026 | 1.0 | Criação do documento | Bruno Norton, Christian Werneck, Gianluca Leonardi, Marcos Paulo Assunção, Maurício Gomes e Micael Dali |
| 11/06/2026 | 1.1 | Ajuste dos recursos do produto para refletir o escopo implementado | Equipe | 

