import ase
from ase.db import connect
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.collections import g2
from ase.build import molecule

def startup():
    db = connect("/db.json")

    for name in g2.names:
        try:
            atoms = molecule(name)
            atoms.calc = EMT()
            db.write(atoms,releaxed=True,name=name,data={'description':'ASE sample data.'})
        except NotImplementedError as e:
            pass

if __name__=="__main__":
    startup()