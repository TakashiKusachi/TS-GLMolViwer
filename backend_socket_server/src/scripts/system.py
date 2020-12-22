
import numpy as np
from enum import Enum

from typing import List,Tuple,Iterator,None

class ElemType(Enum):
    ANY=0
    H=1;He=2
    Li=3;Be=4;B=5;C=6;N=7;O=8;F=9;Ne=10

class BondType(Enum):
    SINGLE=0
    DOUBLE=1
    TRIPLE=2
    SEMI=3

class Atom:
    
    def __init__(self,
            _position=np.ndarray((3),dtype=np.float32),
            _name="",
            _element=ElemType.ANY,
            _index=0
        ):
        self.position : np.ndarray = _position
        self.name :str = _name
        self.element: ElemType = _element
        self.index: int = _index

class Bond:

    def __init__(self,
            atoma:Atom,
            atomb:Atom,
            bondtype:BondType = BondType.SINGLE
        ):
        self.atoma = atoma
        self.atomb = atomb
        self.bond_type = bondtype

    def getVector(self) -> np.ndarray:
        return self.atoma.position - self.atomb.position

    def getDistance(self):
        return np.linalg.norm(self.getVector(),ord=2)
    
    def position(self):
        return (self.atoma.position + self.atomb.position)/2
    
class System:
    def __init__(self,
        ):
        self.positions = np.ndarray((0,3),dtype=np.float32)
        self.names:List[str] = []
        self.elements:List[ElemType] = []
        self.bonded_atoms:List[Tuple[int,int]] = []
        self.bonded_type:List[BondType] = []

    def add_atom(self,name: str,position: np.ndarray,element:ElemType):
        self.names.append(name)
        self.positions = np.vstack(self.positions,position)
        self.elements.append(element)

    def add_bond(self,
            atoma_name:str,
            atomb_name:str,
            bondtype:BondType
        ):
        atoma = self.atomIndexOf(atoma_name)
        atomb = self.atomIndexOf(atomb_name)
        self.bonded_atoms.append((atoma,atomb))
        self.bonded_type.append(bondtype)

    def atomIndexOf(self,atom_name:str) -> int:
        return self.names.index(atom_name)

if __name__=="__main__":
    pass
