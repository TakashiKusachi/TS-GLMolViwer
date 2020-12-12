
From python:3.7-slim

RUN pip install Flask==1.1.2 Flask-Login==0.5.0 Flask-Session Flask-SocketIO==3.1.2 flask-cors itsdangerous==1.1.0 Jinja2==2.11.2 MarkupSafe==1.1.1 python-engineio==3.14.2 python-socketio==4.6.1 six==1.15.0 Werkzeug==1.0.1 eventlet==0.29.1 tornado
RUN pip install ase

ENV CORS_ALLOWED=http://localhost:8081
ENV HOST=0.0.0.0
ENV PORT=8888
ENV UPLOAD_FOLDER=/tmp
EXPOSE $PORT

COPY ./server.py ./

CMD ["python","-u","./server.py"]

