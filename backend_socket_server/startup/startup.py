import ase
from ase.db import connect
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.collections import g2
from ase.build import molecule

import time

from pymysql.err import OperationalError

def up_initial_dataset(db_url):
    count = 0
    while():
        try:
            db = connect(db_url)
            l = len(db)
            if (l != 0):
                return
        except OperationalError as e:
            count += 1
            if(count == 3):
                raise RuntimeError()
            pass
        else:
            break

    count = 0
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
    up_initial_dataset()