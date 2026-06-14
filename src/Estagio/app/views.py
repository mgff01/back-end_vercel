# imports da pasta antiga "api", que não estavam sendo utilizados:
# from rest_framework import viewsets, generics
# from rest_framework.response import Response
# from rest_framework.decorators import action
from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import redirect
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from .models import (
    Aluno,
    Coordenador,
    ModeloDocumento,
    RelatorioIntermediario,
    SolicitacaoEstagio,
    Relatorio,
    Apolice,
    Contrato,
)
from .serializers import (
    AlunoSerializer,
    CoordenadorSerializer,
    ModeloDocumentoSerializer,
    RelatorioIntermediarioSerializer,
    SolicitacaoEstagioSerializer,
    RelatorioSerializer,
    ApoliceSerializer,
    ContratoSerializer,
    ValidarDadosDocumentoSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from docxtpl import DocxTemplate
import io
import os
import base64
import tempfile
import json
import logging
from django.core.files.base import ContentFile
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.pdf_utils.writer import PdfFileWriter

logger = logging.getLogger(__name__)

try:
    from docx2pdf import convert
except Exception:
    convert = None

try:
    import pythoncom
except Exception:
    pythoncom = None
class LoginView(APIView):
    """
    Login por e-mail + senha. Valida as credenciais no backend e emite um par de
    tokens JWT (autenticação de verdade). Também informa o papel do usuário
    (aluno/coordenador) para conveniência do frontend.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        senha = request.data.get("senha") or request.data.get("password") or ""

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        if user is None or not user.check_password(senha):
            return Response(
                {"erro": "E-mail ou senha inválidos."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if hasattr(user, "perfil_coordenador"):
            papel = "coordenador"
        elif hasattr(user, "perfil_aluno"):
            papel = "aluno"
        else:
            papel = None

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "nome": user.get_full_name() or user.email,
                "email": user.email,
                "papel": papel,
            },
            status=status.HTTP_200_OK,
        )


def _docx_bytes_para_pdf_bytes(docx_buffer):
    """
    Converte um .docx (em memória) para PDF. Usa a API externa ConvertAPI em produção
    (se a variável de ambiente CONVERTAPI_SECRET estiver configurada) ou a conversão local 
    docx2pdf em desenvolvimento Windows.
    """
    api_secret = os.environ.get("CONVERTAPI_SECRET")

    # Se a API Secret estiver configurada (Produção na Vercel)
    if api_secret:
        import convertapi
        convertapi.api_credentials = api_secret
        convertapi.api_secret = api_secret
        
        with tempfile.TemporaryDirectory() as tmpdir:
            docx_path = os.path.join(tmpdir, "documento.docx")
            pdf_path = os.path.join(tmpdir, "documento.pdf")
            
            with open(docx_path, "wb") as f:
                f.write(docx_buffer.getvalue())
                
            # Dispara a conversão na nuvem
            result = convertapi.convert("pdf", {"File": docx_path}, from_format="docx")
            result.save_files(pdf_path)
            
            with open(pdf_path, "rb") as f:
                return f.read()

    # Caso contrário, tenta usar a conversão local (Windows + MS Word)
    if convert is None or pythoncom is None:
        raise RuntimeError(
            "Conversão para PDF indisponível neste ambiente. "
            "Configure a variável de ambiente 'CONVERTAPI_SECRET' no painel da Vercel para habilitar a conversão na nuvem."
        )

    tmpdir = tempfile.mkdtemp()
    docx_path = os.path.join(tmpdir, "documento.docx")
    pdf_path = os.path.join(tmpdir, "documento.pdf")
    try:
        with open(docx_path, "wb") as f:
            f.write(docx_buffer.getvalue())

        pythoncom.CoInitialize()
        try:
            convert(docx_path, pdf_path)
        finally:
            pythoncom.CoUninitialize()

        with open(pdf_path, "rb") as f:
            return f.read()
    finally:
        for p in (docx_path, pdf_path):
            try:
                os.remove(p)
            except OSError:
                pass
        try:
            os.rmdir(tmpdir)
        except OSError:
            pass


class AlunoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AlunoSerializer

    def get_queryset(self):
        user = self.request.user
        # Se for admin ou coordenador, vê tudo
        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return Aluno.objects.all()
        # Se for aluno, vê apenas o próprio perfil
        elif hasattr(user, "perfil_aluno"):
            return Aluno.objects.filter(user=user)
        return Aluno.objects.none()


class AlunoDetalhesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retorna os dados do aluno logado"""
        try:
            aluno = request.user.perfil_aluno
            return Response(
                {
                    "id": aluno.id,
                    "nome": request.user.get_full_name(),
                    "email": request.user.email,
                    "matricula": aluno.matricula,
                    "data_cadastro": request.user.date_joined,
                }
            )
        except:
            return Response({"erro": "Aluno não encontrado"}, status=404)


class CoordenadorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer


class ModeloDocumentoViewSet(viewsets.ModelViewSet):
    queryset = ModeloDocumento.objects.all().order_by("id")
    serializer_class = ModeloDocumentoSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class AssinarDocumentoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        documento_id = request.data.get("documento_id")
        tipo = request.data.get("tipo")  # "contrato" ou "relatorio"

        # 1) Recupera o documento
        classe_documento = {"contrato": Contrato, "relatorio": Relatorio}[tipo]
        doc = classe_documento.objects.get(id=documento_id)

        # Verifica se é o aluno do documento
        if doc.solicitacao.aluno.user != request.user:
            return Response({"erro": "Não autorizado"}, status=403)

        # 2) Abre o PDF
        with open(doc.arquivo.path, "rb") as f:
            reader = PdfFileReader(f)

        # 3. Assina (você pode usar certificado digital ou apenas marcar como assinado)
        # Para produção, integre com um serviço real (DocuSign, SignNow, etc)
        writer = PdfFileWriter()
        # ... adicionar assinatura ...

        # 4) Salva e atualiza status
        doc.status = "ENVIADO"
        doc.save()

        return Response(
            {"mensagem": "Documento assinado e enviado com sucesso!"}, status=200
        )


class SolicitacaoEstagioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SolicitacaoEstagioSerializer

    def get_queryset(self):
        user = self.request.user
        # Junta as tabelas de Aluno, User e Avaliador em uma única consulta rápida
        relacionamentos = ["aluno", "aluno__user", "avaliador", "avaliador__user"]

        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return SolicitacaoEstagio.objects.all().select_related(*relacionamentos)
        elif hasattr(user, "perfil_aluno"):
            return SolicitacaoEstagio.objects.filter(aluno__user=user).select_related(
                *relacionamentos
            )
        return SolicitacaoEstagio.objects.none()


class RelatorioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RelatorioSerializer

    def get_queryset(self):
        user = self.request.user
        # Mapeia o caminho até o usuário para o Django fazer o JOIN em uma única query
        relacionamentos = [
            "solicitacao",
            "solicitacao__aluno",
            "solicitacao__aluno__user",
        ]

        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return Relatorio.objects.all().select_related(*relacionamentos)
        elif hasattr(user, "perfil_aluno"):
            return Relatorio.objects.filter(
                solicitacao__aluno__user=user
            ).select_related(*relacionamentos)
        return Relatorio.objects.none()


class RelatorioIntermediarioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RelatorioIntermediarioSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return RelatorioIntermediario.objects.all()
        elif hasattr(user, "perfil_aluno"):
            return RelatorioIntermediario.objects.filter(solicitacao__aluno__user=user)
        return RelatorioIntermediario.objects.none()


class ApoliceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ApoliceSerializer

    def get_queryset(self):
        user = self.request.user
        # Mesma lógica de JOIN aplicada à Apólice
        relacionamentos = [
            "solicitacao",
            "solicitacao__aluno",
            "solicitacao__aluno__user",
        ]

        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return Apolice.objects.all().select_related(*relacionamentos)
        elif hasattr(user, "perfil_aluno"):
            return Apolice.objects.filter(solicitacao__aluno__user=user).select_related(
                *relacionamentos
            )
        return Apolice.objects.none()


class ContratoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ContratoSerializer

    def get_queryset(self):
        user = self.request.user
        relacionamentos = [
            "solicitacao",
            "solicitacao__aluno",
            "solicitacao__aluno__user",
        ]

        if user.is_superuser or hasattr(user, "perfil_coordenador"):
            return Contrato.objects.all().select_related(*relacionamentos)
        elif hasattr(user, "perfil_aluno"):
            return Contrato.objects.filter(
                solicitacao__aluno__user=user
            ).select_related(*relacionamentos)
        return Contrato.objects.none()


class GerarDocumentoView(APIView):
    # Mapeia o 'tipo' enviado pelo front para a classe de documento correspondente.
    TIPOS_DOCUMENTO = {
        "contrato": Contrato,
        "relatorio": Relatorio,
        "relatorio_intermediario": RelatorioIntermediario,
    }

    def post(self, request):
        serializer = ValidarDadosDocumentoSerializer(
            data={"dados": request.data.get("dados")},
            context={"tipo": request.data.get("tipo")},
        )
        if not serializer.is_valid():
            errors = serializer.errors
            err_msg = "Erro de validação nos dados enviados."
            if "dados" in errors:
                d_err = errors["dados"]
                if isinstance(d_err, list) and d_err:
                    err_msg = str(d_err[0])
                elif isinstance(d_err, dict) and d_err:
                    first_key = list(d_err.keys())[0]
                    first_val = d_err[first_key]
                    if isinstance(first_val, list) and first_val:
                        err_msg = str(first_val[0])
                    else:
                        err_msg = str(first_val)
            elif "non_field_errors" in errors and errors["non_field_errors"]:
                err_msg = str(errors["non_field_errors"][0])
            return Response({"erro": err_msg}, status=status.HTTP_400_BAD_REQUEST)
        modelo_id = request.data.get("modelo_id")
        solicitacao_id = request.data.get("solicitacao_id")
        dados_aluno = request.data.get("dados")  # Dicionário com as respostas do form
        is_preview = request.data.get(
            "preview", True
        )  # Se True, apenas retorna para ver. Se False, salva.
        tipo = request.data.get("tipo", "contrato")  # "contrato" (TCE) ou "relatorio"

        classe_documento = self.TIPOS_DOCUMENTO.get(tipo)
        if classe_documento is None:
            return Response(
                {"erro": f"Tipo de documento inválido: {tipo}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            modelo = ModeloDocumento.objects.get(id=modelo_id)

            # No preview o aluno apenas confere o documento, então não exigimos
            # uma solicitação. Ela só é necessária no fluxo de confirmação.
            solicitacao = None
            if not is_preview:
                solicitacao = SolicitacaoEstagio.objects.get(id=solicitacao_id)

            # Trava de segurança
            # if solicitacao.aluno.user != request.user:
            # return Response({"erro": "Não autorizado"}, status=status.HTTP_403_FORBIDDEN)

            # 1. Abre o template do Word salvo no sistema
            doc = DocxTemplate(io.BytesIO(modelo.arquivoUrl.read()))
            
            # 2. Preenche o documento com as respostas enviadas pelo front (o 'dados_aluno' deve casar com as tags {{ }} do word)
            doc.render(dados_aluno)

            # 3. Salva o resultado em memória (não salva no disco rígido ainda)
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)

            # 4. Converte o .docx preenchido em PDF idêntico ao modelo
            pdf_bytes = _docx_bytes_para_pdf_bytes(buffer)
            b64_doc = base64.b64encode(pdf_bytes).decode("utf-8")

            # --- FLUXO DE PREVIEW (Usuário apenas quer conferir) ---
            if is_preview:
                # Devolve o PDF em Base64 para o front baixar sem salvar nada no banco
                return Response(
                    {
                        "mensagem": "Preview gerado com sucesso.",
                        "documento_base64": b64_doc,
                    },
                    status=status.HTTP_200_OK,
                )

            # --- FLUXO DE CONFIRMAÇÃO (Usuário confirmou que está tudo certo) ---
            else:
                nome_arquivo = (
                    f"{tipo}_{solicitacao.aluno.matricula}_{solicitacao.id}.pdf"
                )

                # Usa o método do Aluno (models.py) para criar e anexar o PDF gerado de forma segura.
                # status="GERADO" indica que o documento foi gerado mas o assinado ainda não foi enviado.
                novo_documento = solicitacao.aluno.anexar_documento_gerado(
                    solicitacao=solicitacao,
                    classe_documento=classe_documento,
                    nome_arquivo=nome_arquivo,
                    arquivo_em_memoria=ContentFile(pdf_bytes),
                    status="GERADO",
                    dados=dados_aluno or {},  # persiste as respostas p/ análises
                )

                return Response(
                    {
                        "mensagem": "Documento gerado e salvo com sucesso!",
                        "documento_id": novo_documento.id,
                        "documento_base64": b64_doc,
                    },
                    status=status.HTTP_201_CREATED,
                )

        except Exception as e:
            # 1. Registra o erro real no terminal do servidor para você (desenvolvedor) debugar
            print(f"[ERRO CRÍTICO] Falha ao gerar/salvar o documento: {str(e)}")

            # 2. Devolve uma mensagem genérica, amigável e segura para o frontend
            return Response(
                {
                    "erro": "Ocorreu um erro interno no servidor ao processar o seu documento. Por favor, tente novamente mais tarde."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProtectedMediaView(APIView):
    """
    Serve os arquivos de mídia (PDFs, Word) verificando o Token JWT e a propriedade do documento (LGPD).
    """

    permission_classes = [AllowAny]

    def get(self, request, path):
        from django.core.files.storage import default_storage

        # Se não for da pasta 'modelos/', exige autenticação antes de qualquer coisa
        if not path.startswith("modelos/"):
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {"erro": "Não autenticado"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # 1. Verifica se o arquivo existe na storage configurada (banco ou disco)
        if not default_storage.exists(path):
            raise Http404("Arquivo não encontrado.")

        # Se não for da pasta 'modelos/', executa a trava LGPD
        if not path.startswith("modelos/"):
            user = request.user

            # 2. Se for Coordenador ou Admin, acesso liberado a qualquer arquivo
            if not (user.is_superuser or hasattr(user, "perfil_coordenador")):
                # 4. A trava final (LGPD): Verifica se o arquivo pertence a alguma solicitação deste aluno
                owns_contrato = Contrato.objects.filter(
                    arquivo=path, solicitacao__aluno__user=user
                ).exists()
                owns_relatorio = Relatorio.objects.filter(
                    arquivo=path, solicitacao__aluno__user=user
                ).exists()
                owns_apolice = Apolice.objects.filter(
                    arquivo=path, solicitacao__aluno__user=user
                ).exists()

                if not (owns_contrato or owns_relatorio or owns_apolice):
                    raise PermissionDenied(
                        "Acesso negado. Este documento não pertence a você."
                    )

        # 5. Se passou em todos os testes, entrega o arquivo!
        file_handle = default_storage.open(path)
        return FileResponse(file_handle)



