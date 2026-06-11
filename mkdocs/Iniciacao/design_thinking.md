---
id: dt
title: Design Thinking
---

## **Design Thinking**

### **1. Capa**

- Sistema de Requerimento de Estagio
- Equipe 1 

---

### **2. Introdução**

- **Contexto do Projeto**: Atualmente, o processo de validação de documentos para o ingresso de alunos em estágios na instituição esbarra em fluxos manuais e burocráticos, gerando atrasos na inserção dos estudantes no mercado de trabalho e sobrecarga na coordenação.
- **Objetivo**: Desenvolver um projeto para automatizar e acelerar a triagem e a avaliação da documentação de estágio, otimizando o tempo dos coordenadores e agilizando o processo para os alunos.
- **Público-Alvo**: Coordenadores de curso (administradores do fluxo administrativo) e estudantes universitários em busca de estágio.
- **Escopo**: Desenvolvimento da API e da lógica de Back-End para o gerenciamento de contas, upload e validação de arquivos (PDF de até 15MB), além de filtros e consultas de status dos processos.

---

### **3. Fases do Design Thinking**

#### **3.1. Empatia**

- **Pesquisa**: Reuniões de alinhamento e levantamento de requisitos com a coordenação do curso, além da análise das diretrizes institucionais do IBMEC para entender as regras de validação documental.
- **Insights**: A falta de uma ferramenta centralizada faz com que os coordenadores percam muito tempo revisando papéis manualmente. Para os alunos, a falta de visibilidade sobre o status do processo gera ansiedade e risco de perder prazos de contratação.
- **Personas**: O Aluno: Precisa enviar o Termo de Compromisso de forma rápida e quer saber se o documento foi aprovado ou rejeitado sem precisar ir à secretaria/coordenação.
- **Coordenador**: Recebe dezenas de contratos por semana e precisa de um sistema que filtre o que realmente precisa de atenção humana, automatizando o restante.

#### **3.2. Definição**

- **Problema Central**: "Como podemos agilizar e centralizar a validação dos documentos de estágio para reduzir o tempo de espera do aluno e a carga de trabalho da coordenação?"
- **Pontos de Vista (POV)**: A coordenação do IBMEC precisa de uma gestão documental automatizada porque o volume atual de processos manuais gera gargalos operacionais e atrasa o ingresso dos estudantes no mercado de trabalho.

#### **3.3. Ideação**

- **Brainstorming**: Criação de um sistema de upload de arquivos com notificações automáticas.
   - Implementação de filtros de busca por status (Pendente, Aprovado, Rejeitado) para o coordenador.
   - Definição de perfis de acesso restritos e seguros para alunos e administradores.
- **Seleção de Ideias**: Critérios focados na viabilidade técnica para um projeto Back-End (segurança dos dados, performance da API e facilidade de integração com o armazenamento de arquivos).
- **Ideias Selecionadas**: Desenvolvimento de uma API robusta que suporte o cadastro de usuários, o envio padronizado de documentos em PDF e um painel de controle filtrável para a gestão da coordenação.

#### **3.4. Prototipagem**

- **Descrição do Protótipo**: A ideia foi transformada em um protótipo digital de Back-End, focado na modelagem do banco de dados (relação aluno, documento e coordenação) e no desenho dos endpoints da API (rotas HTTP para envio de arquivos, autenticação e consulta de status).
- **Materiais Utilizados**: 
- **Testes Realizados**: Foram realizados testes de integração iniciais nas rotas da API simulando múltiplos cenários: envio correto de arquivos em formato válido (PDF), tentativa de upload de arquivos corrompidos ou acima do limite (5MB) e validação dos filtros de busca da coordenação.

#### **3.5. Teste**

- **Feedback dos Usuários**:
- **Ajustes Realizados**: 
- **Resultados Finais**: Uma API funcional, segura e estruturada, capaz de centralizar o fluxo documental de estágio, notificando pendências de forma clara e mitigando os erros do antigo processo manual.

---

### **4. Conclusão**

- **Resultados Obtidos**: O projeto entregou uma arquitetura de Back-End sólida que atende diretamente às dores mapeadas no IBMEC. Conseguiu-se desenhar um fluxo que reduz consideravelmente o tempo gasto na triagem de documentos e oferece transparência em tempo real para os alunos.
- **Próximos Passos**: 
- **Aprendizados**: O processo reforçou a importância de aplicar o Design Thinking mesmo em projetos estritamente técnicos de Back-End, garantindo que as regras de negócio codificadas estejam perfeitamente alinhadas com as necessidades humanas reais dos coordenadores e alunos.

---

### **5. Anexos**

- Fotos, gráficos, tabelas, transcrições de entrevistas, etc.

---

## **Dicas para Criar o Documento**

- Use uma linguagem clara e objetiva.
- Inclua visualizações, como mapas de empatia, jornadas do usuário ou esboços de ideias.
- Adapte o documento conforme o estágio do projeto (ex.: um documento inicial pode focar mais na pesquisa, enquanto um final pode detalhar a solução).

Esse modelo é flexível e pode ser ajustado conforme as necessidades do seu projeto ou da sua equipe. O importante é que o documento reflita o processo colaborativo e iterativo do Design Thinking.
