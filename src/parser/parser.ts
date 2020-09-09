import {System,ElemType,Position,elemStr2Type} from "../system"
import { isNull } from "util";
import {CarParser} from "./car_parser"
import {match,getExtension} from './utils'

export interface iParser{
    parse: (files:File[])=>Promise<System>;
    require_extensions: Array<string>;
}

export enum tryParseResult{
    SUCCESS = 0,
    NOT_ENOUGH = 1,
    FAILURE = 2,
}

export class AtomicsParsers{
    private parsers: Array<iParser>;

    constructor(){
        this.parsers = [
            new CarParser(),
        ]
    }

    try_parse(_files: FileList): tryParseResult{
        
        let files = new Array<File>();
        for(let i = 0;i < _files.length;i++){
            files.push(_files[i]);
        }

        let parser = this.search(files);
        if(!isNull(parser)){
            return tryParseResult.SUCCESS
        }
        return tryParseResult.FAILURE;
    }

    parse(_files: FileList): Promise<System>{
        let prom: Promise<System>;

        let files = new Array<File>();
        for(let i = 0;i < _files.length;i++){
            files.push(_files[i]);
        }
        
        let parser = this.search(files) as iParser;

        prom = parser.parse(files);
        return prom;
    }
    
    search(files: File[]): iParser| null{

        let extensions = files.map<string|undefined>((value)=>{
            return getExtension(value);
        })

        let mac_parsers = this.parsers.filter((value)=>{
            let ext = extensions as string[];
            return match(value.require_extensions,ext);
        })
        if(mac_parsers.length == 1){
            return mac_parsers[0];
        }
        else{
            return null;
        }
    }
}