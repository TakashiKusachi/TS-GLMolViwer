<template>
    <header id="header-contents">
        <ul class="header_single">
            <header-main-menu v-for="rootmenu in nodes" :key="rootmenu.text" :root="rootmenu"></header-main-menu>
        </ul>
    </header>
</template>

<style scoped>

#header-contents{
    height: 20px;
}

ul.header_single{
    display: flex;
    height: 20px;
    background-color: rgb(137, 187, 221);
    list-style: none;
}

</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node} from "./header/header_util"
import HeaderMainMenu from "./header/header_mainmenu.vue"

@Component({
    name: "HeaderMenu",
    components:{
        HeaderMainMenu,
    }
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
                    childs: [],
                },
                {
                    text:"OpenFile",
                    id:"OpenFile",
                    type:"file",
                    multiple:true,
                    cb_change:this.openFile,
                    childs: [],
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
                    childs: [],
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
                    childs: [],
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