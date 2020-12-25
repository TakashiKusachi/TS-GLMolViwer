
FROM python:3.7-slim

RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y libpq-dev default-libmysqlclient-dev

RUN pip install fastapi fastapi-socketio uvicorn python-socketio==4.6.1 websockets sqlalchemy mysqlclient passlib bcrypt python-jose

RUN pip install ase PyMySQL psycopg2

ENV CORS_ALLOWED="*"
ENV HOST=0.0.0.0
ENV PORT=8888
ENV UPLOAD_FOLDER=/tmp
ENV DB_SERVER_URL="/db.json"
ENV COOKIE_TIME=3600
ENV LOG_LEVEL=info
ENV SECRET_KEY="SECRET_KEY123"
EXPOSE $PORT

COPY ./src/ ./src/
COPY ./server.py ./

CMD uvicorn --host ${HOST} --port ${PORT} --log-level ${LOG_LEVEL} server:app
