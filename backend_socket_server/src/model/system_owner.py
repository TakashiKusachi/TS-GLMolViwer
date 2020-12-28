from __future__ import annotations
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Table
from pydantic import BaseModel
from typing import Dict, Union, Optional
import logging

from . import Base,session

logger = logging.getLogger("uvicorn")


systemOwner = Table("systemowner",Base.metadata,
        Column("user_id",Integer, ForeignKey("users.id")),
        Column("system_id",Integer, ForeignKey("systems.id"))
    )

    
