from __future__ import annotations

from . import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

#import hashlib
from passlib.context import CryptContext

user_ctx = CryptContext(schemes=["bcrypt"])

class User(Base):
    __tablename__="users"
    id = Column(Integer,primary_key=True,index=True)
    name = Column(String(254),unique=True,index=True)
    hashed_password = Column(String(128))

    @staticmethod
    def getUserByName(db: Session, name:str)->User:
        return db.query(User).filter(User.name == name).first()
    
    @staticmethod
    def hashed(pwd:str)->str:
        return user_ctx.hash(pwd)

    def authentication(self, password:str)->bool:
        if not user_ctx.verify(password,self.hashed_password):
            return False
        return True