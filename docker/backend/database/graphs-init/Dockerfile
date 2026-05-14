FROM python:3.13

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /graph

COPY ./backend/database/graphs/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/database/graphs/ .

CMD ["python", "deploy_db.py", "--dir", "./data/graphs"]
