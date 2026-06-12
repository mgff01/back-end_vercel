from django.contrib import admin
from .models import (
    Aluno,
    Coordenador,
    ModeloDocumento,
    SolicitacaoEstagio,
    Relatorio,
    Apolice,
    Contrato,
)

admin.site.register(Aluno)
admin.site.register(Coordenador)
admin.site.register(ModeloDocumento)
admin.site.register(SolicitacaoEstagio)
admin.site.register(Relatorio)
admin.site.register(Apolice)
admin.site.register(Contrato)
