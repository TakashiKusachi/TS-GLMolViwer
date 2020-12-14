import os

import ase
import ase.io
import ase.db

from flask import Flask, flash, request, render_template,jsonify
from flask_socketio import SocketIO,emit,send

from werkzeug.utils import secure_filename
import json

from tempfile import NamedTemporaryFile
import traceback

import numpy as np

from utils import parse_cors_allowd

cors_allowed_origins = os.environ["CORS_ALLOWED"]
host = os.environ["HOST"]
port = int(os.environ['PORT'])
upload_folder = os.environ["UPLOAD_FOLDER"]

app = Flask(__name__)
app.config['SECRET_KEY']='secret!'
socketio = SocketIO(app,async_mode=None,cors_allowed_origins=parse_cors_allowd(cors_allowed_origins))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/apis/relax',methods=['POST'])
def relax_calc():
    try :
        if request.method != 'POST':
            raise RuntimeError("request is not POST")

        if 'file' not in request.files:
            raise RuntimeError("request has not file in files")

        file = request.files['file']

        if file.filename == '':
            raise RuntimeError("filename is null")

        atoms = ase.io.read(file)
        app.logger.debug("# of atoms"+str(len(atoms)))

        return "accept"

    except RuntimeError as e: 
        app.logger.debug(traceback.format_exc())
        return traceback.format_exc()

@app.route('/apis/db/list',methods=['GET'])
def listup():
    db = ase.db.connect("/db.json")
    

    return jsonify({
        'dataset':[
            {
            'id': row.id,
            'unique_id':row.unique_id,
            'name':row.name,
            'description': row.data['description'],
            }
            for row in db.select()
        ]})

@app.route('/apis/db/data',methods=['GET'])
def db_data():
    db = ase.db.connect("/db.json")
    unique_id = request.args.get('unique_id')
    atoms = db.get("unique_id={}".format(unique_id))

    retdict = {
        key:atoms[key] for key in atoms if not isinstance(atoms[key],np.ndarray)
    }
    retdict.update({'positions':atoms['positions'].tolist()})
    retdict.update({'numbers':atoms['numbers'].tolist()})
    retdict.update({'data':atoms['data'] if atoms.get('data')!=None else ""})

    return jsonify(retdict)



@socketio.on('test2')
def test2(data):
    print("emit")
    try:
        message =json.dumps({'data':'data'})
    except (TypeError,OverflowError,ValueError) as e:
        message = json.dumps({'state':'Error'})
        app.logger.debug("Detection Exception:",str(data))
        emit("test1,message")
    else:
        app.logger.debug("Pass")
        emit("test1",message)

@socketio.on('connect')
def connect():
    app.logger.debug("connect")
    return True

if __name__=='__main__':
    print("server up")
    socketio.run(app,debug=True,host=host,port=port)
