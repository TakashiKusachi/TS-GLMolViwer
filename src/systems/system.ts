
enum ElemType{
    ANY,H,He,Li,Be,B,C,N,O,F,Ne,
}

export enum BondType{
    Single,
    Double,
    Triple,
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

export type AtomConstructorArgument={
    name: Name,
    index: number,
    element?: ElemType,
    position?: Position,
}

export class Atom implements IAtom{
    private _position: Position;
    private _name : Name;
    private _element: ElemType;
    private _index: number;

    constructor(
        {
            name,
            index,
            element = ElemType.ANY,
            position = [0,0,0],
        }:AtomConstructorArgument
    ){
            this._position = position;
            this._name = name;
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

export interface IBond<AtomType extends IAtom = IAtom>{
    atoma: AtomType;
    atomb: AtomType;

    vector: number[];
    distance: number;

    position: Position; 
}


class Bond implements IBond<Atom>{
    private _atoma: Atom;
    private _atomb: Atom;
    private _bond_type: BondType;
    constructor(atoma:Atom,atomb:Atom,bond_type:BondType){
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


/**
 * 系のコンテナクラス
 */
export class System implements ISystem<Atom,Bond>{
    public systemName:string = "car"
    private N_undef_atoms: number = 0;

    private names: Array<Name> = [];
    private positions: Position[] = [];
    private elements: Array<ElemType> = [];
    
    private bond_atoms: Array<Array<number>> = [];
    private bond_types: Array<BondType> = [];

    /**
     * 
     * @param ord_system 
     * @param need_copy threads.jsでworkerにクラスを投げるとメンバ変数だけが送られ、クラスの体をなしていないため、メンバ関数が呼べないという面倒な問題が起こる。masterからすればコピーされたobjectなので、クラスに格納するだけのmethodがほしいので用意。通常はtrueだと考えられます。
     * 
     * @Notes need_copyしても、positionとかbond_atomsのような多重配列の場合、二次参照先は同じオブジェクトを参照するため、注意が必要です。
     */
    static getSystem(ord_system: System,need_copy=true){
        let ret = new System();
        if(ord_system === null)throw Error("");
        if(need_copy){
            ret.N_undef_atoms = ord_system.N_undef_atoms;
            ret.names = ord_system.names.concat();
            ret.positions = ord_system.positions.concat();
            ret.elements = ord_system.elements.concat();
            ret.bond_atoms = ord_system.bond_atoms.concat();
            ret.bond_types = ord_system.bond_types.concat();
        }else{
            ret.N_undef_atoms = ord_system.N_undef_atoms;
            ret.names = ord_system.names;
            ret.positions = ord_system.positions;
            ret.elements = ord_system.elements;
            ret.bond_atoms = ord_system.bond_atoms;
            ret.bond_types = ord_system.bond_types;
        }
        return ret;
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

    add_bond(atoma_name:string,atomb_name:string,bondtype:BondType){

        let atoma: number;
        let atomb: number;

        atoma = this.atomIndexOf(atoma_name)
        atomb = this.atomIndexOf(atomb_name)

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
        return new Atom({
            name: this.names[index],
            index: index,
            element: this.elements[index],
            position: this.positions[index],
        })
    }

    atomIndexOf(name: string):number{
        return this.names.indexOf(name);
    }

    *getAtoms(){
        let natoms = this.natoms;
        for(let i = 0;i < natoms;i++){
            let c_atom = new Atom({
                name: this.names[i],
                index: i,
                element: this.elements[i],
                position: this.positions[i],
            })
            yield c_atom;
        }
        return "Done";
    }
    *getBond(){
        let nbond = this.nbond;
        for(let i = 0;i < nbond;i++){
            yield new Bond(
                this.getAtom(this.bond_atoms[i][0]),
                this.getAtom(this.bond_atoms[i][1]),
                this.bond_types[i],
            )
        }
    }
}

export {ElemType};
export {elemStr2Type,elemStr}