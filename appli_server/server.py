import os

from flask import Flask, render_template
from flask_socketio import SocketIO,emit,send

cors_allowed_origins = os.environ["CORS_ALLOWED"]
host = os.environ["HOST"]
port = int(os.environ['PORT'])

app = Flask(__name__)
app.config['SECRET_KEY']='secret!'
socketio = SocketIO(app,async_mode=None,cors_allowed_origins=[cors_allowed_origins])

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('test2')
def test2(data):
    #print("emit")
    emit("test1",{'data':'data'})

@socketio.on('connect')
def connect():
    print("connect")
    return True

if __name__=='__main__':
    print("server up")
    socketio.run(app,debug=True,host=host,port=port)
