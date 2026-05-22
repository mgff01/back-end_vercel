# Script para popular o banco de dados com dados de teste
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

from app.models import (
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

User = get_user_model()


def create_user(email, first_name, last_name, password):
    username = email.split("@")[0]
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
        },
    )
    if created:
        user.set_password(password)
        user.save()
    return user


def clear_old_data():
    print("Limpando dados antigos...")

    # Remove usuários associados aos perfis existentes
    for aluno in Aluno.objects.all():
        aluno.user.delete()
    for professor in Professor.objects.all():
        professor.user.delete()
    for coordenador in Coordenador.objects.all():
        coordenador.user.delete()

    AssinaturaDigital.objects.all().delete()
    ParecerTecnico.objects.all().delete()
    Relatorio.objects.all().delete()
    Apolice.objects.all().delete()
    Contrato.objects.all().delete()
    SolicitacaoEstagio.objects.all().delete()
    ModeloDocumento.objects.all().delete()


def main():
    clear_old_data()

    print("Criando usuários e perfis...")

    aluno_users = [
        {
            "email": "joao.silva@aluno.edu.br",
            "first_name": "João",
            "last_name": "Silva",
            "password": "senha123",
            "matricula": "2021001",
        },
        {
            "email": "maria.santos@aluno.edu.br",
            "first_name": "Maria",
            "last_name": "Santos",
            "password": "senha456",
            "matricula": "2021002",
        },
        {
            "email": "carlos.oliveira@aluno.edu.br",
            "first_name": "Carlos",
            "last_name": "Oliveira",
            "password": "senha789",
            "matricula": "2021003",
        },
    ]

    professor_users = [
        {
            "email": "anderson.costa@prof.edu.br",
            "first_name": "Anderson",
            "last_name": "Costa",
            "password": "prof123",
        },
        {
            "email": "beatriz.lima@prof.edu.br",
            "first_name": "Beatriz",
            "last_name": "Lima",
            "password": "prof456",
        },
    ]

    coordenador_users = [
        {
            "email": "coord.geral@edu.br",
            "first_name": "Coordenador",
            "last_name": "Geral",
            "password": "coord123",
        },
    ]

    alunos = []
    for data in aluno_users:
        user = create_user(data["email"], data["first_name"], data["last_name"], data["password"])
        alunos.append(Aluno.objects.create(user=user, matricula=data["matricula"]))

    professores = []
    for data in professor_users:
        user = create_user(data["email"], data["first_name"], data["last_name"], data["password"])
        professores.append(Professor.objects.create(user=user))

    coordenadores = []
    for data in coordenador_users:
        user = create_user(data["email"], data["first_name"], data["last_name"], data["password"])
        coordenadores.append(Coordenador.objects.create(user=user))

    print("Criando modelos de documento...")
    modelos = [
        ModeloDocumento.objects.create(
            titulo="Modelo de Relatório de Estágio",
            arquivoUrl=ContentFile("Modelo de Relatório de Estágio".encode("utf-8"), name="modelo_relatorio_estagio.pdf"),
        ),
        ModeloDocumento.objects.create(
            titulo="Modelo de Contrato",
            arquivoUrl=ContentFile("Modelo de Contrato".encode("utf-8"), name="modelo_contrato.pdf"),
        ),
        ModeloDocumento.objects.create(
            titulo="Modelo de Apólice de Seguro",
            arquivoUrl=ContentFile("Modelo de Apólice de Seguro".encode("utf-8"), name="modelo_apolice.pdf"),
        ),
    ]

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

    print("Criando relatórios...")
    relatorios = [
        Relatorio.objects.create(
            solicitacao=solicitacoes[0],
            arquivo=ContentFile("Relatório aprovado".encode("utf-8"), name="relatorio_joao.pdf"),
            scoreConformidade=0.95,
            status="APROVADO",
            conceitoFinal="APROVADO",
        ),
        Relatorio.objects.create(
            solicitacao=solicitacoes[1],
            arquivo=ContentFile("Relatório em revisão".encode("utf-8"), name="relatorio_maria.pdf"),
            scoreConformidade=0.75,
            status="EM_REVISAO",
            conceitoFinal="APROVADO_RESSALVAS",
        ),
    ]

    print("Criando apólices...")
    apolices = [
        Apolice.objects.create(
            solicitacao=solicitacoes[0],
            arquivo=ContentFile("Apólice aprovada".encode("utf-8"), name="apolice_joao.pdf"),
            scoreConformidade=0.90,
            status="APROVADO",
        ),
        Apolice.objects.create(
            solicitacao=solicitacoes[2],
            arquivo=ContentFile("Apólice em revisão".encode("utf-8"), name="apolice_carlos.pdf"),
            scoreConformidade=0.70,
            status="EM_REVISAO",
        ),
    ]

    print("Criando contratos...")
    contratos = [
        Contrato.objects.create(
            solicitacao=solicitacoes[0],
            arquivo=ContentFile("Contrato aprovado".encode("utf-8"), name="contrato_joao.pdf"),
            scoreConformidade=0.88,
            status="APROVADO",
        ),
        Contrato.objects.create(
            solicitacao=solicitacoes[1],
            arquivo=ContentFile("Contrato em revisão".encode("utf-8"), name="contrato_maria.pdf"),
            scoreConformidade=0.65,
            status="EM_REVISAO",
        ),
    ]

    print("Criando pareceres técnicos...")
    pareceres = [
        ParecerTecnico.objects.create(
            professor=professores[0],
            relatorio=relatorios[0],
            texto="Aluno apresenta bom desempenho nas atividades de estágio. Recomendo aprovação.",
        ),
        ParecerTecnico.objects.create(
            professor=professores[1],
            relatorio=relatorios[1],
            texto="Desenvolvimento satisfatório. Aluno demonstra comprometimento com as tarefas.",
        ),
    ]

    print("Criando assinaturas digitais...")
    assinaturas = [
        AssinaturaDigital.objects.create(
            ipAcesso="192.168.1.100",
            assinado=True,
            aluno=alunos[0],
            relatorio=relatorios[0],
        ),
        AssinaturaDigital.objects.create(
            ipAcesso="192.168.1.101",
            assinado=False,
            professor=professores[0],
            apolice=apolices[0],
        ),
        AssinaturaDigital.objects.create(
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


if __name__ == "__main__":
    main()
