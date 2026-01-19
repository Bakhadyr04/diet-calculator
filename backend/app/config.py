from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    CORS_ORIGINS: list[str]

    # admin
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None

    # gigachat
    GIGACHAT_CREDENTIALS: str

    class Config:
        env_file = ".env"
        extra = "forbid"  # можно оставить

settings = Settings()
