from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from .database import engine, Base
from .config import settings
from .routers import auth, users, calculations, drafts

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

# Создание приложения FastAPI
app = FastAPI(
    title="Diet Calculator API",
    description="API для калькулятора средиземноморской диеты",
    version="1.0.0"
)

# Настройка CORS
# Если CORS_ORIGINS содержит "*", преобразуем в список
cors_origins = settings.CORS_ORIGINS
if isinstance(cors_origins, str) and cors_origins == "*":
    cors_origins = ["*"]
elif isinstance(cors_origins, list) and "*" in cors_origins:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Явная обработка OPTIONS запросов для всех путей
@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    """Обработка OPTIONS запросов для CORS preflight"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

# Подключение роутеров
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(calculations.router, prefix="/api")
app.include_router(drafts.router, prefix="/api")


@app.get("/")
def read_root():
    """Корневой endpoint"""
    return {
        "message": "Diet Calculator API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Проверка здоровья API"""
    return {"status": "healthy"}
