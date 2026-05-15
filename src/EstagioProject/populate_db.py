# Script para popular o banco de dados com dados de teste
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
django.setup()

from src.EstagioProject.app.models import (
    Aluno,
    Professor,
    Coordenador,
    ModeloDocumento,
    SolicitacaoEstagio,
    ParecerTecnico,
    Relatorio,
    Apolice,
    Contrato,
    AssinaturaDigital,
)
from datetime import datetime, timedelta


# Limpar dados existentes (opcional)
print("Limpando dados antigos...")
Aluno.objects.all().delete()
Professor.objects.all().delete()
Coordenador.objects.all().delete()
ModeloDocumento.objects.all().delete()

# Criar Alunos
print("Criando alunos...")
alunos = [
    Aluno.objects.create(
        matricula="2021001",
        nome="João Silva",
        email="joao.silva@aluno.edu.br",
        senhaInstitucional="senha123",
    ),
    Aluno.objects.create(
        matricula="2021002",
        nome="Maria Santos",
        email="maria.santos@aluno.edu.br",
        senhaInstitucional="senha456",
    ),
    Aluno.objects.create(
        matricula="2021003",
        nome="Carlos Oliveira",
        email="carlos.oliveira@aluno.edu.br",
        senhaInstitucional="senha789",
    ),
]

# Criar Professores
print("Criando professores...")
professores = [
    Professor.objects.create(
        nome="Dr. Anderson Costa",
        email="anderson.costa@prof.edu.br",
        senhaInstitucional="prof123",
    ),
    Professor.objects.create(
        nome="Dra. Beatriz Lima",
        email="beatriz.lima@prof.edu.br",
        senhaInstitucional="prof456",
    ),
]

# Criar Coordenadores
print("Criando coordenadores...")
coordenadores = [
    Coordenador.objects.create(
        nome="Prof. Coordenador Geral",
        email="coord.geral@edu.br",
        senhaInstitucional="coord123",
    ),
]

# Criar Modelos de Documento
print("Criando modelos de documento...")
modelos = [
    ModeloDocumento.objects.create(
        titulo="Modelo de Relatório de Estágio",
        arquivoUrl="modelos/relatorio_estagio.pdf",
        aluno=alunos[0],
    ),
    ModeloDocumento.objects.create(
        titulo="Modelo de Contrato",
        arquivoUrl="modelos/contrato_modelo.pdf",
        aluno=alunos[1],
    ),
    ModeloDocumento.objects.create(
        titulo="Modelo de Apólice de Seguro",
        arquivoUrl="modelos/apolice_modelo.pdf",
        aluno=alunos[2],
    ),
]

# Criar Solicitações de Estágio
print("Criando solicitações de estágio...")
solicitacoes = [
    SolicitacaoEstagio.objects.create(
        aluno=alunos[0],
        status=SolicitacaoEstagio.STATUS_APROVADO,
        avaliador=coordenadores[0],
    ),
    SolicitacaoEstagio.objects.create(
        aluno=alunos[1],
        status=SolicitacaoEstagio.STATUS_PENDENTE,
    ),
    SolicitacaoEstagio.objects.create(
        aluno=alunos[2],
        status=SolicitacaoEstagio.STATUS_RETIFICACAO,
        motivo_retificacao="Documento com formatação incorreta. Por favor, refaça conforme o modelo.",
        avaliador=coordenadores[0],
    ),
]

# Criar Pareceres Técnicos
print("Criando pareceres técnicos...")
pareceres = [
    ParecerTecnico.objects.create(
        professor=professores[0],
        texto="Aluno apresenta bom desempenho nas atividades de estágio. Recomendo aprovação.",
    ),
    ParecerTecnico.objects.create(
        professor=professores[1],
        texto="Desenvolvimento satisfatório. Aluno demonstra comprometimento com as tarefas.",
    ),
]

# Criar Relatórios
print("Criando relatórios...")
relatorios = [
    Relatorio.objects.create(
        solicitacao=solicitacoes[0],
        scoreConformidade=0.95,
        status="APROVADO",
        conceitoFinal="A",
    ),
    Relatorio.objects.create(
        solicitacao=solicitacoes[1],
        scoreConformidade=0.75,
        status="EM_REVISAO",
        conceitoFinal="B",
    ),
]

# Criar Apólices
print("Criando apólices...")
apolices = [
    Apolice.objects.create(
        solicitacao=solicitacoes[0], scoreConformidade=0.90, status="APROVADO"
    ),
    Apolice.objects.create(
        solicitacao=solicitacoes[2], scoreConformidade=0.70, status="EM_REVISAO"
    ),
]

# Criar Contratos
print("Criando contratos...")
contratos = [
    Contrato.objects.create(
        solicitacao=solicitacoes[0], scoreConformidade=0.88, status="APROVADO"
    ),
    Contrato.objects.create(
        solicitacao=solicitacoes[1], scoreConformidade=0.65, status="EM_REVISAO"
    ),
]

# Criar Assinaturas Digitais
print("Criando assinaturas digitais...")
assinaturas = [
    AssinaturaDigital.objects.create(
        idAssinatura="ASS001",
        ipAcesso="192.168.1.100",
        assinado=True,
        aluno=alunos[0],
        relatorio=relatorios[0],
        apolice=apolices[0],
        contrato=contratos[0],
    ),
    AssinaturaDigital.objects.create(
        idAssinatura="ASS002",
        ipAcesso="192.168.1.101",
        assinado=False,
        professor=professores[0],
        relatorio=relatorios[1],
    ),
    AssinaturaDigital.objects.create(
        idAssinatura="ASS003",
        ipAcesso="192.168.1.102",
        assinado=True,
        coordenador=coordenadores[0],
        contrato=contratos[1],
    ),
]

print("✅ Banco de dados populado com sucesso!")
print("\n📊 Resumo:")
print(f"  - {len(alunos)} alunos criados")
print(f"  - {len(professores)} professores criados")
print(f"  - {len(coordenadores)} coordenadores criados")
print(f"  - {len(modelos)} modelos de documento criados")
print(f"  - {len(solicitacoes)} solicitações de estágio criadas")
print(f"  - {len(pareceres)} pareceres técnicos criados")
print(f"  - {len(relatorios)} relatórios criados")
print(f"  - {len(apolices)} apólices criadas")
print(f"  - {len(contratos)} contratos criados")
print(f"  - {len(assinaturas)} assinaturas digitais criadas")
