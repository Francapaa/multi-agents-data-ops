from authlib.integrations.starlette_client import OAuth


oauth = OAuth()

class auth_service:
    async def authenticate_google_user(self, code: str):
        oauth.register(
            name="google",
            client_id="",
            client_secret="",
            server_metadata_url="",
            client_kwargs=
        )