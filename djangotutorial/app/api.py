# app/api.py
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from app.models import Aluno, Professor, Coordenador, ModeloDocumento, SolicitacaoEstagio, ParecerTecnico, Relatorio, Apolice, Contrato, AssinaturaDigital
from app.serializers import AlunoSerializer, ProfessorSerializer, CoordenadorSerializer, ModeloDocumentoSerializer, SolicitacaoEstagioSerializer, ParecerTecnicoSerializer, RelatorioSerializer, ApoliceSerializer, ContratoSerializer, AssinaturaDigitalSerializer

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