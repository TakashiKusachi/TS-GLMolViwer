<template>
    <header id="header-contents">
        <ul class="header_single">
            <li v-for="rootmenu in nodes" :key="rootmenu.text">
                {{rootmenu.text}}
                <ul v-if="rootmenu.childs.length > 0">
                    <li v-for="submenu in rootmenu.childs" :key="submenu.text">
                        <label>{{submenu.text}}
                            <input :id="submenu.id" :type="submenu.type" :multiple="submenu.multiple===true" @click="submenu.cb_click" @change="submenu.cb_change">
                        </label>
                    </li>
                </ul>
            </li>
        </ul>
    </header>
</template>

<style scope>

#header-contents{
    height: 20px;
}

ul.header_single{
    display: flex;
    height: 20px;
    background-color: rgb(137, 187, 221);
    list-style: none;
}

ul.header_single > li{
    height: 20px;
    padding-right: 10px;
    padding-left: 10px;
    background-color: rgb(140, 221, 137);
    position: relative;
}

ul.header_single > li > ul{
    background-color: rgb(137, 187, 221);
    position: absolute;
    top: 100%;
    margin: 0px;
    left: 0px;

    display: none;

    list-style: none;
}

ul.header_single > li:hover > ul{
    display: block;
}

ul.header_single > li > ul > li{
    padding-right: 10px;
    padding-left: 10px;
    margin: 0px;
}

ul.header_single > li > ul > li > label > input{
    display: none;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";


type node={
    /**label text */
    text:string;
    /**button ID */
    id:string;

    /**button type */
    type?:string;
    multiple?:boolean;

    childs?: node[];
    cb_click?: (e:Event)=>any;
    cb_change?: (e:Event)=>any;
}

@Component({
    name: "HeaderMenu",
})
export default class HeaderMenu extends Vue{
    constructor(){
        super();
    }
    private nodes:node[] = [
        {
            text:"File",
            id:"File",
            childs:[
                {
                    text:"New",
                    id:"New",
                    type:"button",
                    cb_click:this.newSystem,
                },
                {
                    text:"OpenFile",
                    id:"OpenFile",
                    type:"file",
                    multiple:true,
                    cb_change:this.openFile,
                }
            ]
        },
        {
            text:"Viewer",
            id:"Viewer",
            childs:[
                {
                    text:"BackGraund",
                    id:"BackGraund",
                    type:"color",
                }
            ]
        },
        {
            text:"Edit",
            id:"Edit",
            childs:[
                {
                    text:"NewAtom",
                    id:"NewAtom",
                    type:"button",
                    cb_click:this.newAtom,
                }
            ]
        }
    ]

    @Emit("new-system")
    newSystem(e:Event){
        return;
    }

    @Emit("open-file")
    openFile(e:Event){
        console.info("HeaderMenu openFileEvent")
        let target = e.target as HTMLInputElement;
        let files = target.files as FileList;
        return files;
    }

    @Emit("new-atom")
    newAtom(e:Event){
        return;
    }

}
</script>