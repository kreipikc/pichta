# Backend проекта PICHTA

Backend часть реализована на Python с использованием FastAPI.

## 🚀 Технологии

- **Framework**: FastAPI
- **Python**: 3.13
- **База данных**: PostgreSQL 15 Alpine
- **Асинхронность**: asyncpg, SQLAlchemy 2.0
- **Сборка проекта**: Docker & Docker-compose
- **Аутентификация**: JWT tokens
- **Документация**: Swagger/OpenAPI (доступно по /docs)

## 🐳 Запуск через Docker
### Предварительные требования
- Docker
- Docker-compose

### 1. Настройка параметров
В корне проекта настройте `.env` с помощью `.env.example`:
```bash
cp .env.example .env
nano .env
```

### 2. Собираем проект
```bash
# Сборка и запуск в фоне
docker-compose up --build -d backend
```

### 3. Готово
Проект работает по умолчанию на http://localhost:8005.

## 📦 Установка и запуск (без Docker)
### Предварительные требования
- Python 3.13+
- PostgreSQL 15+

### 1. Настройка базы данных
Для инициализации таблиц для базы данных используется sql-скрипт, находится он:
```bash
cd pichta/backend/database/postgres/
# File name: 01.init.sql
```

### 2. Настройка параметров
В директории backend настройте `.env` (с помощью `.env.example`):
```bash
cp .env.example ./backend/api/.env
cd ./backend/api/
nano .env
```

### 3. Установка зависимостей
Находимся в `./backend/api/`:
```bash
pip install -r requirements.txt
```

### 4. Запуск backend
Находимся в `./backend/api/`:
```bash
uvicorn main:app --host 0.0.0.0 --port 8005
```

### 5. Готово
Проект запущен локально на порту **8005** и доступен по http://localhost:8005.

## 🏗️ Структура проекта
Повторяющие названия файлы имеют один и тот же функционал (например: admin/schemas.py и education/schemas.py).
```
pichta
├── README.md
├── api     # API часть
│   ├── config.py         # Конфиг с инициализацией настроек
│   ├── database.py       # Все для работы с базой данных (подключение и Model)
│   ├── error.py          # Общий класс для ошибок
│   ├── logger.py         # Настройка и инициализация объекта для логирования
│   ├── main.py           # Точка входа
│   ├── requirements.txt  # Необходимые зависимости для Python
│   ├── routers           # Все сервисы с ручками
│   │   ├── auth                  # Основной сервис для работы с AAA
│   │   │   ├── admin             # Сервис с admin-endpoints
│   │   │   │   ├── router.py     # Все ручки
│   │   │   │   ├── schemas.py    # Pydantic-схемы
│   │   │   │   └── service.py    # Бизнес логика и взаимодействие с БД
│   │   │   ├── ident                   # Сервис для работы с авторизацией и аутентификацией
│   │   │   │   ├── dependencies.py     # Зависимости для авторизации и аутентификации
│   │   │   │   ├── jwt.py              # Класс для работы с JWT
│   │   │   │   ├── responses           # Все возможные ошибки данного сервиса (классификация ошибок)
│   │   │   │   │   ├── http_errors.py  # Классы со всеми видами ошибок сервиса
│   │   │   │   │   └── responses.py    # Класс для инициализации ошибок в проекте
│   │   │   │   ├── router.py.
│   │   │   │   ├── schemas.py
│   │   │   │   ├── service.py
│   │   │   │   └── utils.py            # Дополнительные утилиты для сервиса
│   │   │   └── user
│   │   │       ├── models.py           # ORM-модели
│   │   │       ├── responses
│   │   │       │   ├── http_errors.py
│   │   │       │   └── responses.py
│   │   │       ├── roles.py            # Класс Enum с ролями пользователей
│   │   │       ├── router.py
│   │   │       ├── schemas.py
│   │   │       └── service.py
│   │   ├── education
│   │   │   ├── models.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── experience      # Аналогинчно серсиву education
│   │   ├── for_myself      # Аналогинчно серсиву education
│   │   ├── profession      # Аналогинчно серсиву education
│   │   ├── skill           # Аналогинчно серсиву education
│   │   └── task            # Аналогинчно серсиву education
│   └── utils.py            # Общие утилиты
└── database              # Данные для БД
    └── postgres          # Конкретно для Postgres
        └── 01.init.sql   # SQL-скрипт для инициализации
```

## 📡 API Endpoints
### Auth
- **POST** `/auth/register` - регистрация нового пользователя;
- **POST** `/auth/login` - вход в систему;
- **POST** `/auth/refresh_token` - обновление access-токена с помощью refresh-токена;
- **POST** `/auth/logout` - выход из системы.

### User
- **GET** `/user/me` - получить текущего пользователя;
- **POST** `/user/me` - обновить информацию текущего пользователя;
- **POST** `/user/aboutme` - обновить поле пользователя "Обо мне".

### Admin
- **GET** `/user/getall` - получить список всех пользователей;
- **PUT** `/user/update/{user_id}` - обновить пользователя по id;
- **DELETE** `/user/delete/{user_id}` - удалить пользователя по id.

### For Myself
- **GET** `/me/wanted_prof/add` - добавить желаемою профессию для себя.

### Education
- **GET** `/educ/getall` - получение всех educations;
- **GET** `/educ/get/{education_id}` - получение education по id;
- **POST** `/educ/add` - создание нового education;
- **PUT** `/educ/update/{education_id}` - обновить education по id;
- **DELETE** `/educ/delete/{education_id}` - удалить education по id.

### Experience
- **GET** `/exper/getall` - получение всех experiences;
- **GET** `/exper/get/{experience_id}` - получение experience по id;
- **POST** `/exper/add` - создание новый experience;
- **POST** `/exper/add/{user_id}` - добавить новый experience для пользователя по user_id;
- **PUT** `/exper/update/{experience_id}` - обновить experience по id;
- **DELETE** `/exper/delete/{experience_id}` - удалить experience по id.

### Profession
- **GET** `/prof/getall` - получение всех professions;
- **GET** `/prof/get/{profession_id}` - получение profession по id;
- **POST** `/prof/add` - создание нового profession;
- **PUT** `/prof/update/{profession_id}` - обновить profession по id;
- **DELETE** `/prof/delete/{profession_id}` - удалить profession по id.

### Skills
- **GET** `/skill/getall` - получение всех skills;
- **GET** `/skill/get/` - получение skill по id (в JSON);
- **POST** `/skill/add` - создание нового skill;
- **PUT** `/skill/update/{skill_id}` - обновить skill по id;
- **DELETE** `/skill/delete/{skill_id}` - удалить skill по id.

### Tasks
- **GET** `/task/getall` - получение всех tasks;
- **GET** `/task/get/{task_id}` - получение task по id;
- **POST** `/task/add` - создание нового task;
- **PUT** `/task/update/{task_id}` - обновить task по id;
- **DELETE** `/task/delete/{task_id}` - удалить task по id.

## 📊 Переменные окружения
| Переменная                  | Описание                            | По умолчанию                                |
| --------------------------- | ----------------------------------- | ------------------------------------------- |
| POSTGRES_USER               | Имя пользователя Postgres           | postgres                                    |
| POSTGRES_PASSWORD           | Пароль от пользователя Postgres     | postgrespass                                |
| POSTGRES_DB                 | Имя базы данных в Postgres          | testdb                                      |
| SECRET_KEY_JWT              | Секрет для JWT                      | example_jwt_secret_key                      |
| ALGORITHM                   | Алгоритм для генерации JWT          | HS256                                       |
| ACCESS_TOKEN_EXPIRE_MINUTES | Время жизни access-токена в минутах | 30                                          |
| REFRESH_TOKEN_EXPIRE_DAYS   | Время жизни refresh-токена в днях   | 30                                          |
| FRONTEND_URL_ARRAY          | Список URL frontend для CORS        | http://127.0.0.1:8085,http://localhost:8085 |

