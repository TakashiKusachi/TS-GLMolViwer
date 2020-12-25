from __future__ import annotations

from fastapi import HTTPException,Depends
from fastapi.security import OAuth2PasswordBearer

from . import Base,session
from .. import secret_key
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from pydantic import BaseModel
from typing import Union
from jose import jwt

#import hashlib
from passlib.context import CryptContext

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
    refresh_token = Column(String(254),nullable=True)

    @staticmethod
    def getUserByName(name:str, db: Session = session())->User:
        user = db.query(User).filter(User.name == name).first()
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
        user = User.getUserByName(usermodel.name)

        if not user:
            raise HTTPException(status_code=404,detail="This user is not exists")

        if not user.__authentication(usermodel.pwd):
            raise HTTPException(status_code=401,detail="Missmach : Password or username ")

        return user

    def create_tokens(self,db:Session = session()):
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

        user_query=db.query(User).filter(User.id==self.id).one()
        user_query.refresh_token = refresh_token
        db.commit()
        return {"access_token":access_token,"refresh_token":refresh_token,"token_type":"bearer"}

    def __authentication(self, password:str)->bool:
        if not user_ctx.verify(password,self.hashed_password):
            return False
        return True