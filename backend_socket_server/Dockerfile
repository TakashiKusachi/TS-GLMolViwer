
FROM python:3.7-slim

RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y libpq-dev default-libmysqlclient-dev

RUN pip install fastapi fastapi-socketio uvicorn python-socketio==4.6.1 websockets sqlalchemy mysqlclient passlib bcrypt

RUN pip install ase PyMySQL psycopg2

ENV CORS_ALLOWED="*"
ENV HOST=0.0.0.0
ENV PORT=8888
ENV UPLOAD_FOLDER=/tmp
ENV DB_SERVER_URL="/db.json"
EXPOSE $PORT

COPY ./src/ ./src/
COPY ./server.py ./

CMD uvicorn --host ${HOST} --port ${PORT} server:app
