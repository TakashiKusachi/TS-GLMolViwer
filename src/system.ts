import { stringify } from "querystring";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { PositionalAudio } from "three";
import { isNull } from "util";
import { GeneratorAPI } from "@vue/cli";

enum ElemType{
    ANY,H,He,Li,Be,B,C,N,O,F,Ne,
}
const elemStr=[
    "","H","He","Li","Be","B","C","N","O","F","Ne",
]
function elemStr2Type(name: string): ElemType{
    let index = elemStr.findIndex((v)=>{return v === name;});
    return <ElemType>index;
}

export type Position = Array<number>;
export type Name = string;

export interface IAtom{
    position: Position;
    name: Name;
    element: ElemType;
    index: number;
}

export type BOND_TYPE= number;

export interface IBond<AtomType extends IAtom = IAtom>{
    atoma: AtomType;
    atomb: AtomType;

    vector: number[];
    distance: number;

    position: Position; 
}

export interface ISystem<AtomType extends IAtom,BondType extends IBond<AtomType>>{
    /**getterでの実装を禁ズ */
    systemName: string;

    natoms: number;
    nbond: number;
    getNames(): string[];
    getPositions(): Position[];
    getElements(): ElemType[];
    getAtom(index:number): AtomType;
    atomIndexOf(name:string): number;
    getAtoms():Generator<AtomType,string,unknown>;
    getBond():Generator<BondType,void,unknown>;
}
export type AbstractSystem = ISystem<IAtom,IBond>

export {ElemType};
export {elemStr2Type,elemStr}