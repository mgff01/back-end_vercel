from rest_framework.test import APITestCase
from rest_framework import status

from django.test import override_settings

@override_settings(SECURE_SSL_REDIRECT=False)
class SegurancaAPITests(APITestCase):
    
    def test_acesso_anonimo_bloqueado(self):
        """
        Garante que usuários sem Token JWT não conseguem acessar a API de solicitações.
        """
        # Simulamos uma requisição de alguém sem login
        response = self.client.get('/api/solicitacoes-estagio/')
        
        # O sistema TEM que retornar o erro 401 (Não Autorizado)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_acesso_arquivos_media_bloqueado(self):
        """
        Garante que usuários anônimos não conseguem baixar PDFs diretamente pela URL.
        """
        # Tentativa de acessar um arquivo qualquer na rota media
        response = self.client.get('/media/contrato_secreto.pdf')
        
        # Como o usuário não tem token, a nossa ProtectedMediaView deve barrar
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)