from fastapi import FastAPI,HTTPException,Cookie,Depends
from fastapi.encoders import jsonable_encoder
from fastapi.param_functions import Depends
from fastapi.responses import JSONResponse

import logging

from typing import Optional

from pymysql.err import OperationalError

import ase
import ase.db
import numpy as np
from sqlalchemy.ext import declarative

from . import db_server_url,cookie_time
from .model import Base,engine,session
from .model.user import User,PostLoginUserModel,TokenModel
from .startup import up_initial_dataset

app = FastAPI(debug=True)
Base.metadata.create_all(bind=engine)
logger = logging.getLogger("uvicorn")

@app.on_event("startup")
async def startup_event():

    try:
        User.addUser(PostLoginUserModel(name="guest",pwd=""))
    except HTTPException as e:
        if e.status_code == 409:
            pass
    up_initial_dataset(db_server_url)

@app.get('/apis/server/info',)
async def serverInfo():
    return JSONResponse(content=jsonable_encoder(
        {
            'version':"x.0.1"
        }
    ))

@app.post('/apis/user/login',response_model=TokenModel)
async def user_login(user:User = Depends(User.authentication)):
    """
    """
    
    return user.create_tokens()

@app.post('/apis/user')
async def add_user(user:User = Depends(User.addUser)):
    """
    
    """
    #user = User.addUser(post_user)
    
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
                for row in db.select(columns=["id","unique_id","key_value_pairs","data"])
            ]}
        ))
    except OperationalError as e:
        logger.debug("{} is down".format(db_server_url))
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