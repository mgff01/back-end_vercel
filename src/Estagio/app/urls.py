from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    AlunoViewSet,
<<<<<<< HEAD
    ProfessorViewSet,
    CoordenadorViewSet,
    ModeloDocumentoViewSet,
    SolicitacaoEstagioViewSet,
    ParecerTecnicoViewSet,
    RelatorioViewSet,
    ApoliceViewSet,
    ContratoViewSet,
    AssinaturaDigitalViewSet,
    GerarDocumentoView,
=======
    CoordenadorViewSet,
    ModeloDocumentoViewSet,
    SolicitacaoEstagioViewSet,
    RelatorioViewSet,
    ApoliceViewSet,
    ContratoViewSet,
    GerarDocumentoView,
    LoginView,
>>>>>>> upstream/main
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
<<<<<<< HEAD
router.register(r'professores', ProfessorViewSet, basename='professor')
router.register(r'coordenadores', CoordenadorViewSet, basename='coordenador')
router.register(r'modelos-documento', ModeloDocumentoViewSet, basename='modelo-documento')
router.register(r'solicitacoes-estagio', SolicitacaoEstagioViewSet, basename='solicitacao-estagio')
router.register(r'pareceres-tecnicos', ParecerTecnicoViewSet, basename='parecer-tecnico')
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')
router.register(r'apolices', ApoliceViewSet, basename='apolice')
router.register(r'contratos', ContratoViewSet, basename='contrato')
router.register(r'assinaturas-digitais', AssinaturaDigitalViewSet, basename='assinatura-digital')

urlpatterns = [
    path('api/', include (router.urls)),
=======
router.register(r'coordenadores', CoordenadorViewSet, basename='coordenador')
router.register(r'modelos-documento', ModeloDocumentoViewSet, basename='modelo-documento')
router.register(r'solicitacoes-estagio', SolicitacaoEstagioViewSet, basename='solicitacao-estagio')
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')
router.register(r'apolices', ApoliceViewSet, basename='apolice')
router.register(r'contratos', ContratoViewSet, basename='contrato')

urlpatterns = [
    path('api/', include (router.urls)),
    path('api/login/', LoginView.as_view(), name='login'),
>>>>>>> upstream/main
    path('api/documentos/gerar/', GerarDocumentoView.as_view(), name='gerar-documento'),
]

# adição para ver os documentos enviados
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)