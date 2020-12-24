from fastapi import FastAPI,HTTPException,Cookie
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from typing import Optional

from pymysql.err import OperationalError

import ase
import ase.db
import numpy as np

from . import db_server_url,cookie_time
from .model import Base,engine,session
from .model.user import User,PostUserModel
from .startup import up_initial_dataset

app = FastAPI()
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    up_initial_dataset(db_server_url)

@app.get('/apis/server/info')
async def serverInfo():
    return JSONResponse(content=jsonable_encoder(
        {
            'version':"x.0.1"
        }
    ))

@app.post('/apis/user/login')
async def user_login(post_user:PostUserModel):
    """
    """
    user = User.authentication(post_user)
    
    response = JSONResponse(content=jsonable_encoder(
        {
            "id":user.id,
            "name":user.name,
        }
    ))
    response.set_cookie("user_id",str(user.id),max_age=cookie_time)
    return response

@app.post('/apis/user')
async def add_user(post_user:PostUserModel):
    """
    
    """
    user = User.addUser(post_user)
    
    return JSONResponse(content=jsonable_encoder(
        {
            "id":user.id,
            "name":user.name,
        }
    ))

@app.get('/apis/db/list')
async def listup( user_id:Optional[str] = Cookie(None)):
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
def get(unique_id:str, user_id:Optional[str] = Cookie(None)):
    db = ase.db.connect(db_server_url)
    atoms = db.get("unique_id={}".format(unique_id))

    retdict = {
        key:atoms[key] for key in atoms if not isinstance(atoms[key],np.ndarray)
    }
    retdict.update({'positions':atoms['positions'].tolist()})
    retdict.update({'numbers':atoms['numbers'].tolist()})
    retdict.update({'data':atoms['data'] if atoms.get('data')!=None else ""})

    return JSONResponse(content=jsonable_encoder(retdict))