import {IAtomicRender,SelectedEvent} from "./Render"
import {OnAtomicRender,WorkerAtomicRender} from "./Render/renderInter"
import {AtomicsParsers,tryParseResult} from "./parser/parser"
import * as parser from "./parser/car_parser"
import { StaticDrawUsage } from "three";
import {System} from "./system"
import { isUndefined } from "util";

import {spawn, Thread, Worker} from 'threads'


class Application{
    
    private system: System | null = null;
    private renderer: IAtomicRender;

    constructor(){
        //let canvas = document.getElementById("gl_canvas") as HTMLCanvasElement;
        const canvas = document.querySelector("#gl_canvas") as HTMLCanvasElement ;
        this.renderer = new WorkerAtomicRender(canvas);
    }

    initialize(): void{
        this.renderer.init().then(()=>{
            this.setEvent();
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

        let result = this.system?.getNames().findIndex((val)=>val===event.select);
        if(!isUndefined(result)){
            propaties.appendChild(document.createTextNode(event.select));
        }
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

let app = new Application();
window.onload = ()=>{app.initialize();};