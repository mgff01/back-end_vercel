from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from . import views
from .views import (
    AlunoViewSet,
    CoordenadorViewSet,
    ModeloDocumentoViewSet,
    SolicitacaoEstagioViewSet,
    RelatorioViewSet,
    ApoliceViewSet,
    ContratoViewSet,
    GerarDocumentoView,
    LoginView,
    ProtectedMediaView,
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
router.register(r'coordenadores', CoordenadorViewSet, basename='coordenador')
router.register(r'modelos-documento', ModeloDocumentoViewSet, basename='modelo-documento')
router.register(r'solicitacoes-estagio', SolicitacaoEstagioViewSet, basename='solicitacao-estagio')
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')
router.register(r'apolices', ApoliceViewSet, basename='apolice')
router.register(r'contratos', ContratoViewSet, basename='contrato')

urlpatterns = [
    path('api/', include (router.urls)),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/documentos/gerar/', GerarDocumentoView.as_view(), name='gerar-documento'),
    re_path(r'^media/(?P<path>.*)$', ProtectedMediaView.as_view(), name='protected_media'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]