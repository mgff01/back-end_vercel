# Projeto Back-End Deploy

**Código da Disciplina**: IBM8936<br>

## Sobre

Repositório do Grupo 1 de PBE 2026.1, turma 8001, incluindo: Gianluca, Marcos, Maurício, Micael, Bruno e Christian

## Configurando o Ambiente

### 1) Clonar o Repositório

No GitHub, vá até a página do nosso repositório (https://github.com/Projetos-de-Extensao/PBE_26.1_8001_I), procure o ícone verde de <> Code, clique nele e copie a URL do repositório

No VS Code, digite `Ctrl/Cmd + Shift + P` pra abrir a Paleta de Comandos e digite `Clone`. Clique na opção de `Git: Clone`. Ele dará opção de clonar usando a URL ou, pelo menos, de clonar usando o GitHub. Coloque a pasta do repositório clonado onde você achar melhor e pronto

### 2) Criar o Ambiente Virtual

Antes de instalar qualquer coisa, abra a Paleta de Comandos de novo e digite `Python: Create Environment`. Clique nessa opção, escolha `venv` quando ele perguntar se você quer um ambiente venv ou conda, e o VS Code já deve mostrar a opção de `requirements.txt`. Clique nela e, ao criar o venv, o VS Code já vai dar o nome dele de `.venv`, que é um nome padrão, e vai instalar tudo que está no `requirements.txt` sem você escrever um único comando de terminal

### 3) Executando o Projeto

#### a) Frontend

O frontend fica na pasta `frontend`.

```bash
cd frontend
npm install
npm run dev
```

Por padrão, a aplicação sobe em `http://localhost:3000/`.

#### b) Django

O projeto Django principal fica em `src/Estagio`.

##### - Ative o Ambiente Virtual

No Windows:

```bash
.\.venv\Scripts\activate
```

No Mac/Linux:

```bash
source .venv/bin/activate
```

##### - Atualizar o Banco de Dados

```bash
cd src/Estagio
python manage.py migrate
```

##### - Iniciar o Servidor

```bash
python manage.py runserver
```

Por padrão, o servidor se inicia em `http://127.0.0.1:8000/`.

#### c) Mkdocs

##### - Ative o Ambiente Virtual

##### - Iniciar o Servidor de Documentação

```bash
mkdocs serve
```

#### OBS: Rodando Django e MkDocs ao mesmo tempo

Como o Django e o MkDocs escolhem a porta 8000, rodar os dois ao mesmo tempo pode dar problema. Para evitar isso, abra dois terminais (clique no ícone de `+` no painel do terminal) e use:

Terminal 1 (Django):

```bash
python manage.py runserver 8000
```

Terminal 2 (MkDocs):

```bash
mkdocs serve -a localhost:8001
```

#### OBS: Rodando Frontend e Django ao mesmo tempo

Se quiser deixar o frontend e o Django abertos juntos, use dois terminais:

Terminal 1 (Frontend):

```bash
cd frontend
npm run dev
```

Terminal 2 (Django):

```bash
cd src/Estagio
python manage.py runserver
```

## Diagramas

A princípio, usaremos PlantUML, mas há uma pasta de diagramas dentro de `mkdocs/docs` onde diagramas de qualquer origem podem ser colocados. Para visualizar e criar os diagramas de PlantUML, é preciso ter o JRE ou o JDK instalado e o Graphviz
