import {IAtomicRender,SelectedEvent} from "./Render"
import {OnAtomicRender,WorkerAtomicRender} from "./Render/renderInter"
import {AtomicsParsers,tryParseResult} from "./parser/parser"
import * as parser from "./parser/car_parser"
import { StaticDrawUsage } from "three";
import {AbstractSystem as System} from "./system"
import { isUndefined } from "util";
import {InvalidIdError} from "./errorHandler"

import {spawn, Thread, Worker} from 'threads'


class Application{
    
    private system: System | null = null;
    private renderer: IAtomicRender;

    constructor(id:string){
        this.onLoad()
        try{
            const canvas = document.querySelector(id) as HTMLCanvasElement ;
            if (canvas === null) throw new InvalidIdError(`${id}が存在しません。`);
            this.renderer = new WorkerAtomicRender(canvas);
        }catch(e){
            alert("エラーが発生しました。")
            throw e;
        }
    }

    initialize(): void{
        this.renderer.init().then(()=>{
            this.setEvent();
            this.offLoad();
        })
    }

    setEvent(): void {
        this.openfileEvent();
        this.newEvent();
        this.selectAtomEvent();
    }

    openfileEvent(){
        var openfile: HTMLElement;

        openfile = document.getElementById("file") as HTMLElement;
        openfile?.addEventListener('change',(e)=>{this._openfile(e)});
    }

    _openfile(e: Event){
        let target = e.target as HTMLInputElement;
        let files = target.files as FileList;

        this.onLoad()

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            this.setState("File Load")
            parser.parse(files).then((system)=>{
                this.setState("Drow System")
                this.system = system;
                return this.renderer.setSystem(system);
            }).then(()=>{
                this.setState("Drow Finish")
                this.offLoad();
                target.value = "";

            })
        }
    }

    newEvent(){
        var newbutton = document.getElementById("new") as HTMLElement;
        newbutton.addEventListener("click",(e)=>{this._newEvent();});
    }

    _newEvent(){
        this.renderer.clearScene();
        this.system = null;
    }

    selectAtomEvent(){
        this.renderer.addSelectedEvent((event)=>{this._selectAtomEvent(event)});
    }

    _selectAtomEvent(event:SelectedEvent){
        let propaties = document.getElementById("control-area") as HTMLElement;
        let system = this.system as System;
        let i = system.atomIndexOf(event.select)
        let atom = system.getAtom(i)
    }

    setState(value: string){
        let state = document.getElementById("state");
        state?.childNodes.forEach((values)=>{values.remove()});
        state?.appendChild(document.createTextNode(value));
    }

    onLoad(){
        let loaderbg = document.getElementById("loader-bg");
        let loader = document.getElementById("loader");
        loaderbg?.classList.remove("is-hide")
        loader?.classList.remove("is-hide")
    }

    offLoad(){
        let loaderbg = document.getElementById("loader-bg");
        let loader = document.getElementById("loader");
        loaderbg?.classList.add("is-hide")
        loader?.classList.add("is-hide")
    }
}

let app = new Application("#gl_canvas");
window.onload = ()=>{app.initialize();};