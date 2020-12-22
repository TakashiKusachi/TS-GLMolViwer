from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker,scoped_session
from .. import db_server_url

engine = create_engine(
    db_server_url,
    connect_args={}
)

session = scoped_session(sessionmaker(autocommit=False,autoflush=False,bind=engine))
Base=declarative_base()