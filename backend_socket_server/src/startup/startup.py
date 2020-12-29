import os

import ase
from ase.db import connect
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.collections import g2
from ase.build import molecule

import time
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from ..model.system import System
from ..model import session

logger = logging.getLogger('uvicorn')

def up_initial_dataset(db_url,owner):
    length = 0
    count = 0
    db:Session = session()
    while(True):
        try:
            length = db.query(System).count()
        except OperationalError as e:
            count += 1
            logger.info("OperationalError {}".format(count))
            if(count == 3):
                raise RuntimeError("Connection refused: URL={url}".format(url=db_url))
            pass
        else:
            break

    count = 0
    logger.info("wakeup data length: {}".format(length))
    if length != 0:
        return
    for name in g2.names:
        try:
            #db = connect(db_url)
            atoms = molecule(name)
            #atoms.calc = EMT()
            #db.write(atoms,releaxed=True,name=name,data={'description':'ASE sample data.'})

            sys = System()
            sys.setAtoms(atoms)
            sys.name = name
            sys.unique_id = sys.makeUniqueId()
            sys.description = 'ASE sample data.'
            sys.owner = owner
            db = session()
            db.add(sys)
            db.commit()

            #owner.systems.append(sys)
            #db.add(owner)
            #db.commit()

        except NotImplementedError as e:
            pass
        except OperationalError as e:
            count+=1
            time.sleep(3.0)
            if(count>10):
                raise RuntimeError("Connection refused: URL={url}".format(url=db_url))
            continue

if __name__=="__main__":
    pass