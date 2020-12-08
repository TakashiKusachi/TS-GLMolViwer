import os

from flask import Flask, render_template
from flask_socketio import SocketIO,emit,send

import ase

app = Flask(__name__)
app.config['SECRET_KEY']='secret!'
socketio = SocketIO(app,async_mode=None)

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
    socketio.run(app,debug=True,host="0.0.0.0",port=8888)
