import {IAtomicRender,SelectedEvent} from "./Render"
import {OnAtomicRender,WorkerAtomicRender} from "./Render"
import {AtomicsParsers,tryParseResult} from "./parser/parser"
import {System} from "./systems"
import {InvalidIdError} from "./errorHandler"

//import Vue from "vue"
import Component from "vue-class-component";
import {Vue,Prop} from "vue-property-decorator";
import NewAtomForm from './vue_components/addAtom.vue'
import LoaderView from "./vue_components/loaderView.vue"
import HeaderMenu from "./vue_components/header.vue"
import Propaties from "./vue_components/propaties/index.vue"
import {node, submenu_type} from "./vue_components/header/header_util"

@Component({
    el: "#vueapp",
    components:{
        NewAtomForm,
        LoaderView,
        HeaderMenu,
        Propaties,
    }
})
class VueApp extends Vue{

    private system: System | null = null;
    private renderer: IAtomicRender|undefined;

    private newAtomEnable = false;
    private loaderEnable = false;

    private nodes:node[] = [
        {
            text:"File",
            type: submenu_type.PARENT,
            childs:[
                {
                    text:"New",
                    type:submenu_type.BUTTON,
                    cb_click:this.New,
                },
                {
                    text:"OpenFile",
                    type:submenu_type.FILE,
                    multiple:true,
                    cb_change:this.openFile,
                }
            ]
        },
        {
            text:"Viewer",
            type:submenu_type.PARENT,
            childs:[
                {
                    text:"BackGraund",
                    type:submenu_type.BUTTON,
                    cb_click:(e)=>{},
                }
            ]
        },
        {
            text:"Edit",
            type:submenu_type.PARENT,
            childs:[
                {
                    text:"NewAtom",
                    type:submenu_type.BUTTON,
                    cb_click:this.showNewAtomForm,
                }
            ]
        },
    ]

    mounted(){
        this.showLoaderView();
        try{
            const canvas = document.querySelector("#gl_canvas") as HTMLCanvasElement ;
            if (canvas === null) throw new InvalidIdError(`#gl_canvasが存在しません。`);
            this.renderer = new WorkerAtomicRender(canvas);
        }catch(e){
            alert("エラーが発生しました。");
            throw e;
        }
        this.renderer.init().then(()=>{
            this.renderer?.addSelectedEvent((e:SelectedEvent)=>{this.selectAtom(e)})
            this.hideLoaderView();
        })
    }

    New(e:Event){
        console.log(this.renderer);
        if(this.renderer === undefined)return;
        this.renderer.clearScene();
        this.system = null;
    }

    openFile(e:Event){
        console.info("HeaderMenu openFileEvent")
        let target = e.target as HTMLInputElement;
        let files = target.files as FileList;
        this.showLoaderView();
        if(this.renderer === undefined)return;

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            //this.setState("File Load")
            parser.parse(files).then((system)=>{
                //this.setState("Drow System")
                this.system = system;
                return this.renderer?.setSystem(system);
            }).then(()=>{
                //this.setState("Drow Finish")
                this.hideLoaderView();

            }).catch((reason)=>{

            })
        }
        else{
            alert(`指定したファイルは対応外です。対応したファイルの入力してください。`);
            this.hideLoaderView();
        }
        target.value = "";
    }

    selectAtom(e:SelectedEvent){
        this.renderer?.deleteAtom(e.select);
        alert(e.select);
    }

    showLoaderView(){
        this.loaderEnable = true;
    }
    hideLoaderView(){
        this.loaderEnable = false;
    }

    showNewAtomForm(e?:Event){
        this.newAtomEnable = true;
    }
    newAtomSubmit(e:{element:string}){
        this.newAtomEnable = false;
    }
    newAtomCancel(){
        this.newAtomEnable = false;
    }
}

let vueapp = new VueApp();

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
            alert("エラーが発生しました。");
            throw e;
        }
    }

    initialize(): void{
        this.renderer.init().then(()=>{
            this.setEvent();
            this.offLoad();
        }).catch((reason)=>{

        })
    }

    setEvent(): void {
        this.openfileEvent();
        this.newEvent();
        this.newAtomEvent();
        this.selectAtomEvent();
    }

    openfileEvent(){
        let openfile: HTMLElement;

        openfile = document.getElementById("file") as HTMLElement;
        if(openfile === null)throw new InvalidIdError("fileが存在しません。");
        openfile.addEventListener('change',(e)=>{this._openfile(e)});
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

            }).catch((reason)=>{

            })
        }
        else{
            alert(`指定したファイルは対応外です。対応したファイルの入力してください。`);
            this.offLoad();
        }
    }

    newEvent(){
        let newbutton = document.getElementById("new") as HTMLElement;
        if(newbutton === null) throw new InvalidIdError("newが存在しません。");
        newbutton.addEventListener("click",(e)=>{this._newEvent();});
    }

    _newEvent(){
        this.renderer.clearScene();
        this.system = null;
    }

    newAtomEvent(){
        let newbutton = document.getElementById("newAtom") as HTMLElement;
        if(newbutton === null) throw new InvalidIdError("newAtomが存在しません。");

        newbutton.addEventListener("click",(e)=>{
            vueapp.showNewAtomForm();
        })
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
        if(state === null)throw new InvalidIdError("stateが存在しません。");
        state.childNodes.forEach((values)=>{values.remove()});
        state.appendChild(document.createTextNode(value));
    }

    onLoad(){
        vueapp.showLoaderView()
    }

    offLoad(){
        vueapp.hideLoaderView();
    }
}


//let app = new Application("#gl_canvas");
//window.onload = ()=>{app.initialize();};
