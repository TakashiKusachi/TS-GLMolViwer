from __future__ import annotations
from sqlalchemy import Column, Integer, String, Text, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from pydantic import BaseModel
from typing import Dict, Union, Optional
import logging

import numpy as np

from uuid import uuid4

import ase

from . import Base,session

logger = logging.getLogger("uvicorn")

class PositionArray(TypeDecorator):
    impl = LargeBinary

    def process_bind_param(self, value:np.ndarray, dialect):
        value = value.astype(np.float64)
        return value.tobytes()

    def process_result_value(self, value, dialect):
        pos = np.frombuffer(value,dtype=np.float64).reshape((-1,3))
        return pos

class NumbersArray(TypeDecorator):
    impl = LargeBinary

    def process_bind_param(self, value:np.ndarray, dialect):
        value = value.astype(np.int32)
        return value.tobytes()

    def process_result_value(self, value, dialect):
        num = np.frombuffer(value,np.int32)
        return num

class System(Base):
    __tablename__ = 'systems'
    id = Column(Integer,primary_key=True,nullable=False,index=True,autoincrement=True)
    unique_id = Column(String(64),unique=True)
    name = Column(String(255))
    description = Column(Text)
    numbers = Column(NumbersArray)
    positions = Column(PositionArray)
    owner_id = Column(Integer,ForeignKey("users.id"))
    owner = relationship("User",back_populates="systems")

    def setAtoms(self,atoms:ase.Atoms):
        self.numbers = atoms.numbers
        self.positions = atoms.positions
    
    def getAtom(self):
        atom = ase.Atoms(positions=self.positions,numbers=self.numbers)

    def makeUniqueId(self)->str:
        return str(uuid4())