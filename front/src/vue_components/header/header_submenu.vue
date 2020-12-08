<template>
    <li class="header_menu_sub_content">
        <label>{{root.text}}
            <input v-if="is_button()" type="button" @click="root.cb_click"/>
            <input v-if="is_file()" type="file" :multiple="root.multiple===true" @change="root.cb_change"/>
        </label>
        <ul v-if="is_parent()">
            <header-sub-menu v-for="submenu in root.childs" :key="submenu.text" :root="submenu"></header-sub-menu>
        </ul>
    </li>
</template>

<style scoped>

 li.header_menu_sub_content{
    padding-right: 1em;
    padding-left: 2em;
    background-color: dimgray;
    color: white;
    margin: 0px;
}

li.header_menu_sub_content:hover{
    background-color: gray;
}

li.header_menu_sub_content > label > input{
    display: none;
}

li.header_menu_sub_content > ul{
    position: absolute;
    top: 0%;
    margin: 0px;
    left: 100%;

    display: none;

    list-style: none;
}

li.header_menu_sub_content:hover >  ul{
    display: block;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node,submenu_type} from "./header_util";

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

    is_parent():boolean{
        return this.root?.type==submenu_type.PARENT && this.root.childs.length > 0;
    }

    is_button():boolean{
        return this.root?.type==submenu_type.BUTTON;
    }

    is_file():boolean{
        return this.root?.type==submenu_type.FILE;
    }
}

</script>