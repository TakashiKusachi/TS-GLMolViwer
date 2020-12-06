<template>
    <div id="vueapp">
        <loader-view :enable="loaderEnable"></loader-view>
        <new-atom-form :enable="newAtomEnable" @submit="newAtomSubmit" @cancel="newAtomCancel"></new-atom-form>
        <header-menu :nodes="nodes"></header-menu>
        <div id="main-contents">
            <div class="content" id="view-area">
                <canvas id="gl_canvas"></canvas>
            </div>
            <propaties></propaties>
        </div>
        <div id="fotter-contents">
            <div id="state"></div>
        </div>
    </div>
</template>

<style lang="scss">

* {
    margin: 0px;
    padding: 0px;
}

html, body{
    height: 100%;
    overflow: hidden;
}

</style>

<style scope lang="scss">
#vueapp {
    height:100%;
    width: 100%;
}

#main-contents{
    overflow: hidden;
    display: block;
    width: 100%;
    height: calc(100% - 22px - 1.5em);

    .content{
        height: 100%;
        display: inline-block;
    }

    #view-area {
        border: 2px ridge;
        width: 70%;
        height: calc(100% - 4px);
    }
}

#gl_canvas {
    width: 100%;
    display: block;
}

#fotter-contents{
    display: block;
    height: 20px;
    width: 100%;
}
</style>

<script lang="ts">
import {IAtomicRender,SelectedEvent} from "../Render"
import {OnAtomicRender,WorkerAtomicRender} from "../Render"
import {AtomicsParsers,tryParseResult} from "../parser/parser"
import {System} from "../systems"
import {InvalidIdError} from "../errorHandler"

import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import NewAtomForm from './addAtom.vue';
import LoaderView from "./loaderView.vue";
import HeaderMenu from "./header.vue";
import Propaties from "./propaties/index.vue"
import {node, submenu_type} from "./header/header_util"

@Component({
    name: "Index",
    components:{
        NewAtomForm,
        LoaderView,
        HeaderMenu,
        Propaties,
    }
})
export default class MainPage extends Vue{
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


    constructor(){
        super();
    }

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
</script>