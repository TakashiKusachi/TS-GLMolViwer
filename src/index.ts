import {AtomicRender,SelectedEvent} from "./render"
import {AtomicsParsers,tryParseResult} from "./parser/parser"
import * as parser from "./parser/car_parser"
import { StaticDrawUsage } from "three";
import {System} from "./system"
import { isUndefined } from "util";

class Application{
    
    private system: System | null = null;
    private renderer: AtomicRender;

    constructor(){
        this.renderer = new AtomicRender("#gl_canvas");
    }

    initialize(): void{
        this.setEvent();
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
        //let file = files?.item(0) as File;

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            parser.parse(files).then((system)=>{
                this.system = system;
                return this.renderer.setSystem(system);
            }).then(()=>{
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
}

let app = new Application();
window.onload = ()=>{app.initialize();};