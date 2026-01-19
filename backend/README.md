# Diet Calculator Backend API

FastAPI бэкенд для калькулятора средиземноморской диеты.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` со следующим содержимым:
```env
# Database
DATABASE_URL=sqlite:///./diet_calculator.db

# Security
SECRET_KEY=your-secret-key-change-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# CORS (comma-separated list)
CORS_ORIGINS=*

# Admin (optional)
# ADMIN_EMAIL=admin@example.com
# ADMIN_PASSWORD=admin_password
```

**Важно**: Замените `SECRET_KEY` на случайную строку для безопасности!

## Запуск

### Вариант 1: Через uvicorn напрямую
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Вариант 2: Через скрипт run.py
```bash
python run.py
```

API будет доступен по адресу: http://localhost:8000

Документация API (Swagger): http://localhost:8000/docs

## Создание администратора

Для создания администратора используйте скрипт:
```bash
python init_admin.py <email> <password> [full_name]
```

Пример:
```bash
python init_admin.py admin@example.com admin123 "Администратор"
```

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Главный файл приложения
│   ├── config.py            # Конфигурация
│   ├── database.py          # Настройка БД
│   ├── models.py            # SQLAlchemy модели
│   ├── schemas.py           # Pydantic схемы
│   ├── auth.py              # Аутентификация и авторизация
│   ├── crud.py              # CRUD операции
│   ├── routers/             # API роутеры
│   │   ├── __init__.py
│   │   ├── auth.py          # Аутентификация
│   │   ├── users.py         # Пользователи
│   │   └── calculations.py  # Расчеты
│   └── utils/
│       └── calculations.py  # Логика расчетов
├── requirements.txt
└── README.md
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Пользователи
- `GET /api/users/me` - Информация о текущем пользователе
- `GET /api/users/me/statistics` - Статистика пользователя
- `PUT /api/users/me` - Обновление профиля

### Расчеты
- `POST /api/calculations/` - Создание расчета
- `GET /api/calculations/` - История расчетов
- `GET /api/calculations/{id}` - Получение расчета по ID

### Администратор
- `GET /api/users/` - Список всех пользователей
- `GET /api/calculations/admin/all` - Все расчеты

## Модели данных

### User (Пользователь)
- `id`: ID пользователя
- `full_name`: ФИО
- `birth_date`: Дата рождения
- `phone`: Телефон
- `email`: Email (уникальный)
- `hashed_password`: Хеш пароля
- `role`: Роль (user/admin)
- `created_at`: Дата создания

### Calculation (Расчет)
- `id`: ID расчета
- `user_id`: ID пользователя
- `score`: Индекс диеты (0-100)
- `interpretation`: Интерпретация (JSON)
- `calculation_data`: Данные расчета (JSON)
- `created_at`: Дата создания

## Аутентификация

API использует JWT токены для аутентификации. После входа вы получите токен, который нужно передавать в заголовке:

```
Authorization: Bearer <token>
```

## База данных

По умолчанию используется SQLite. Для продакшена рекомендуется использовать PostgreSQL.

Для изменения БД отредактируйте `DATABASE_URL` в `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/diet_calculator
```

## Интеграция с GigaChat

Приложение использует GigaChat API для анализа диеты и генерации персонализированных рекомендаций.

### Настройка GigaChat

1. Получите API токен на [developers.sber.ru](https://developers.sber.ru/)
2. Добавьте в `.env`:
```
GIGACHAT_CREDENTIALS=your-token-here
```

3. Перезапустите бэкенд

Подробная инструкция в файле `GIGACHAT_SETUP.md`

**Примечание:** Если GigaChat API недоступен, система автоматически использует локальный алгоритм расчета.
