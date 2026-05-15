# app/serializers.py
from rest_framework import serializers
from app.models import Aluno, Professor, Coordenador, ModeloDocumento, SolicitacaoEstagio, ParecerTecnico, Relatorio, Apolice, Contrato, AssinaturaDigital

class AlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aluno
        fields = ['id', 'matricula', 'nome', 'email', 'senhaInstitucional']
        read_only_fields = ['id']

class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = ['id', 'nome', 'email', 'senhaInstitucional']
        read_only_fields = ['id']

class CoordenadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordenador
        fields = ['id', 'nome', 'email', 'senhaInstitucional']
        read_only_fields = ['id']

class ModeloDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloDocumento
        fields = ['id', 'titulo', 'arquivoUrl', 'aluno']
        read_only_fields = ['id']

class SolicitacaoEstagioSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoEstagio
        fields = ['id', 'aluno', 'data', 'status', 'motivo_retificacao', 'avaliador']
        read_only_fields = ['id', 'data']

class ParecerTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParecerTecnico
        fields = ['id', 'professor', 'texto', 'data']
        read_only_fields = ['id', 'data']

class RelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relatorio
        fields = ['id', 'solicitacao', 'dataEnvio', 'scoreConformidade', 'status', 'conceitoFinal']
        read_only_fields = ['id', 'dataEnvio']

class ApoliceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apolice
        fields = ['id', 'solicitacao', 'dataEnvio', 'scoreConformidade', 'status']
        read_only_fields = ['id', 'dataEnvio']

class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = ['id', 'solicitacao', 'dataEnvio', 'scoreConformidade', 'status']
        read_only_fields = ['id', 'dataEnvio']

class AssinaturaDigitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssinaturaDigital
        fields = ['idAssinatura', 'dataHora', 'ipAcesso', 'assinado', 'aluno', 'professor', 'coordenador', 'relatorio', 'apolice', 'contrato']
        read_only_fields = ['idAssinatura', 'dataHora']

