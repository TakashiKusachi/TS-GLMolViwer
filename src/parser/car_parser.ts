

import { isNull } from "util";

import {ISystem,IAtom,IBond,Position,Name,ElemType,BOND_TYPE,elemStr2Type,} from "../system"
import {iParser} from "./parser"
import {searchFile} from './utils'

/**
 * 
 */
class Atom implements IAtom{
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

class Bond implements IBond<Atom>{
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
export class System implements ISystem<Atom,Bond>{
    public systemName:string = "car"
    private N_undef_atoms: number = 0;

    private names: Array<Name> = [];
    private positions: Array<Position> = [];
    private elements: Array<ElemType> = [];
    
    private bond_atoms: Array<Array<number>> = [];
    private bond_types: Array<BOND_TYPE> = [];

    /**
     * 
     * @param ord_system 
     * @param need_copy threads.jsでworkerにクラスを投げるとメンバ変数だけが送られ、クラスの体をなしていないため、メンバ関数が呼べないという面倒な問題が起こる。masterからすればコピーされたobjectなので、クラスに格納するだけのmethodがほしいので用意。通常はtrueだと考えられます。
     * 
     * @Notes need_copyしても、positionとかbond_atomsのような多重配列の場合、二次参照先は同じオブジェクトを参照するため、注意が必要です。
     */
    static getSystem(ord_system: System,need_copy=true){
        let ret = new System();
        if(isNull(ord_system))throw Error("");
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

    add_bond(atoma_name:string,atomb_name:string,bondtype:BOND_TYPE){

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

    *getAtoms(){
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
                this.getAtom(this.bond_atoms[i][0]),
                this.getAtom(this.bond_atoms[i][1]),
                this.bond_types[i],
            )
        }
    }
}

export class CarParser implements iParser{
    constructor(){
    }
    
    get require_extensions(): Array<string>{
        return ["car","mdf"]
    }

    parse(files:File[]): Promise<System>{

        let car_reader = new FileReader();
        let mdf_reader = new FileReader();

        let ret2 = new Promise<System>((resolve,reject) => {

            if(files.length != 2){reject("does not match");}

            let car_path = searchFile(files,'car')[0]
            let mdf_path = searchFile(files,'mdf')[0]

            let fileread = Promise.all<string>([
                new Promise<string>((resolve,reject) =>{
                    car_reader.onload = function(e) {
                        resolve(car_reader.result as string);
                    }
                    car_reader.onerror = function(e){
                        reject(e);
                    }
                    car_reader.readAsText(car_path);
                }),

                new Promise<string>((resolve,reject) =>{
                    mdf_reader.onload = function(e) {
                        resolve(mdf_reader.result as string);
                    }
                    mdf_reader.onerror = function(e){
                        reject(e);
                    }
                    mdf_reader.readAsText(mdf_path);
                }),
            ])

            fileread.then((text:string[])=>{
                let system = this.__process(text);
                resolve(system);
            })
            fileread.catch((reason:any)=>{
                reject(reason);
            })
        })

        return ret2;
    }

    __process(texts: string[]):System{
        let system = new System;

        this.__car_process(texts[0],system);
        this.__mdf_process(texts[1],system);

        return system;
    }

    __car_process(cartext:string,system:System){
        let rows = cartext.split("!DATE")[1].split("end")[0].split("\n");
        let atomsinfo = rows.slice(1,rows.length-1);
        atomsinfo.forEach((value:string,index:number)=>{
            let cols = value.split(" ").filter((value)=>{return value!=""});

            let selem = cols[0].split(/\d+/)[0]
            let elem = elemStr2Type(selem);

            let posi = cols.slice(1,4).map((value)=>{
                return parseFloat(value);
            });

            system.add_atom(cols[0],posi,elem);
        })
    }

    __mdf_process(mdftext:string, system:System){
        let rows = mdftext.split("@molecule")[1].split("#end")[0].split(/[\n\r]+/);
        let bondinfos = rows.slice(1,rows.length-1);
        bondinfos.forEach((value)=>{
            if(value==="" || value===" "){return;}
            let cols = value.split(" ").filter((value)=>{return value!=="";});
            
            let thisatom = cols[0].split(":")[1];
            let connections = cols.slice(12);

            connections.forEach((connect)=>{
                system.add_bond(thisatom,connect,0);
            });
        })
    }
}