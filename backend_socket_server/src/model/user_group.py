from __future__ import annotations

from fastapi import HTTPException,Depends,Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.sql.schema import ForeignKey

from . import Base
from sqlalchemy import Column, Integer, String, Text, Table
from sqlalchemy.orm import Session,relationship

import logging

logger = logging.getLogger("uvicorn")

users_groups_table = Table('users_groups',Base.metadata,
    Column('user_id',Integer,ForeignKey('users.id')),
    Column('group_id',Integer,ForeignKey('groups.id'))
)
