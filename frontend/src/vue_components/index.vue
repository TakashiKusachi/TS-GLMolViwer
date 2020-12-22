<template>
    <div id="vueapp">
        <loader-view :enable="loaderEnable"></loader-view>
        <new-atom-form :enable="newAtomEnable" @submit="newAtomSubmit" @cancel="newAtomCancel"></new-atom-form>
        <header-menu :nodes="nodes" :user="user"></header-menu>
        <example-viwe :dataset="example_dataset" @select_id="load_model"></example-viwe>
        <div id="main-contents">
            <div id="main-contents-left"><viwer id="view-area" :system="system" @busy="showLoaderView" @ready="hideLoaderView"></viwer></div>
            <div id="main-contents-right"><propaties :system="system"></propaties></div>
        </div>
        <div id="fotter-contents">
            <div id="state">
                <div id="state_icon" v-bind:class="{blue:is_server_connected, red:!is_server_connected}"></div>
                <span>{{is_server_connected?"Connected":"Not Connected"}}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
* {
    margin: 0px;
    padding: 0px;
    border-spacing: 0px;
}

html, body{
    height: 100%;
    overflow: hidden;
    //background-color: dimgray;
}

</style>

<style scope lang="scss">

$FOTTER_SIZE    : 20px;

#vueapp {
    height:100%;
    width: 100%;
}

#main-contents{
    overflow: hidden;
    display: block;
    width: 100%;
    height: calc(100% - #{$FOTTER_SIZE} - 2px - 1.5em);
    div {
        vertical-align: top;
        display: inline-block;
        height: 100%;
    }
    &-left{
        width: 70%;
    }
    &-right{
        width: 28%;
    }
}

#fotter-contents{
    display: inline-block;
    height: $FOTTER_SIZE;
    width: 100%;
    #state {
        display: inline-block;
        height:100%;
        &_icon{
            display: inline-block;
            height: $FOTTER_SIZE;
            width: $FOTTER_SIZE;
            border-radius: 50%;
        }
        .blue{
            background-color: blue;
        }
        .red{
            background-color: red;
        }
    }
}
</style>

<script lang="ts">
import {IAtomicRender,SelectedEvent} from "../Render"
import {OnAtomicRender,WorkerAtomicRender} from "../Render"
import {AtomicsParsers,tryParseResult} from "../parser/parser"
import {System} from "../systems"
import {InvalidIdError} from "../errorHandler"

import Component from "vue-class-component";
import {Vue,Prop,Emit, Watch} from "vue-property-decorator";
import NewAtomForm from './addAtom.vue';
import LoaderView from "./loaderView.vue";
import HeaderMenu,{user_model} from "./header/header.vue";
import Propaties from "./propaties/index.vue"
import Viwer from "./viwer/viwer.vue"
import ExampleViwe from "./Example_viwe/example_viwe.vue"
import {node, parent_position, submenu_type} from "./header/header_util"

import io from "socket.io-client"
import axios from "axios"
import { BondType } from "../systems/system"

@Component({
    name: "Index",
    components:{
        NewAtomForm,
        LoaderView,
        ExampleViwe,
        HeaderMenu,
        Viwer,
        Propaties,
    }
})
export default class MainPage extends Vue{
    private system: System | null = null;

    private newAtomEnable = false;
    private loaderEnable = false;

    private example_dataset:any = null;

    private bond_threshold:number = 1.6;

    private timer:number = 0;
    private is_server_connected: boolean = false;
    private server_name: string = "";
    private user:user_model;

    private nodes:node[] = [
        {
            text:"File",
            type: submenu_type.PARENT,
            disable: true,
            childs:[
                {
                    text:"New",
                    type:submenu_type.BUTTON,
                    disable: true,
                    cb_click:this.New,
                },
                {
                    text:"OpenFile",
                    type:submenu_type.FILE,
                    multiple:true,
                    disable: true,
                    cb_change:this.openFile,
                }
            ]
        },
        {
            text:"Viewer",
            type:submenu_type.PARENT,
            disable: true,
            childs:[
                {
                    text:"BackGraund",
                    type:submenu_type.BUTTON,
                    disable: true,
                    cb_click:(e)=>{},
                }
            ]
        },
        {
            text:"Edit",
            type:submenu_type.PARENT,
            disable: true,
            childs:[
                {
                    text:"NewAtom",
                    type:submenu_type.BUTTON,
                    disable: true,
                    cb_click:this.showNewAtomForm,
                },
                {
                    text:"BondCalc",
                    type:submenu_type.BUTTON,
                    disable: true,
                    cb_click:this.bondCalc,
                },
            ]
        },
        {
            text:"Example",
            type:submenu_type.PARENT,
            disable: true,
            childs:[
                {
                    text:"Online",
                    type:submenu_type.BUTTON,
                    disable: true,
                    cb_click:this.online_example,
                },
            ]
        },
    ]


    constructor(){
        super();
        this.user = {
            name: "",
            id: "",
        }
    }

    mounted(){
        /** 活線確認 *
         * 
         * 3秒ごとにサーバ情報を取得。
         * 1秒以上レスポンスが帰ってこない場合は、サーバがダウンしているものとしている。
         */
        this.timer = window.setInterval(()=>{
            axios({
                method: "get",
                url: '/apis/server/info',
                timeout: 1000
            }).then((response)=>{
                this.is_server_connected = true;
            }).catch(()=>{
                this.is_server_connected = false;
            })
        },3000)
    }

    New(e:Event){
        this.system = null;
    }

    openFile(e:Event){
        console.info("HeaderMenu openFileEvent")
        let target = e.target as HTMLInputElement;
        let files =  target.files as FileList;
        this.showLoaderView();

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            parser.parse(files).then((system)=>{
                this.hideLoaderView();
                this.system = system;
            })
        }
        else{
            alert(`指定したファイルは対応外です。対応したファイルの入力してください。`);
            this.hideLoaderView();
        }
        target.value = "";
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

    online_example(){
        axios.get('/apis/db/list').then((value)=>{
            this.example_dataset=value.data.dataset;
        }).catch((error)=>{

        })
    }

    load_model(unique_id:string){
        if(unique_id === ""){
            return;
        }
        axios.get('/apis/db/data',{
            params:{
                unique_id: unique_id
            }
        }).then((response)=>{
            console.log(response)
            let numbers = response.data.numbers  
            let positions = response.data.positions
            let system = new System();
            for(let i = 0;i < numbers.length;i++){
                system.add_atom(`Atom${i}`,positions[i],numbers[i])
            }
            this.system = system
        })
    }

    bondCalc(){
        if (this.system == null){
            return;
        }
        let system = new System()
        for (let atom of this.system.getAtoms()){
            system.add_atom(atom.name,atom.position,atom.element);
        }
        let natoms = system.natoms;
        for(let i=0;i < natoms;i++){
            for (let j=i+1;j < natoms;j++){
                let atoma = system.getAtom(i);
                let atomb = system.getAtom(j);
                
                let dist = Math.sqrt(
                    Math.pow(atoma.position[0] - atomb.position[0],2) +
                    Math.pow(atoma.position[1] - atomb.position[1],2) +
                    Math.pow(atoma.position[2] - atomb.position[2],2)
                )
                if(dist < this.bond_threshold){
                    system.add_bond(atoma.name,atomb.name,BondType.Single);
                }
            }
        }
        this.system= system;
    }
}
</script>
