from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
from ..config import settings


class GigaChatService:
    def __init__(self):
        self.client = GigaChat(
            credentials=settings.GIGACHAT_CREDENTIALS,
            scope="GIGACHAT_API_PERS",
            verify_ssl_certs=False,
        )

    def chat(self, prompt: str) -> str:
        payload = Chat(
            messages=[
                Messages(
                    role=MessagesRole.USER,
                    content=prompt,
                )
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        response = self.client.chat(payload)
        return response.choices[0].message.content

    def analyze_diet(self, prompt: str) -> str:
        return self.chat(prompt)


gigachat_service = GigaChatService()
