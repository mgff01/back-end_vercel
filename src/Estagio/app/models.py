from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Aluno(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil_aluno"
    )
    matricula = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.email

    class Meta:
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"

    def anexar_documento_gerado(self, solicitacao, classe_documento, nome_arquivo, arquivo_em_memoria, **kwargs):
        """
        Recebe um arquivo gerado internamente pelo sistema (docxtpl) e vincula 
        à solicitação de estágio do aluno.
        """
        # Trava de segurança mantida
        if solicitacao.aluno != self:
            raise ValueError("O aluno só pode vincular documentos às suas próprias solicitações.")

        # Cria a instância (Contrato, Relatorio ou Apolice) sem salvar o arquivo ainda
        novo_documento = classe_documento(
            solicitacao=solicitacao,
            **kwargs 
        )
        
        # O Django salva o arquivo físico e o registro no banco ao mesmo tempo usando o método .save() do FileField
        novo_documento.arquivo.save(nome_arquivo, arquivo_em_memoria)
        
        return novo_documento
class Coordenador(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil_coordenador"
    )
    def __str__(self):
        return self.user.get_full_name() or self.user.email

    class Meta:
        verbose_name = "Coordenador"
        verbose_name_plural = "Coordenadores"

    def aprovar(self, solicitacao):
        solicitacao.status = SolicitacaoEstagio.STATUS_APROVADO
        solicitacao.avaliador = self
        solicitacao.save()

    def rejeitar(self, solicitacao):
        solicitacao.status = SolicitacaoEstagio.STATUS_REJEITADO
        solicitacao.avaliador = self
        solicitacao.save()

    def solicitar_retificacao(self, solicitacao, motivo):
        solicitacao.status = SolicitacaoEstagio.STATUS_RETIFICACAO
        solicitacao.motivo_retificacao = motivo
        solicitacao.avaliador = self
        solicitacao.save()


class ModeloDocumento(models.Model):
    titulo = models.CharField(max_length=100)
    arquivoUrl = models.FileField(upload_to="modelos/")
    campos_dinamicos = models.JSONField(
        default=list,
        help_text="Exemplo: [{'id': 'nome_empresa', 'label': 'Nome da Empresa', 'tipo': 'text'}, {'id': 'carga_horaria', 'label': 'Carga Horária (h)', 'tipo': 'number'}]"
    )

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = "Modelo de Documento"
        verbose_name_plural = "Modelos de Documentos"

    def baixarModelo(self):
        """
        Retorna o arquivo do modelo.
        Em uma view, você pode usar self.arquivoUrl.url.
        """
        if not self.arquivoUrl:
            return None

        self.arquivoUrl.open("rb")
        return self.arquivoUrl


class SolicitacaoEstagio(models.Model):
    STATUS_PENDENTE = "PENDENTE"
    STATUS_APROVADO = "APROVADO"
    STATUS_REJEITADO = "REJEITADO"
    STATUS_RETIFICACAO = "RETIFICACAO_SOLICITADA"

    STATUS_CHOICES = [
        (STATUS_PENDENTE, "Pendente"),
        (STATUS_APROVADO, "Aprovado"),
        (STATUS_REJEITADO, "Rejeitado"),
        (STATUS_RETIFICACAO, "Retificação solicitada"),
    ]

    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name="solicitacoes",
    )
    data = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDENTE
    )
    motivo_retificacao = models.TextField(blank=True, null=True)
    avaliador = models.ForeignKey(
        Coordenador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="solicitacoes_avaliadas",
    )

    def __str__(self):
         return f"Solicitação #{self.id} feita por {self.aluno.user.get_full_name() or self.aluno.user.email} - {self.status}"
    
    class Meta:
        verbose_name = "Solicitação de Estágio"
        verbose_name_plural = "Solicitações de Estágio"


class DocumentoPreenchido(models.Model):
    STATUS_CHOICES = [
        ("GERADO", "Gerado"),
        ("ENVIADO", "Enviado"),
        ("EM_ASSINATURA", "Em assinatura"),
        ("APROVADO", "Aprovado"),
        ("REJEITADO", "Rejeitado"),
        ("CONCLUIDA", "Concluída"),
        ("EM_REVISAO", "Em revisão"),
    ]

    solicitacao = models.ForeignKey(
        SolicitacaoEstagio,
        on_delete=models.CASCADE,
        related_name="%(class)s_documentos",
    )

    arquivo = models.FileField(upload_to="documentos_estagio/")
    dataEnvio = models.DateTimeField(auto_now_add=True)
    scoreConformidade = models.FloatField(default=0.0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="ENVIADO")
    dados = models.JSONField(
        default=dict,
        blank=True,
        help_text="Respostas do formulário usadas para gerar o documento (base das análises).",
    )
    modelo_origem = models.ForeignKey(
        'ModeloDocumento', # Usamos string porque a classe ModeloDocumento foi definida acima
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Registra qual modelo dinâmico gerou este documento."
    )
    
    class Meta:
        abstract = True

    # Adição dos validadores de mínimo (0.0) e máximo (1.0)
    #scoreConformidade = models.FloatField(
    #    default=0.0,
    #    validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    #)

    #def realizarTriagemAutomatica(self):
    #    if self.scoreConformidade >= 0.8:
    #        self.status = "APROVADO"
    #    else:
    #        self.status = "EM_REVISAO"
    #    self.save()


class Relatorio(DocumentoPreenchido):
# Definindo as opções de avaliação em constantes
    CONCEITO_CHOICES = [
        ("APROVADO", "Aprovado"),
        ("REPROVADO", "Reprovado"),
        ("APROVADO_RESSALVAS", "Aprovado com ressalvas"),
    ]

    # Aplicando as opções ao campo
    conceitoFinal = models.CharField(
        max_length=30,
        choices=CONCEITO_CHOICES,
        null=True,
        blank=True,
        verbose_name="Conceito Final"
    )

    motivo_rejeicao = models.TextField(
        blank=True,
        null=True,
        verbose_name="Motivo da rejeição",
        help_text="Preenchido quando o coordenador rejeita o relatório.",
    )

    def __str__(self):
        return f"Relatório #{self.id} - {self.status}"

    class Meta:
        verbose_name = "Relatório"
        verbose_name_plural = "Relatórios"
class Apolice(DocumentoPreenchido):
    class Meta:
        verbose_name = "Apólice"
        verbose_name_plural = "Apólices"


class Contrato(DocumentoPreenchido):
    motivo_rejeicao = models.TextField(
        blank=True,
        null=True,
        verbose_name="Motivo da rejeição",
        help_text="Preenchido quando o coordenador rejeita o documento.",
    )

    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"
