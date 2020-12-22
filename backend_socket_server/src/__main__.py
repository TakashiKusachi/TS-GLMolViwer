from fastapi import FastAPI,HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from pymysql.err import OperationalError

import ase
import ase.db
import numpy as np

from . import db_server_url
from .model import Base,engine,session
from .model.user import User

app = FastAPI()
Base.metadata.create_all(bind=engine)

@app.get('/apis/server/info')
async def serverInfo():
    return JSONResponse(content=jsonable_encoder(
        {
            'version':"x.0.1"
        }
    ))

@app.post('/apis/user')
async def add_user(name:str,pwd:str):
    """
    
    """

    # ユーザがすでに存在しているかチェック
    user = User.getUserByName(session,name)
    if user:
        raise HTTPException(status_code=409,detail="This user already exists")

    user = User()
    user.name = name
    user.hashed_password = User.hashed(pwd)
    session.add(user)
    session.commit()

    user = User.getUserByName(session,name)
    return JSONResponse(content=jsonable_encoder(
        {
            "id":user.id,
            "name":user.name,
        }
    ))

@app.get('/apis/db/list')
async def listup():
    try:
        db = ase.db.connect(db_server_url)
        return JSONResponse(content=jsonable_encoder(
            {
            'dataset':[
                {
                'id': row.id,
                'unique_id':row.unique_id,
                'name':row.name,
                'description': row.data['description'],
                }
                for row in db.select()
            ]}
        ))
    except OperationalError as e:
        app.logger.debug("{} is down".format(db_server_url))
        return "",503

@app.get('/apis/db/data')
def get(unique_id:str):
    db = ase.db.connect(db_server_url)
    atoms = db.get("unique_id={}".format(unique_id))

    retdict = {
        key:atoms[key] for key in atoms if not isinstance(atoms[key],np.ndarray)
    }
    retdict.update({'positions':atoms['positions'].tolist()})
    retdict.update({'numbers':atoms['numbers'].tolist()})
    retdict.update({'data':atoms['data'] if atoms.get('data')!=None else ""})

    return JSONResponse(content=jsonable_encoder(retdict))