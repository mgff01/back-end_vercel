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

    def test_acesso_modelos_documento_anonimo_permitido(self):
        """
        Garante que usuários anônimos conseguem consultar os modelos de documento.
        """
        response = self.client.get('/api/modelos-documento/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_acesso_modelos_media_anonimo_permitido(self):
        """
        Garante que usuários anônimos conseguem baixar os arquivos na pasta modelos/.
        """
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        # Cria um arquivo temporário na pasta modelos/
        file_path = 'modelos/teste_contrato.docx'
        default_storage.save(file_path, ContentFile(b"conteudo do modelo"))
        
        try:
            response = self.client.get(f'/media/{file_path}')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.getvalue(), b"conteudo do modelo")
        finally:
            try:
                default_storage.delete(file_path)
            except NotImplementedError:
                pass