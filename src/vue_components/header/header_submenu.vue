<template>
    <li>
        <label>{{root.text}}
            <input :id="root.id" :type="root.type" :multiple="root.multiple===true" 
                @click="root.cb_click!==undefined? root.cb_click($event):null"
                @change="root.cb_change!==undefined? root.cb_change($event):null">
        </label>
        <ul v-if="root.childs.length > 0">
            <header-sub-menu v-for="submenu in root.childs" :key="submenu.text" :root="submenu"></header-sub-menu>
        </ul>
    </li>
</template>

<style scoped>

 li{
    padding-right: 10px;
    padding-left: 10px;
    margin: 0px;
}

li > label > input{
    display: none;
}

li > ul{
    background-color: rgb(137, 187, 221);
    position: absolute;
    top: 0%;
    margin: 0px;
    left: 100%;

    display: none;

    list-style: none;
}

li:hover >  ul{
    display: block;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node} from "./header_util";

@Component({
    name: "HeaderSubMenu",
    components: {
        HeaderSubMenu,
    }
})
export default class HeaderSubMenu extends Vue{
    @Prop() private root?: node
    constructor(){
        super();
    }
    _run_callback(cb_fn?:(obj?:any)=>void){
        if (cb_fn !== undefined){
            return cb_fn
        }
        else{
            return (obj?:any)=>null;
        }
    }
}

</script>