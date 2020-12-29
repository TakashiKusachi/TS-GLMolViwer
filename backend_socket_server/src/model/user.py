from __future__ import annotations

from fastapi import HTTPException,Depends,Cookie
from fastapi.security import OAuth2PasswordBearer

from . import Base,session
from .. import secret_key
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Session,relationship

from pydantic import BaseModel
from typing import Dict, Union, Optional
from jose import jwt

#import hashlib
from passlib.context import CryptContext
import logging

logger = logging.getLogger("uvicorn")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

user_ctx = CryptContext(schemes=["bcrypt"])

class PostLoginUserModel(BaseModel):
    name:str
    pwd:str

class TokenModel(BaseModel):
    access_token: str
    refresh_token:str
    token_type: str

class User(Base):
    __tablename__="users"
    id = Column(Integer,primary_key=True,index=True,autoincrement=True)
    name = Column(String(254),unique=True,index=True,nullable=False)
    hashed_password = Column(String(128))
    refresh_token = Column(Text,nullable=True)
    systems = relationship("System",back_populates="owner")

    @staticmethod
    def getUserByName(name:str, db: Session = session())->User:
        user = db.query(User).filter(User.name == name).first()
        db.commit()
        return user
    
    @staticmethod
    def __getUserByID(id:int)->User:
        db:Session = session()
        user = db.query(User).filter(User.id == id).first()
        db.commit()
        return user

    
    @staticmethod
    def hashed(pwd:str)->str:
        return user_ctx.hash(pwd)

    @staticmethod
    def addUser(usermodel:PostLoginUserModel)->User:
        """ add user


        Returns:
            User: 

        Raises:
            HTTPException: User is exists
        """
        if usermodel.name == "":
            raise HTTPException(status_code=400,detail="User name is not \" \"")
        user = User.getUserByName(usermodel.name)
        if user:
            raise HTTPException(status_code=409,detail="This user already exists")

        user = User()
        user.name = usermodel.name
        user.hashed_password = User.hashed(usermodel.pwd)
        db:Session = session()
        db.add(user)
        db.commit()
        return user

    @staticmethod
    def authentication(usermodel:PostLoginUserModel)->User:
        """ check user


        Returns:
            User: 

        Raises:
            HTTPException: User is not exists or missmach password
        """
        logger.info("input name:"+usermodel.name)
        user = User.getUserByName(usermodel.name)

        if not user:
            raise HTTPException(status_code=404,detail="This user is not exists")

        logger.info("ID:"+str(user.id))
        logger.info("name:"+user.name)

        if not user.__authentication(usermodel.pwd):
            raise HTTPException(status_code=401,detail="Missmach : Password or username ")

        return user

    @staticmethod
    def getCurrentUserWithToken(access_token:Optional[str]=Cookie(None))->User:
        """ test

        Returns:
            User: If access token is correct toekn, return the User,else return the None.
        """
        if (access_token is None):
            return None
        pyload:Dict = jwt.decode(access_token,secret_key,algorithms="HS256")
        id = pyload['user_id']

        user = User.__getUserByID(id)
        return user

    def create_tokens(self):
        access_pyload={
            'token_type':'access_token',
            'user_id':self.id
        }
        refresh_pyload={
            'token_type':'refresh_token',
            'user_id':self.id
        }

        access_token = jwt.encode(access_pyload,secret_key,algorithm="HS256")
        refresh_token = jwt.encode(refresh_pyload,secret_key,algorithm="HS256")

        db:Session = session()
        user_query=db.query(User).filter(User.id==self.id).one()
        user_query.refresh_token = refresh_token
        db.commit()
        return {"access_token":access_token,"refresh_token":refresh_token,"token_type":"bearer"}

    def __authentication(self, password:str)->bool:
        if not user_ctx.verify(password,self.hashed_password):
            return False
        return True