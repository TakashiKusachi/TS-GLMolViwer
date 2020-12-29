from __future__ import annotations

from fastapi import HTTPException,Depends,Cookie
from fastapi.security import OAuth2PasswordBearer

from . import Base,session
from .user_group import users_groups_table
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Session,relationship

import logging

logger = logging.getLogger("uvicorn")

class Group(Base):
    __tablename__="groups"
    id = Column(Integer,primary_key=True,index=True,autoincrement=True)
    name = Column(String(254),unique=True,index=True,nullable=False)
    users = relationship("User",secondary=users_groups_table,back_populates="groups")
    systems = relationship("System",back_populates="group")

    @staticmethod
    def getGroupByName(name:str)->Group:
        db:Session = session()
        group = db.query(Group).filter(Group.name == name).first()
        db.commit()
        return group
