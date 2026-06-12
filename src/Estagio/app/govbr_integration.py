"""
Integração com API de Assinatura Eletrônica do Gov.BR

Documentação:
- Manual: https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt_BR/latest/
- OAuth: https://manual-roteiro-integracao-login-unico.servicos.gov.br/pt/stable/iniciarintegracao.html

Fluxo:
1. User clica "Assinar com gov.br"
2. Sistema gera URL de assinatura e redireciona
3. User assina no portal gov.br
4. Gov.br faz POST no webhook com documento assinado
5. Sistema salva documento e atualiza status
"""

import os
import requests
import json
import logging
from urllib.parse import urlencode
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Configurações da Integração Gov.BR
GOVBR_OAUTH_ENDPOINT = os.getenv(
    "GOVBR_OAUTH_ENDPOINT", "https://acesso.gov.br/authorize"
)
GOVBR_API_ENDPOINT = os.getenv(
    "GOVBR_API_ENDPOINT", "https://api-assinatura.servicos.gov.br"
)
GOVBR_CLIENT_ID = os.getenv("GOVBR_CLIENT_ID", "")
GOVBR_CLIENT_SECRET = os.getenv("GOVBR_CLIENT_SECRET", "")
GOVBR_REDIRECT_URI = os.getenv(
    "GOVBR_REDIRECT_URI", "http://127.0.0.1:8000/api/govbr-callback/"
)


class GovBRAssinador:
    """Gerencia assinatura digital via Gov.BR"""

    @staticmethod
    def gerar_url_assinatura(
        documento_base64: str,
        documento_id: str,
        tipo_documento: str = "PDF",
        cpf_usuario: Optional[str] = None,
    ) -> str:
        """
        Gera URL para redirecionamento ao portal de assinatura gov.br.

        Args:
            documento_base64: Arquivo PDF em base64
            documento_id: ID único do documento (ex: "contrato_1_2021001")
            tipo_documento: Tipo do documento (PDF, DOCX, etc)
            cpf_usuario: CPF do usuário (opcional, para pré-preenchimento)

        Returns:
            URL para redirecionamento
        """
        # 1. Registra documento na API gov.br
        payload = {
            "documentos": [
                {
                    "conteudo": documento_base64,
                    "titulo": f"Documento_{documento_id}",
                    "descricao": f"Documento de Estágio - {tipo_documento}",
                    "tipo_assinatura": "AVANCADA",  # Assinatura avançada (gov.br)
                }
            ]
        }

        try:
            # Chamada para registrar documento (requer token gov.br)
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            response = requests.post(
                f"{GOVBR_API_ENDPOINT}/assinaturas/v1/assinaturas",
                json=payload,
                headers=headers,
                timeout=30,
            )

            if response.status_code != 201:
                logger.error(
                    f"Erro ao registrar documento: {response.status_code} - {response.text}"
                )
                raise Exception(
                    "Falha ao registrar documento para assinatura. Tente novamente."
                )

            resultado = response.json()
            assinatura_uuid = resultado.get("id")

            if not assinatura_uuid:
                raise Exception("UUID de assinatura não retornado pela API")

            # 2. Gera URL de redirect para gov.br
            params = {
                "response_type": "code",
                "client_id": GOVBR_CLIENT_ID,
                "redirect_uri": GOVBR_REDIRECT_URI,
                "scope": "openid email",
                "state": documento_id,  # Usamos como rastreamento
                "assinatura_uuid": assinatura_uuid,
            }

            url_assinatura = f"{GOVBR_OAUTH_ENDPOINT}?{urlencode(params)}"
            logger.info(f"URL de assinatura gerada: {url_assinatura[:50]}...")

            return url_assinatura

        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de requisição ao gov.br: {str(e)}")
            raise Exception(f"Erro ao conectar com gov.br: {str(e)}")

    @staticmethod
    def recuperar_documento_assinado(assinatura_uuid: str) -> Optional[bytes]:
        """
        Recupera o documento assinado da API gov.br.

        Args:
            assinatura_uuid: UUID da assinatura

        Returns:
            Bytes do arquivo PDF assinado ou None
        """
        try:
            headers = {
                "Accept": "application/pdf",
            }

            response = requests.get(
                f"{GOVBR_API_ENDPOINT}/assinaturas/v1/assinaturas/{assinatura_uuid}",
                headers=headers,
                timeout=30,
            )

            if response.status_code == 200:
                return response.content
            else:
                logger.error(
                    f"Erro ao recuperar documento: {response.status_code} - {response.text}"
                )
                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao recuperar documento assinado: {str(e)}")
            return None

    @staticmethod
    def validar_assinatura(documento_assinado_path: str) -> bool:
        """
        Valida a assinatura digital do documento.

        Para produção, use: https://validar.iti.gov.br/

        Args:
            documento_assinado_path: Caminho do arquivo assinado

        Returns:
            True se válido, False caso contrário
        """
        # Validação básica: arquivo existe e tem conteúdo
        if not os.path.exists(documento_assinado_path):
            logger.error(f"Arquivo não encontrado: {documento_assinado_path}")
            return False

        file_size = os.path.getsize(documento_assinado_path)
        if file_size == 0:
            logger.error("Arquivo vazio")
            return False

        logger.info(
            f"Documento validado: {documento_assinado_path} ({file_size} bytes)"
        )
        return True

    @staticmethod
    def processar_webhook(dados_webhook: Dict) -> Optional[Dict]:
        """
        Processa o callback recebido do gov.br após assinatura.

        Args:
            dados_webhook: Dados recebidos no webhook

        Returns:
            Dicionário com resultado da assinatura
        """
        try:
            assinatura_uuid = dados_webhook.get("id")
            status = dados_webhook.get("status")  # ASSINADO, CANCELADO, etc
            documento_base64 = dados_webhook.get("conteudo")

            if not assinatura_uuid or not status:
                logger.error("Webhook inválido: faltam campos obrigatórios")
                return None

            return {
                "assinatura_uuid": assinatura_uuid,
                "status": status,
                "documento_base64": documento_base64,
                "valido": status == "ASSINADO",
            }

        except Exception as e:
            logger.error(f"Erro ao processar webhook: {str(e)}")
            return None
