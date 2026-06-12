---
id: prototipo_alta_fidelidade
title: Protótipo de Alta Fidelidade
---

# Protótipo de Alta Fidelidade

## Introdução

O protótipo de alta fidelidade representa a interface do **Sistema de Validação de Estágios** já no nível de detalhe da aplicação implementada, com a identidade visual do Ibmec (tom azul-marinho `#041e3a`, cartões arredondados e tipografia limpa). Ele foi construído como o próprio front-end do sistema (Next.js + Tailwind CSS), validando o fluxo de ponta a ponta para os perfis **Aluno** e **Coordenador**.

## Telas e fluxo

### Login institucional

Tela de entrada com e-mail institucional e senha. O acesso distingue automaticamente o perfil (Aluno ou Coordenador) e direciona para o painel correspondente.

### Painel do Aluno

- **Estado vazio:** botões **"Nova Solicitação de Estágio"** e **"Baixar Modelos"**, além do cartão de requisitos do TCE.
- **Nova Solicitação (modal):** escolha entre **TCE / Apólice** (para quem vai começar o estágio) e **Relatório Final** (para quem concluiu), cada um com uma breve explicação.
- **Formulário dinâmico:** campos do documento escolhido, com **"Baixar Preview"** e **"Confirmar e Baixar"** (gera o PDF, registra a solicitação e baixa o arquivo para assinatura).
- **Card de acompanhamento:** mostra a etapa atual da solicitação (gerado, enviado, em assinatura, aprovado) e a ação disponível.
- **Envio de documentos:** upload do documento assinado (no TCE, também a apólice), com aviso de que só devem ser enviados após assinados por aluno e empresa.
- **Tela de conclusão:** após a aprovação, o aluno confere o sucesso, baixa o documento final e confirma a conclusão.

### Painel do Coordenador

- **Caixa de solicitações:** lista as solicitações pendentes (documentos enviados ou em assinatura), com as informações básicas e o botão **"Visualizar"**.
- **Revisão do documento:** visualizador de PDF embutido. No TCE, a revisão é sequencial (contrato e, em seguida, apólice). O coordenador pode **"Baixar para Assinar"** ou **"Rejeitar"** (com mensagem padrão "não assinado" editável).
- **Envio do assinado:** upload do documento assinado pela instituição, finalizando a análise.
- **Dashboard de Análise:** acessível por um botão no topo do painel, exibe contadores (solicitações, carga horária média, bolsa média, empresas parceiras) e gráficos (distribuição por status, bolsa por empresa e carga horária por curso).

## Conclusão

O protótipo de alta fidelidade consolidou as decisões de interface e fluxo do sistema, servindo diretamente como base da aplicação entregue.

## Autor(es)

| Data     | Versão | Descrição            | Autor(es)                                                                                              |
| -------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| 11/06/26 | 1.0    | Substituição do conteúdo de exemplo pela descrição da interface de alta fidelidade implementada | Equipe |
