## Как JSON граф отправить в БД?
Для этого используется python скрипт `deploy_db.py` в текущей директории.

Для настройки необходимо перейти в файл и поменять настройки в константах, 
а именно:
```python
# Заменить на свои данные от PostgreSQL
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgrespass"
POSTGRES_DB = "testdb"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432

# Заменить на путь до графа в формате JSON
PATH_TO_JSON = "C:\\Users\\User\\graphs\\graph_c++.json"
```
Теперь просто запускаем скрипт.

### Примечание
Создались необходимые профессии и навыки в таблицах profession и skills соответственно

## Мини проверка всё ли есть в БД
Для теста можно запустить скрипт 
check_bd.py

Пример вывода:

<img width="1809" height="881" alt="image" src="https://github.com/user-attachments/assets/f077b141-c71a-4149-aef2-0e56c430ab49" />

## Получаем json из бэка, на который наложили пользовательские скилы
Для наглядности, добавим пользователю те навыки, которые были в профессии из json (профессия которую ранее добавили)
смотрим на название навыка из json -> заходим в бд -> ищем по названию этот навык -> видим id навыка -> добавляем пользователю освоение этого навыка по id

смотрим на название профессии из json -> заходим в бд -> ищем по названию эту прфоессию -> запоминаем id прфоессии 
теперь можем дёргать ручку /graph/get/{id професси котроую добавили}
пример json который получаем в итоге:
```
{
  "C++ Developer": {
    "programming_languages": {
      "C++": {
        "count": 240,
        "subtopics": {
          "STL": {
            "count": 80,
            "components": {
              "containers": {
                "count": 40,
                "types": {
                  "sequence_containers": {
                    "count": 20,
                    "implementations": {
                      "vector": {"count": 10},
                      "deque": {"count": 5},
                      "list": {"count": 5}
                    }
                  }
                }
              }
            }
          }
        }
      },
      "corrupted_vector": {"count": 52}
    },
    "corrupted_vqq": {"count": 52}
  }
}
```

