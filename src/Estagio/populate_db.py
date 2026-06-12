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
    Coordenador,
    ModeloDocumento,
    SolicitacaoEstagio,
    Relatorio,
    Apolice,
    Contrato,
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
    for coordenador in Coordenador.objects.all():
        coordenador.user.delete()

    Relatorio.objects.all().delete()
    Apolice.objects.all().delete()
    Contrato.objects.all().delete()
    SolicitacaoEstagio.objects.all().delete()
    ModeloDocumento.objects.all().delete()


# ---------------------------------------------------------------------------
# Definicao dos campos de cada modelo.
# Cada 'id' corresponde EXATAMENTE a uma tag {{ id }} dentro do .docx real.
# ---------------------------------------------------------------------------
CAMPOS_CONTRATO = [
    {"id": "nome_empresa", "label": "Nome da Empresa", "tipo": "text"},
    {"id": "cnpj_empresa", "label": "CNPJ da Empresa", "tipo": "text"},
    {"id": "nome_aluno", "label": "Nome do Aluno", "tipo": "text"},
    {"id": "matricula_aluno", "label": "Matrícula do Aluno", "tipo": "text"},
    {"id": "curso_aluno", "label": "Curso", "tipo": "text"},
    {"id": "carga_horaria", "label": "Carga Horária Semanal", "tipo": "number"},
    {"id": "data_inicio", "label": "Data de Início", "tipo": "date"},
    {"id": "data_fim", "label": "Data de Término", "tipo": "date"},
    {"id": "valor_bolsa", "label": "Valor da Bolsa (R$)", "tipo": "number"},
]

CAMPOS_RELATORIO = [
    {"id": "aluno_nome", "label": "Nome do Aluno(a)", "tipo": "text"},
    {"id": "curso", "label": "Curso", "tipo": "text"},
    {"id": "periodo", "label": "Período", "tipo": "text"},
    {"id": "data", "label": "Data", "tipo": "date"},
    {"id": "telefone_1", "label": "Telefone / Celular 1", "tipo": "text"},
    {"id": "telefone_2", "label": "Telefone / Celular 2 (Opcional)", "tipo": "text"},
    {"id": "email_1", "label": "E-mail 1", "tipo": "email"},
    {"id": "email_2", "label": "E-mail 2 (Opcional)", "tipo": "email"},
    {"id": "empresa", "label": "Empresa", "tipo": "text"},
    {"id": "segmento", "label": "Segmento da Empresa", "tipo": "text"},
    {"id": "area_atuacao", "label": "Área de Atuação", "tipo": "text"},
    {"id": "gestor_nome", "label": "Nome do Gestor Imediato", "tipo": "text"},
    {"id": "gestor_telefone", "label": "Telefone do Gestor ou RH", "tipo": "text"},
    {"id": "avaliacao_geral", "label": "Quais foram as principais contribuições da sua formação acadêmica para a realização das suas atividades profissionais desenvolvidas? Comente.", "tipo": "text"},
    {"id": "competencias_desenvolvidas", "label": "Quais foram as principais competências (técnicas e/ou comportamentais) desenvolvidas com a realização das atividades profissionais que estejam alinhadas com a formação acadêmica?", "tipo": "text"},
    {"id": "competencias_futuras", "label": "Quais são as principais competências profissionais (técnicas e/ou comportamentais) a serem desenvolvidas por você para um melhor desempenho profissional?", "tipo": "text"},
]

CAMPOS_APOLICE = [
    {"id": "seguradora", "label": "Seguradora", "tipo": "text"},
    {"id": "numero_apolice", "label": "Número da Apólice", "tipo": "text"},
    {"id": "nome_aluno", "label": "Nome do Segurado (Estagiário)", "tipo": "text"},
    {"id": "matricula_aluno", "label": "Matrícula do Aluno", "tipo": "text"},
    {"id": "nome_empresa", "label": "Empresa Concedente", "tipo": "text"},
    {"id": "valor_segurado", "label": "Capital Segurado (R$)", "tipo": "number"},
    {"id": "vigencia_inicio", "label": "Início da Vigência", "tipo": "date"},
    {"id": "vigencia_fim", "label": "Fim da Vigência", "tipo": "date"},
]


def create_modelos():
    """
    Cria os 3 modelos canonicos do zero. Usado no reseed completo (main),
    apos clear_old_data() ter limpado a tabela.
    """
    print("Criando modelos de documento...")
    
    modelos_data = [
        ("Modelo de Contrato", "modelo_contrato.docx", CAMPOS_CONTRATO),
        ("Relatório Final de Estágio", "RelatorioFinalCLTSOCIO.docx", CAMPOS_RELATORIO),
        ("Modelo de Apólice de Seguro", "modelo_apolice.docx", CAMPOS_APOLICE),
    ]
    
    modelos = []
    for titulo, filename, campos in modelos_data:
        modelo = ModeloDocumento(titulo=titulo, campos_dinamicos=campos)
        filepath = BASE_DIR / "media/modelos" / filename
        if filepath.exists():
            with open(filepath, "rb") as f:
                modelo.arquivoUrl.save(filename, ContentFile(f.read()), save=False)
        else:
            print(f"  [AVISO] Arquivo físico não encontrado: {filepath}")
        modelo.save()
        modelos.append(modelo)
        
    return modelos


def fix_modelos():
    """
    Repara o banco VIVO sem apagar NADA: apenas atualiza, no lugar, os
    registros ModeloDocumento existentes (por titulo) para que apontem para
    os .docx reais com o JSON correto. Nao cria nem deleta linhas.
    """
    print("Reparando modelos existentes (sem apagar)...")

    # titulo_atual -> campos a atualizar (pode renomear via 'titulo')
    reparos = {
        "Modelo de Contrato": {
            "arquivoUrl": "modelos/modelo_contrato.docx",
            "campos_dinamicos": CAMPOS_CONTRATO,
        },
        # Registro que ja carrega o .docx do relatorio: vira o canonico
        "RelatórioFinalModelo": {
            "titulo": "Relatório Final de Estágio",
            "arquivoUrl": "modelos/RelatorioFinalCLTSOCIO.docx",
            "campos_dinamicos": CAMPOS_RELATORIO,
        },
        # Registro legado quebrado: passa a apontar para conteudo valido
        "Modelo de Relatório de Estágio": {
            "arquivoUrl": "modelos/RelatorioFinalCLTSOCIO.docx",
            "campos_dinamicos": CAMPOS_RELATORIO,
        },
        # Estava rotulado como Apolice mas guardava o contrato: agora aponta
        # para o template .docx de apolice de verdade
        "Modelo de Apólice de Seguro": {
            "arquivoUrl": "modelos/modelo_apolice.docx",
            "campos_dinamicos": CAMPOS_APOLICE,
        },
    }

    for titulo_atual, campos in reparos.items():
        n = ModeloDocumento.objects.filter(titulo=titulo_atual).update(**campos)
        print(f"  '{titulo_atual}': {n} registro(s) atualizado(s)")

    return list(ModeloDocumento.objects.all().order_by("id"))


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

    coordenadores = []
    for data in coordenador_users:
        user = create_user(data["email"], data["first_name"], data["last_name"], data["password"])
        coordenadores.append(Coordenador.objects.create(user=user))

    modelos = create_modelos()

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
            status="CONCLUIDA",
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

    def dados_contrato(aluno, empresa, cnpj, curso, carga, bolsa):
        return {
            "nome_empresa": empresa,
            "cnpj_empresa": cnpj,
            "nome_aluno": aluno.user.get_full_name(),
            "matricula_aluno": aluno.matricula,
            "curso_aluno": curso,
            "carga_horaria": str(carga),
            "data_inicio": "2026-03-01",
            "data_fim": "2026-12-01",
            "valor_bolsa": str(bolsa),
        }

    print("Criando contratos...")
    contratos = [
        Contrato.objects.create(
            solicitacao=solicitacoes[0],
            arquivo=ContentFile("Contrato aprovado".encode("utf-8"), name="contrato_joao.pdf"),
            scoreConformidade=0.88,
            status="CONCLUIDA",
            dados=dados_contrato(alunos[0], "Tech Solutions", "11.111.111/0001-11", "Engenharia de Software", 30, 1800),
        ),
        Contrato.objects.create(
            solicitacao=solicitacoes[1],
            arquivo=ContentFile("Contrato em revisão".encode("utf-8"), name="contrato_maria.pdf"),
            scoreConformidade=0.65,
            status="EM_REVISAO",
            dados=dados_contrato(alunos[1], "Banco Alfa", "22.222.222/0001-22", "Administração", 20, 1200),
        ),
    ]

    # Estágios concluídos (histórico) — alimentam o dashboard de análise do coordenador.
    print("Criando histórico de estágios para análise...")
    historico = [
        (alunos[2], "Construtora Beta", "33.333.333/0001-33", "Engenharia Civil", 40, 2200),
        (alunos[0], "Saúde+ Clínicas", "44.444.444/0001-44", "Engenharia de Software", 25, 1500),
        (alunos[1], "Agro Brasil", "55.555.555/0001-55", "Administração", 30, 1600),
        (alunos[2], "Tech Solutions", "11.111.111/0001-11", "Engenharia Civil", 30, 1900),
        (alunos[0], "Banco Alfa", "22.222.222/0001-22", "Engenharia de Software", 20, 1400),
    ]
    for aluno, empresa, cnpj, curso, carga, bolsa in historico:
        sol = SolicitacaoEstagio.objects.create(
            aluno=aluno, status=SolicitacaoEstagio.STATUS_APROVADO, avaliador=coordenadores[0]
        )
        solicitacoes.append(sol)
        contratos.append(
            Contrato.objects.create(
                solicitacao=sol,
                arquivo=ContentFile("Contrato concluído".encode("utf-8"), name="contrato_hist.pdf"),
                scoreConformidade=0.9,
                status="CONCLUIDA",
                dados=dados_contrato(aluno, empresa, cnpj, curso, carga, bolsa),
            )
        )

    print("[OK] Banco de dados populado com sucesso!")
    print("\n📊 Resumo:")
    print(f"  - {len(alunos)} alunos criados")
    print(f"  - {len(coordenadores)} coordenadores criados")
    print(f"  - {len(modelos)} modelos de documento criados")
    print(f"  - {len(solicitacoes)} solicitações de estágio criadas")
    print(f"  - {len(relatorios)} relatórios criados")
    print(f"  - {len(apolices)} apólices criadas")
    print(f"  - {len(contratos)} contratos criados")


if __name__ == "__main__":
    main()
