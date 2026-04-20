# Backend проекта PICHTA

Backend часть реализована на Python с использованием FastAPI.

## 🚀 Технологии

- **Framework**: FastAPI
- **Python**: 3.13
- **База данных**: PostgreSQL 15 Alpine
- **Асинхронность**: asyncpg, SQLAlchemy 2.0
- **Сборка проекта**: Docker & Docker-compose
- **Аутентификация**: JWT tokens
- **Тестирование**: pytest, pytest-asyncio, pytest-anyio (unit-тесты в каталоге `api/tests/`)
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
Одинаковые названия файлов в разных модулях имеют один и тот же функционал (например: `admin/schemas.py` и `education/schemas.py`).
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
│   ├── pytest.ini        # Настройки pytest (в т.ч. пути импорта для тестов)
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
│   │   │   │   ├── router.py
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
│   │   ├── experience      # Аналогично сервису education
│   │   ├── for_myself      # Аналогично сервису education
│   │   ├── graphs          # Граф профессий и выгрузка навыков
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── profession      # Аналогично сервису education
│   │   ├── courser         # Модели и схемы курсов (связка со skill)
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   ├── skill           # Аналогично сервису education
│   │   └── task            # Аналогично сервису education
│   ├── tests           # Все backend тесты
│   │   ├── unit        # Unit-тесты (зеркало по модулям)
│   │   │   ├── test_utils.py
│   │   │   ├── auth                # Тесты для модуля auth
│   │   │   │   ├── test_jwt.py
│   │   │   │   ├── test_utils.py
│   │   │   │   └── ...
│   │   │   ├── graphs              # Тесты для модуля graph
│   │   │   │   └── test_service.py
│   │   │   ├── task                # Тесты для модуля task
│   │   │   │   └── test_service.py
│   │   │   └── ...                 # Все модули аналогично
│   │   └── ...           # Остальные типы тестов аналогично (при наличии)
│   └── utils.py          # Общие утилиты
└── database              # Данные для БД и вспомогательные скрипты
    ├── postgres          # SQL-скрипты инициализации Postgres
    │   ├── 01.init.sql   # Первичная инициализация схемы и таблиц
    │   └── 02.init.sql   # Дополнительные изменения схемы / данных (AGE)
    └── graphs_cmd        # Скрипты для графа (AGE): проверка и деплой БД
        ├── README.md     # Описание сценариев для каталога
        ├── check_db.py   # Проверка состояния БД / графа
        ├── deploy_db.py  # Деплой / применение изменений к БД
        └── requirements.txt  # Зависимости Python для скриптов каталога
```

## 🧪 Тестирование

Запуск тестов выполняется из каталога **`backend/api/`** (там же, где `main.py` и `requirements.txt`), чтобы корректно резолвились импорты вида `from utils import ...`, `from routers...`.

Запуск **одного файла** с тестами — команда `pytest` и относительный путь к файлу от текущей директории `backend/api/`:

```bash
cd backend/api
pytest tests/unit/test_utils.py
```

Другие примеры:

```bash
pytest tests/unit/auth/test_jwt.py
pytest tests/unit/task/test_service.py
pytest tests/unit/graphs/test_service.py
```

Запуск всех unit-тестов в каталоге:

```bash
pytest tests/unit/
```

## 📡 API Endpoints
### Auth
- **POST** `/auth/register` - регистрация нового пользователя;
- **POST** `/auth/login` - вход в систему;
- **POST** `/auth/refresh_token` - обновление access-токена с помощью refresh-токена;
- **POST** `/auth/logout` - выход из системы;
- **POST** `/auth/change_pass` - смена пароля текущего пользователя.

### User
- **GET** `/user/me` - получить текущего пользователя;
- **POST** `/user/aboutme` - обновить поле пользователя "Обо мне";
- **GET** `/user/get/role` - получить роль текущего пользователя.

### Admin
- **GET** `/user/getall` - получить список всех пользователей;
- **PUT** `/user/update/{user_id}` - обновить пользователя по id;
- **DELETE** `/user/delete/{user_id}` - удалить пользователя по id.

### For Myself
- **GET** `/me/wanted_prof/getall/{user_id}` - получить желаемые профессии пользователя по `user_id`;
- **POST** `/me/wanted_prof/add` - добавить желаемые профессии для себя.

### Graphs
- **GET** `/graph/get/{prof_id}?user_id={user_id}` - получить иерархию графа профессии для пользователя;
- **GET** `/graph/get/{prof_id}/gantt?user_id={user_id}` - навыки по статусам (complete, process, inactive, gray_zone) для графа и пользователя.

### Education
- **GET** `/educ/getall/{user_id}` - получение всех educations пользователя по `user_id`;
- **GET** `/educ/get/{education_id}?user_id={user_id}` - получение education по id для пользователя;
- **POST** `/educ/add/{user_id}` - создание нового education для пользователя;
- **PUT** `/educ/update/{education_id}?user_id={user_id}` - обновить education по id;
- **DELETE** `/educ/delete/{education_id}?user_id={user_id}` - удалить education по id.

### Experience
- **GET** `/exper/getall/{user_id}` - получение всех experiences пользователя по `user_id`;
- **GET** `/exper/get/{experience_id}?user_id={user_id}` - получение experience по id для пользователя;
- **POST** `/exper/add` - создание нового experience для текущего пользователя;
- **POST** `/exper/add/{user_id}` - добавить новый experience для пользователя по `user_id`;
- **PUT** `/exper/update/{experience_id}?user_id={user_id}` - обновить experience по id;
- **DELETE** `/exper/delete/{experience_id}?user_id={user_id}` - удалить experience по id.

### Profession
- **GET** `/prof/getall` - получение всех professions;
- **GET** `/prof/get/{profession_id}` - получение profession по id;
- **POST** `/prof/add` - создание нового profession;
- **PUT** `/prof/update/{profession_id}` - обновить profession по id;
- **DELETE** `/prof/delete/{profession_id}` - удалить profession по id.

### Skills
- **GET** `/skill/getall` - получение всех skills (справочник);
- **GET** `/skill/getall/{user_id}` - получение всех skills пользователя по `user_id`;
- **GET** `/skill/get/{skill_id}?user_id={user_id}` - получение skill пользователя по `skill_id`;
- **GET** `/skill/get/{skill_id}/courses` - курсы, привязанные к skill;
- **GET** `/skill/get/{user_id}/process` - skills пользователя в статусе process;
- **POST** `/skill/add` - добавить skills себе;
- **POST** `/skill/add/{user_id}` - добавить skills пользователю (admin);
- **PUT** `/skill/update/{skill_id}?user_id={user_id}` - обновить skill пользователя;
- **DELETE** `/skill/delete/{skill_id}?user_id={user_id}` - удалить skill у пользователя.

### Tasks
- **GET** `/task/getall/{user_id}` - получение всех tasks пользователя по `user_id`;
- **GET** `/task/get/{task_id}` - получение task по id;
- **POST** `/task/add` - создание task для себя;
- **POST** `/task/add/{user_id}` - создание task для другого пользователя;
- **PUT** `/task/update/{task_id}?user_id={user_id}` - обновить task по id;
- **DELETE** `/task/delete/{task_id}?user_id={user_id}` - удалить task по id.

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

