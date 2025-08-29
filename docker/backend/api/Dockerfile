FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /api

COPY ./backend/api .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn main:app --host 0.0.0.0 --port 8005"]