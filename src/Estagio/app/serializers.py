# app/serializers.py
from rest_framework import serializers
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


class AlunoSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Aluno
        fields = ["id", "user", "matricula", "nome", "email"]
        read_only_fields = ["id"]


class CoordenadorSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Coordenador
        fields = ["id", "user", "nome", "email"]
        read_only_fields = ["id"]


class ModeloDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloDocumento
        fields = ["id", "titulo", "arquivoUrl", "campos_dinamicos"]
        read_only_fields = ["id"]


class ValidarDadosDocumentoSerializer(serializers.Serializer):
    """Valida os dados enviados antes de gerar o documento"""

    dados = serializers.JSONField()

    def validate_dados(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Os dados devem ser um objeto válido.")
        # Regras de validação por tipo de campo
        required_fields = {
            "contrato": ["nome_empresa", "cnpj_empresa", "carga_horaria"],
            "relatorio": ["empresa", "gestor_nome", "avaliacao_geral"],
        }

        tipo = self.context.get("tipo", "contrato")

        for field in required_fields.get(tipo, []):
            if not value.get(field) or not str(value.get(field)).strip():
                raise serializers.ValidationError(f"O campo '{field}' é obrigatório.")

        if "cnpj_empresa" in value:
            cnpj = (
                value["cnpj_empresa"].replace(".", "").replace("/", "").replace("-", "")
            )
            if not cnpj.isdigit() or len(cnpj) != 14:
                raise serializers.ValidationError("CNPJ inválido")

        return value


class SolicitacaoEstagioSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoEstagio
        fields = ["id", "aluno", "data", "status", "motivo_retificacao", "avaliador"]
        read_only_fields = ["id", "data"]


class RelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relatorio
        fields = [
            "id",
            "solicitacao",
            "arquivo",
            "dataEnvio",
            "scoreConformidade",
            "status",
            "conceitoFinal",
            "motivo_rejeicao",
            "dados",
        ]
        read_only_fields = ["id", "dataEnvio"]


class RelatorioIntermediarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatorioIntermediario
        fields = [
            "id",
            "solicitacao",
            "mes",
            "arquivo",
            "dataEnvio",
            "status",
            "feedback_coordenador",
        ]
        read_only_fields = ["id", "dataEnvio"]


class ApoliceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apolice
        fields = [
            "id",
            "solicitacao",
            "arquivo",
            "dataEnvio",
            "scoreConformidade",
            "status",
        ]
        read_only_fields = ["id", "dataEnvio"]


class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = ['id', 'solicitacao', 'arquivo', 'dataEnvio', 'scoreConformidade', 'status', 'motivo_rejeicao', 'dados']
        read_only_fields = ['id', 'dataEnvio']
