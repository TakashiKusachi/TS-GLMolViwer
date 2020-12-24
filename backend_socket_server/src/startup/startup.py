import os

import ase
from ase.db import connect
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.collections import g2
from ase.build import molecule

import time
import logging

from sqlalchemy.exc import OperationalError

logger = logging.getLogger('uvicorn')

def up_initial_dataset(db_url):
    length = 0
    count = 0
    while(True):
        try:
            db = connect(db_url)
            length = len(db)
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
            db = connect(db_url)
            atoms = molecule(name)
            atoms.calc = EMT()
            db.write(atoms,releaxed=True,name=name,data={'description':'ASE sample data.'})
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