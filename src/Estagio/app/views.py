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
import io
import base64
from django.core.files.base import ContentFile

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
    def post(self, request):
        modelo_id = request.data.get("modelo_id")
        solicitacao_id = request.data.get("solicitacao_id")
        dados_aluno = request.data.get("dados") # Dicionário com as respostas do form
        is_preview = request.data.get("preview", True) # Se True, apenas retorna para ver. Se False, salva.

        try:
            modelo = ModeloDocumento.objects.get(id=modelo_id)
            solicitacao = SolicitacaoEstagio.objects.get(id=solicitacao_id)
            
            # Trava de segurança
            if solicitacao.aluno.user != request.user:
                return Response({"erro": "Não autorizado"}, status=status.HTTP_403_FORBIDDEN)

            # 1. Abre o template do Word salvo no sistema
            doc = DocxTemplate(modelo.arquivoUrl.path)
            
            # 2. Preenche o documento com as respostas enviadas pelo front (o 'dados_aluno' deve casar com as tags {{ }} do word)
            doc.render(dados_aluno)
            
            # 3. Salva o resultado em memória (não salva no disco rígido ainda)
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)

            # --- FLUXO DE PREVIEW (Usuário apenas quer conferir) ---
            if is_preview:
                # Converte o documento para Base64 e manda pro front exibir (pode usar um renderizador de docx no front)
                b64_doc = base64.b64encode(buffer.read()).decode('utf-8')
                return Response({
                    "mensagem": "Preview gerado com sucesso.",
                    "documento_base64": b64_doc
                }, status=status.HTTP_200_OK)

            # --- FLUXO DE CONFIRMAÇÃO (Usuário confirmou que está tudo certo) ---
            else:
                nome_arquivo = f"contrato_{solicitacao.aluno.matricula}_{solicitacao.id}.docx"
                
                # Opcional: Converter para PDF aqui se necessário, mas o DOCX preenchido já garante a integridade
                
                # Salva no banco de dados usando o arquivo em memória
                novo_contrato = Contrato.objects.create(
                    solicitacao=solicitacao,
                    # scoreConformidade=1.0 # (Como foi o sistema que gerou, o score é 100%)
                )
                novo_contrato.arquivo.save(nome_arquivo, ContentFile(buffer.read()))
                
                return Response({
                    "mensagem": "Documento assinado e salvo com sucesso!",
                    "documento_id": novo_contrato.id
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)