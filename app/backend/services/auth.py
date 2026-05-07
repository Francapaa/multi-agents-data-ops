from authlib.integrations.starlette_client import OAuth


oauth = OAuth()


class auth_service:
    async def authenticate_google_user(self, code: str):
        callback_request = 