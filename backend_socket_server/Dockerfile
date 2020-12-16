
FROM python:3.7-slim

RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y libpq-dev

RUN pip install Flask==1.1.2 Flask-Login==0.5.0 Flask-Session Flask-SocketIO==3.1.2 flask-cors itsdangerous==1.1.0 Jinja2==2.11.2 MarkupSafe==1.1.1 python-engineio==3.14.2 python-socketio==4.6.1 six==1.15.0 Werkzeug==1.0.1 eventlet==0.29.1 tornado
RUN pip install ase PyMySQL psycopg2

ENV CORS_ALLOWED="*"
ENV HOST=0.0.0.0
ENV PORT=8888
ENV UPLOAD_FOLDER=/tmp
ENV DB_SERVER_URL="/db.json"
EXPOSE $PORT

COPY ./startup/startup.py ./
#RUN python -u /startup.py

COPY ./utils/ ./utils/
COPY ./startup/ ./startup/
COPY ./__init__.py ./
COPY ./server.py ./

CMD ["python","-u","./server.py"]

