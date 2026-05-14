## Как JSON граф отправить в БД?
Для этого используется python скрипт `deploy_db.py` в текущей директории (нужно убедиться что нужные библиотеки установлены).

Для настройки необходимо перейти в файл и поменять настройки в константах, 
а именно:
```python
# Заменить на свои данные от PostgreSQL
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgrespass"
POSTGRES_DB = "testdb"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432
```

Есть 2 способа запустить сркипт:
```bash
python deploy_db.py --file <path>  # обработать конкретный json файл
python deploy_db.py --dir <path>   # обработать все JSON файлы в директории
```

### Примечание
Создались необходимые профессии и навыки в таблицах profession и skills соответственно

## Мини проверка всё ли есть в БД
Для теста можно запустить скрипт `check_db.py`, также предварительно поменяв настройки в скрипте.
```python
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgrespass"
POSTGRES_DB = "testdb"
POSTGRES_GRAPH = "professions_graph"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432
```

## Получаем json из бэка, на который наложили пользовательские скилы
Для наглядности, добавим пользователю те навыки, которые были в профессии из json (профессия которую ранее добавили)


Смотрим на название навыка из json -> заходим в бд -> ищем по названию этот навык -> видим `id` навыка -> добавляем пользователю освоение этого навыка по `id`
смотрим на название профессии из json -> заходим в бд -> ищем по названию эту профессию -> запоминаем `id` профессию 
теперь можем дёргать ручку `/graph/get/{id профессию которую добавили}`
пример json который получаем в итоге:
```
{
  "C++ Developer": {
    "count": 0,
    "user_proficiency": 0,
    "percent": 0,
    "programming_languages": {
      "count": 0,
      "user_proficiency": 0,
      "percent": 0,
      "C++": {
        "count": 240,
        "user_proficiency": 9,
        "percent": 3.75
      },
      "Python": {
        "count": 60,
        "user_proficiency": 0,
        "percent": 0.0
      }
    },
    "tools": {
      "count": 0,
      "user_proficiency": 0,
      "percent": 0,
      "Linux": {
        "count": 80,
        "user_proficiency": 0,
        "percent": 0.0
      },
      "Git": {
        "count": 60,
        "user_proficiency": 0,
        "percent": 0.0
      }
    },
    "libraries": {
      "count": 0,
      "user_proficiency": 0,
      "percent": 0,
      "ООП": {
        "count": 60,
        "user_proficiency": 0,
        "percent": 0.0
      },
      "STL": {
        "count": 60,
        "user_proficiency": 0,
        "percent": 0.0
      },
      "Qt": {
        "count": 60,
        "user_proficiency": 0,
        "percent": 0.0
      }
    }
  }
}

```
