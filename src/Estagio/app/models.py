from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
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

class Professor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil_professor"
    )
    def __str__(self):
        return self.user.get_full_name() or self.user.email

    class Meta:
        verbose_name = "Professor"
        verbose_name_plural = "Professores"

    def registrar_parecer(self, relatorio, texto):
        return ParecerTecnico.objects.create(
            professor=self,
            relatorio=relatorio,
            texto=texto
    )
        

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
        ("ENVIADO", "Enviado"),
        ("APROVADO", "Aprovado"),
        ("REJEITADO", "Rejeitado"),
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
    scoreConformidade = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )

    def realizarTriagemAutomatica(self):
        if self.scoreConformidade >= 0.8:
            self.status = "APROVADO"
        else:
            self.status = "EM_REVISAO"
        self.save()


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

    def __str__(self):
        return f"Relatório #{self.id} - {self.status}"

    class Meta:
        verbose_name = "Relatório"
        verbose_name_plural = "Relatórios"


class ParecerTecnico(models.Model):
    professor = models.ForeignKey(
        Professor,
        on_delete=models.CASCADE,
        related_name="pareceres",
    )
    relatorio = models.ForeignKey(
        Relatorio,
        on_delete=models.CASCADE,
        related_name="pareceres"
    )
    texto = models.TextField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        nome = self.professor.user.get_full_name() or self.professor.user.email
        return f"Parecer de {nome} de {self.data:%Y-%m-%d %H:%M}"

    class Meta:
        verbose_name = "Parecer Técnico"
        verbose_name_plural = "Pareceres Técnicos"


class Apolice(DocumentoPreenchido):
    class Meta:
        verbose_name = "Apólice"
        verbose_name_plural = "Apólices"


class Contrato(DocumentoPreenchido):
    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"


class AssinaturaDigital(models.Model):
    dataHora = models.DateTimeField(auto_now_add=True, verbose_name="Data e hora")

    ipAcesso = models.GenericIPAddressField(verbose_name="IP Acesso")

    assinado = models.BooleanField(default=False, verbose_name="Assinado")

    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assinaturas",
        verbose_name="Aluno",
    )

    professor = models.ForeignKey(
        Professor,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assinaturas",
        verbose_name="Professor",
    )

    coordenador = models.ForeignKey(
        Coordenador,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assinaturas",
        verbose_name="Coordenador",
    )

    relatorio = models.ForeignKey(
        Relatorio,
        on_delete=models.CASCADE,
        related_name="assinaturas",
        null=True,
        blank=True,
    )

    apolice = models.ForeignKey(
        Apolice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    contrato = models.ForeignKey(
        Contrato,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    def clean(self):
        
        #Cria duas listas com todos os possiveis signatarios e documentos relacionados
        signatarios = [self.aluno, self.professor, self.coordenador]
        documentos = [self.relatorio, self.apolice, self.contrato]
        
        #conta quantos elementos existem em cada lista
        total_signatarios = sum(1 for s in signatarios if s is not None)

        total_documentos = sum(1 for d in documentos if d is not None)

        #verifica se ha mais de um signatario ou documento
        if total_signatarios != 1:
            raise ValidationError("A assinatura deve ter exatamente um signatário.")
        
        if total_documentos != 1:
            raise ValidationError("A assinatura deve estar ligada a exatamente um documento.")
        
    def save(self, *args, **kwargs):

        #realiza uma verificação completa do objeto, e chama o nosso "clean()" no final
        self.full_clean()

        #acessa o save() do models padrão de django
        super().save(*args, **kwargs)

    def assinar(self):
        self.assinado = True
        self.save()

    class Meta:
        verbose_name = "Assinatura digital"
        verbose_name_plural = "Assinaturas digitais"
