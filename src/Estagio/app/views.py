#imports da pasta antiga "api", que não estavam sendo utilizados:
#from rest_framework import viewsets, generics
#from rest_framework.response import Response
#from rest_framework.decorators import action

from rest_framework import viewsets
from .models import (
    Aluno,
    Professor,
    Coordenador,
    ModeloDocumento,
    SolicitacaoEstagio,
    ParecerTecnico,
    Relatorio,
    Apolice,
    Contrato,
    AssinaturaDigital
)
from .serializers import (
    AlunoSerializer,
    ProfessorSerializer,
    CoordenadorSerializer,
    ModeloDocumentoSerializer,
    SolicitacaoEstagioSerializer,
    ParecerTecnicoSerializer,
    RelatorioSerializer,
    ApoliceSerializer,
    ContratoSerializer,
    AssinaturaDigitalSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from docxtpl import DocxTemplate
from docx2pdf import convert
import io
import os
import base64
import tempfile
import pythoncom
from django.core.files.base import ContentFile


def _docx_bytes_para_pdf_bytes(docx_buffer):
    """
    Converte um .docx (em memória) para PDF usando docx2pdf (MS Word via COM).
    Como o dev server do Django atende cada requisição em uma thread, é preciso
    inicializar o COM nesta thread antes de acionar o Word.
    """
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
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer

class ProfessorViewSet(viewsets.ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer

class CoordenadorViewSet(viewsets.ModelViewSet):
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer


class ModeloDocumentoViewSet(viewsets.ModelViewSet):
    queryset = ModeloDocumento.objects.all()
    serializer_class = ModeloDocumentoSerializer


class SolicitacaoEstagioViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoEstagio.objects.all()
    serializer_class = SolicitacaoEstagioSerializer


class ParecerTecnicoViewSet(viewsets.ModelViewSet):
    queryset = ParecerTecnico.objects.all()
    serializer_class = ParecerTecnicoSerializer


class RelatorioViewSet(viewsets.ModelViewSet):
    queryset = Relatorio.objects.all()
    serializer_class = RelatorioSerializer


class ApoliceViewSet(viewsets.ModelViewSet):
    queryset = Apolice.objects.all()
    serializer_class = ApoliceSerializer


class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer


class AssinaturaDigitalViewSet(viewsets.ModelViewSet):
    queryset = AssinaturaDigital.objects.all()
    serializer_class = AssinaturaDigitalSerializer

class GerarDocumentoView(APIView):
    # Mapeia o 'tipo' enviado pelo front para a classe de documento correspondente.
    TIPOS_DOCUMENTO = {
        "contrato": Contrato,
        "relatorio": Relatorio,
    }

    def post(self, request):
        modelo_id = request.data.get("modelo_id")
        solicitacao_id = request.data.get("solicitacao_id")
        dados_aluno = request.data.get("dados") # Dicionário com as respostas do form
        is_preview = request.data.get("preview", True) # Se True, apenas retorna para ver. Se False, salva.
        tipo = request.data.get("tipo", "contrato") # "contrato" (TCE) ou "relatorio"

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
            #if solicitacao.aluno.user != request.user:
                #return Response({"erro": "Não autorizado"}, status=status.HTTP_403_FORBIDDEN)

            # 1. Abre o template do Word salvo no sistema
            doc = DocxTemplate(modelo.arquivoUrl.path)
            
            # 2. Preenche o documento com as respostas enviadas pelo front (o 'dados_aluno' deve casar com as tags {{ }} do word)
            doc.render(dados_aluno)
            
            # 3. Salva o resultado em memória (não salva no disco rígido ainda)
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)

            # 4. Converte o .docx preenchido em PDF idêntico ao modelo
            pdf_bytes = _docx_bytes_para_pdf_bytes(buffer)
            b64_doc = base64.b64encode(pdf_bytes).decode('utf-8')

            # --- FLUXO DE PREVIEW (Usuário apenas quer conferir) ---
            if is_preview:
                # Devolve o PDF em Base64 para o front baixar sem salvar nada no banco
                return Response({
                    "mensagem": "Preview gerado com sucesso.",
                    "documento_base64": b64_doc
                }, status=status.HTTP_200_OK)

            # --- FLUXO DE CONFIRMAÇÃO (Usuário confirmou que está tudo certo) ---
            else:
                nome_arquivo = f"{tipo}_{solicitacao.aluno.matricula}_{solicitacao.id}.pdf"

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

                return Response({
                    "mensagem": "Documento gerado e salvo com sucesso!",
                    "documento_id": novo_documento.id,
                    "documento_base64": b64_doc,
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)