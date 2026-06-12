from django.contrib import admin
from .models import (
    Aluno,
<<<<<<< HEAD
    Professor,
    Coordenador,
    ModeloDocumento,
    SolicitacaoEstagio,
    ParecerTecnico,
    Relatorio,
    Apolice,
    Contrato,
    AssinaturaDigital,
)

admin.site.register(Aluno)
admin.site.register(Professor)
admin.site.register(Coordenador)
admin.site.register(ModeloDocumento)
admin.site.register(SolicitacaoEstagio)
admin.site.register(ParecerTecnico)
admin.site.register(Relatorio)
admin.site.register(Apolice)
admin.site.register(Contrato)
admin.site.register(AssinaturaDigital)
=======
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
>>>>>>> upstream/main
