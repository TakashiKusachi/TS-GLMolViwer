import { stringify } from "querystring";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { PositionalAudio } from "three";

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

type Position = Array<number>;
type Name = string;

/**
 * 
 */
class Atom{
    private _name: Name;
    private _position: Position;
    private _element: ElemType;
    private _index: number;

    constructor(name:string,position:Position,element:ElemType,index: number){
        this._name = name;
        this._position = position;
        this._element = element;
        this._index = index;
    }

    get position(){
        return this._position;
    }
    get name(){
        return this._name;
    }
    get element(){
        return this._element;
    }
    get index(){
        return this._index;
    }
}

type BOND_TYPE= number;
class Bond{
    private _atoma: Atom;
    private _atomb: Atom;
    private _bond_type: BOND_TYPE;
    constructor(atoma:Atom,atomb:Atom,bond_type:BOND_TYPE){
        this._atoma = atoma;
        this._atomb = atomb;
        this._bond_type = bond_type;
    }

    get atoma():Atom{
        return this._atoma;
    }
    get atomb():Atom{
        return this._atomb;
    }

    /**
     * Vector B -> A
     */
    get vector():number[]{
        let vec3d = [0,0,0];
        vec3d[0] = this._atoma.position[0] - this._atomb.position[0];
        vec3d[1] = this._atoma.position[1] - this._atomb.position[1];
        vec3d[2] = this._atoma.position[2] - this._atomb.position[2];
        return vec3d;
    }

    get distance():number{
        return Math.sqrt(
            Math.pow(this._atoma.position[0] -this._atomb.position[0],2)+
            Math.pow(this._atoma.position[1] -this._atomb.position[1],2)+
            Math.pow(this._atoma.position[2] -this._atomb.position[2],2)
            )
    }

    get position():Position{
        let pos = [0,0];
        pos[0] = this._atoma.position[0]/2 + this._atomb.position[0]/2;
        pos[1] = this._atoma.position[1]/2 + this._atomb.position[1]/2;
        pos[2] = this._atoma.position[2]/2 + this._atomb.position[2]/2;
        return pos;
    }
}


/**
 * 系のコンテナクラス
 */
class System{
    private N_undef_atoms: number = 0;

    private names: Array<Name> = [];
    private positions: Array<Position> = [];
    private elements: Array<ElemType> = [];
    
    private bond_atoms: Array<Array<Atom>> = [];
    private bond_types: Array<BOND_TYPE> = [];

    constructor(){
    }

    add_atom(name: Name|null, position:Position, element:ElemType){
        
        if(name == null || name==""){
            name = "Atom"+this.N_undef_atoms++;
        }

        if (position.length != 3){
            throw new RangeError("atomの座標は3次元である必要があります。");
        }

        this.names.push(name);
        this.positions.push(position);
        this.elements.push(element);
    }

    add_bond(atoma_name:string,atomb_name:string,bondtype:BOND_TYPE){

        let atoma: Atom;
        let atomb: Atom;

        atoma = this.getAtom(this.atomIndexOf(atoma_name))
        atomb = this.getAtom(this.atomIndexOf(atomb_name))

        this.bond_atoms.push([atoma,atomb]);
        this.bond_types.push(bondtype);

    }

    get natoms():number{
        return this.positions.length;
    }
    get nbond():number{
        return this.bond_atoms.length;
    }

    getNames(){
        return this.names;
    }
    getPositions(){
        return this.positions;
    }
    getElements(){
        return this.elements;
    }
    getAtom(index: number){
        return new Atom(
            this.names[index],
            this.positions[index],
            this.elements[index],
            index,
        )
    }

    atomIndexOf(name: string):number{
        return this.names.indexOf(name);
    }

    * getAtoms(){
        let natoms = this.natoms;
        for(let i = 0;i < natoms;i++){
            let c_atom = new Atom(
                this.names[i],
                this.positions[i],
                this.elements[i],
                i,
            )
            yield c_atom;
        }
        return "Done";
    }
    *getBond(){
        let nbond = this.nbond;
        for(let i = 0;i < nbond;i++){
            yield new Bond(
                this.bond_atoms[i][0],
                this.bond_atoms[i][1],
                this.bond_types[i],
            )
        }
    }
}

export {ElemType,Position,Atom,System};
export {elemStr2Type,elemStr}