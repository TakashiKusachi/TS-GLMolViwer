from __future__ import annotations

from fastapi import HTTPException

from . import Base,session
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from pydantic import BaseModel
from typing import Union

#import hashlib
from passlib.context import CryptContext

user_ctx = CryptContext(schemes=["bcrypt"])

class PostUserModel(BaseModel):
    name:str
    pwd:str

class User(Base):
    __tablename__="users"
    id = Column(Integer,primary_key=True,index=True,autoincrement=True)
    name = Column(String(254),unique=True,index=True,nullable=False)
    hashed_password = Column(String(128))

    @staticmethod
    def getUserByName(db: Session, name:str)->User:
        return db.query(User).filter(User.name == name).first()
    
    @staticmethod
    def hashed(pwd:str)->str:
        return user_ctx.hash(pwd)

    @staticmethod
    def addUser(usermodel:PostUserModel)->User:
        """ add user


        Returns:
            User: 

        Raises:
            HTTPException: User is exists
        """
        if usermodel.name == "":
            raise HTTPException(status_code=400,detail="User name is not \" \"")
        user = User.getUserByName(session,usermodel.name)
        if user:
            raise HTTPException(status_code=409,detail="This user already exists")

        user = User()
        user.name = usermodel.name
        user.hashed_password = User.hashed(usermodel.pwd)
        session.add(user)
        session.commit()

        user = User.getUserByName(session,usermodel.name)
        return user

    @staticmethod
    def authentication(usermodel:PostUserModel)->User:
        """ check user


        Returns:
            User: 

        Raises:
            HTTPException: User is not exists or missmach password
        """
        user = User.getUserByName(session,usermodel.name)

        if not user:
            raise HTTPException(status_code=404,detail="This user is not exists")

        if not user.__authentication(usermodel.pwd):
            raise HTTPException(status_code=401,detail="Missmach : Password or username ")

        return user

    def __authentication(self, password:str)->bool:
        if not user_ctx.verify(password,self.hashed_password):
            return False
        return True