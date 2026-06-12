# app/serializers.py
from rest_framework import serializers
from .models import Aluno, Professor, Coordenador, ModeloDocumento, SolicitacaoEstagio, ParecerTecnico, Relatorio, Apolice, Contrato, AssinaturaDigital

class AlunoSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Aluno
        fields = ['id', 'user', 'matricula', 'nome', 'email']
        read_only_fields = ['id']

class ProfessorSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Professor
        fields = ['id', 'user', 'nome', 'email']
        read_only_fields = ['id']

class CoordenadorSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Coordenador
        fields = ['id', 'user', 'nome', 'email']
        read_only_fields = ['id']

class ModeloDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloDocumento
        fields = ['id', 'titulo', 'arquivoUrl', 'campos_dinamicos']
        read_only_fields = ['id']

class SolicitacaoEstagioSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoEstagio
        fields = ['id', 'aluno', 'data', 'status', 'motivo_retificacao', 'avaliador']
        read_only_fields = ['id', 'data']

class ParecerTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParecerTecnico
        fields = ['id', 'professor', 'relatorio', 'texto', 'data']
        read_only_fields = ['id', 'data']

class RelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relatorio
        fields = ['id', 'solicitacao', 'arquivo', 'dataEnvio', 'scoreConformidade', 'status', 'conceitoFinal', 'motivo_rejeicao', 'dados']
        read_only_fields = ['id', 'dataEnvio']

class ApoliceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apolice
        fields = ['id', 'solicitacao', 'arquivo', 'dataEnvio', 'scoreConformidade', 'status']
        read_only_fields = ['id', 'dataEnvio']

class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = ['id', 'solicitacao', 'arquivo', 'dataEnvio', 'scoreConformidade', 'status', 'motivo_rejeicao', 'dados']
        read_only_fields = ['id', 'dataEnvio']

class AssinaturaDigitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssinaturaDigital
        fields = ['id', 'dataHora', 'ipAcesso', 'assinado', 'aluno', 'professor', 'coordenador', 'relatorio', 'apolice', 'contrato']
        read_only_fields = ['id', 'dataHora']

