# docker/backend/api/Dockerfile
FROM python:3.13

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /api

COPY ./backend/api/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/api .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]