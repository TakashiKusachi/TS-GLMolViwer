from fastapi import FastAPI,HTTPException,Cookie,Depends,Request
from fastapi.encoders import jsonable_encoder
from fastapi.param_functions import Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

import logging

from typing import Optional

from pymysql.err import OperationalError

import ase
import ase.db
import numpy as np
from sqlalchemy import or_
from sqlalchemy.ext import declarative
from sqlalchemy.orm import Session,contains_eager,subqueryload

from . import db_server_url,cookie_time
from .model import Base,engine,session
from .model.user import User,PostLoginUserModel,TokenModel
from .model.system import System
from .startup import up_initial_dataset
from .exception.loginException import LoginErrorException

app = FastAPI(debug=True)

Base.metadata.create_all(bind=engine)
logger = logging.getLogger("uvicorn")

@app.on_event("startup")
async def startup_event():

    try:
        guest = User.addUser(PostLoginUserModel(name="guest",pwd=""))
        up_initial_dataset(db_server_url,guest)
    except HTTPException as e:
        if e.status_code == 409:
            pass

@app.get('/apis/server/info',)
async def serverInfo():
    return JSONResponse(content=jsonable_encoder(
        {
            'version':"x.0.1"
        }
    ))

@app.post('/apis/user/login')
async def user_login(user:User = Depends(User.authentication)):
    """

    Returns:
        JSONResponse: 
    """
    token = user.create_tokens()
    response = JSONResponse(jsonable_encoder(
        {
            "id":user.id,
            "name":user.name,
        }
    ))
    response.set_cookie("access_token",token["access_token"],httponly=True,secure=True)
    return response

@app.post('/apis/user/logout')
async def user_logout(user:Optional[User]=Depends(User.getCurrentUserWithToken)):
    if user is not None:
        res = JSONResponse(
            content={"detail":"success"}
        )
        res.set_cookie("access_token","",max_age=1,secure=True,httponly=True)
        return res
    else:
        raise LoginErrorException()

@app.get('/apis/user')
async def current_user(user:Optional[User]=Depends(User.getCurrentUserWithToken)):
    if user is not None:
        response = JSONResponse(jsonable_encoder(
            {
                "id":user.id,
                "name":user.name,
            }
        ))
        return response
    else:
        raise LoginErrorException()

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
async def listup( user:Optional[User]=Depends(User.getCurrentUserWithToken)):
    dataset = []
    try:
        logger.info("befor query")
        db:Session = session()
        target_user = ["guest"]
        if user is not None:
            target_user.append(user.name)

        q_user_id = db.query(User.id)\
            .filter(User.name.in_(target_user))

        q_system = db.query(System.id,System.unique_id,System.name,System.description,)\
            .filter(System.owner_id.in_(q_user_id))


        dataset.extend([
            {
                'id':sys.id,
                'unique_id':sys.unique_id,
                'name':sys.name,
                'description':sys.description
            }
            for sys in q_system.all()
        ])
    except OperationalError as e:
        logger.debug("{} is down".format(db_server_url))
        return HTTPException(503)

    return JSONResponse(content=jsonable_encoder(
        {
            'dataset':dataset
        }
    ))

@app.get('/apis/db/data')
def get(unique_id:str, user:User=Depends(User.getCurrentUserWithToken)):

    db:Session = session()
    atoms:System = db.query(System).filter(System.unique_id==unique_id).one()
    retdict = {
        'positions':atoms.positions.tolist(),
        'numbers':atoms.numbers.tolist()
    }

    return JSONResponse(content=jsonable_encoder(retdict))


@app.exception_handler(LoginErrorException)
async def login_error_exception_handler(request: Request, exc: LoginErrorException):
    res = JSONResponse(
        status_code=400,
        content={"details":"Login refuse"}
    )
    res.set_cookie("access_token","",max_age=1,secure=True,httponly=True)
    return res