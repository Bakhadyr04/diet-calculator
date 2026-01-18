# Архитектура приложения

## Активные сущности системы

### 1. Пользователь (User)
- **Роль**: Обычный пользователь системы
- **Функции**:
  - Регистрация и аутентификация
  - Создание расчетов индекса средиземноморской диеты
  - Просмотр истории своих расчетов
  - Просмотр статистики
  - Управление профилем

### 2. Администратор базы данных (Admin)
- **Роль**: Расширенная роль пользователя с правами администратора
- **Функции**:
  - Все функции обычного пользователя
  - Просмотр всех пользователей системы
  - Просмотр всех расчетов
  - Управление данными системы

### 3. API (FastAPI Backend)
- **Роль**: Серверная часть приложения
- **Функции**:
  - Обработка HTTP запросов
  - Аутентификация и авторизация
  - Валидация данных
  - Бизнес-логика расчетов
  - Взаимодействие с базой данных

## Модели данных

### Модели для взаимодействия модулей (Pydantic Schemas)

#### `schemas.UserBase`
- Базовые поля пользователя
- Используется для наследования

#### `schemas.UserCreate`
- Данные для создания пользователя
- Используется в API endpoint регистрации

#### `schemas.UserResponse`
- Данные пользователя для ответа API
- Используется для возврата информации о пользователе

#### `schemas.UserUpdate`
- Данные для обновления пользователя
- Используется в API endpoint обновления профиля

#### `schemas.CalculatorAnswers`
- Входные данные для расчета
- Валидация значений (0-5 для большинства полей)

#### `schemas.CalculationCreate`
- Данные для создания расчета
- Содержит `CalculatorAnswers`

#### `schemas.CalculationResponse`
- Полные данные расчета для ответа
- Включает интерпретацию и исходные данные

#### `schemas.Interpretation`
- Интерпретация результата расчета
- Уровень, описание, рекомендации

#### `schemas.UserStatistics`
- Статистика пользователя
- Количество расчетов, средний индекс, даты

### Модели для записей в БД (SQLAlchemy Models)

#### `models.User`
- Таблица `users`
- Поля:
  - `id`: Primary Key
  - `full_name`: ФИО
  - `birth_date`: Дата рождения
  - `phone`: Телефон
  - `email`: Email (уникальный, индексированный)
  - `hashed_password`: Хеш пароля (опционально)
  - `role`: Роль (user/admin)
  - `created_at`: Дата создания
- Связи:
  - `calculations`: One-to-Many с Calculation

#### `models.Calculation`
- Таблица `calculations`
- Поля:
  - `id`: Primary Key
  - `user_id`: Foreign Key к User
  - `score`: Индекс диеты (0-100)
  - `interpretation`: JSON строка с интерпретацией
  - `calculation_data`: JSON строка с исходными данными
  - `created_at`: Дата создания
- Связи:
  - `user`: Many-to-One с User

## Хранение данных

### База данных
- **По умолчанию**: SQLite (для разработки)
- **Продакшн**: PostgreSQL (рекомендуется)
- **ORM**: SQLAlchemy
- **Миграции**: Alembic (опционально)

### Структура таблиц

#### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### calculations
```sql
CREATE TABLE calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score REAL NOT NULL,
    interpretation TEXT NOT NULL,
    calculation_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Взаимодействие модулей

```
┌─────────────┐
│   Client    │
│ (React Native)
└──────┬──────┘
       │ HTTP/HTTPS
       │
┌──────▼──────────────────┐
│   FastAPI Backend       │
│  ┌──────────────────┐  │
│  │   API Routers     │  │
│  │  - auth           │  │
│  │  - users          │  │
│  │  - calculations    │  │
│  └────────┬───────────┘  │
│           │               │
│  ┌────────▼───────────┐  │
│  │   CRUD Operations   │  │
│  └────────┬───────────┘  │
│           │               │
│  ┌────────▼───────────┐  │
│  │   Business Logic   │  │
│  │  - calculations    │  │
│  └────────┬───────────┘  │
│           │               │
│  ┌────────▼───────────┐  │
│  │   Authentication   │  │
│  │  - JWT Tokens      │  │
│  └────────┬───────────┘  │
└───────────┼───────────────┘
            │
┌───────────▼───────────────┐
│   SQLAlchemy Models       │
│  - User                    │
│  - Calculation             │
└───────────┬───────────────┘
            │
┌───────────▼───────────────┐
│   Database (SQLite/PostgreSQL)
└───────────────────────────┘
```

## Потоки данных

### Регистрация пользователя
1. Client → POST `/api/auth/register` (UserCreate)
2. API → CRUD.create_user()
3. CRUD → Database (INSERT)
4. Database → CRUD (User)
5. CRUD → API (UserResponse)
6. API → Client (UserResponse)

### Создание расчета
1. Client → POST `/api/calculations/` (CalculationCreate + JWT)
2. API → Auth (проверка токена)
3. API → CRUD.create_calculation()
4. CRUD → Utils.calculate_mediterranean_diet_index()
5. CRUD → Utils.interpret_score()
6. CRUD → Database (INSERT)
7. Database → CRUD (Calculation)
8. CRUD → API (CalculationResult)
9. API → Client (CalculationResult)

### Получение истории
1. Client → GET `/api/calculations/` (JWT)
2. API → Auth (проверка токена)
3. API → CRUD.get_calculations_by_user_id()
4. CRUD → Database (SELECT)
5. Database → CRUD (List[Calculation])
6. CRUD → API (List[CalculationResponse])
7. API → Client (List[CalculationResponse])

## Безопасность

### Аутентификация
- JWT токены
- Срок действия: 30 дней
- Алгоритм: HS256

### Авторизация
- Роли: user, admin
- Проверка прав доступа на уровне endpoints
- Защита от несанкционированного доступа к чужим данным

### Валидация
- Pydantic схемы для валидации входных данных
- Проверка типов и диапазонов значений
- Защита от SQL инъекций через ORM
