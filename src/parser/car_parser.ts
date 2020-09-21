

import {elemStr2Type,} from "../systems/system"
import {System} from "../systems"
import {iParser} from "./parser"
import {searchFile} from './utils'

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