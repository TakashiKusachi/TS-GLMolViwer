<template>
    <li class="header_menu_sub_content" v-show="disable">
        <label>{{text}}
            <input v-if="is_button()" type="button" @click="cb_click"/>
            <input v-if="is_file()" type="file" :multiple="multiple===true" @change="cb_change"/>
        </label>
        <ul v-if="is_parent()">
            <header-sub-menu v-for="submenu in childs" :key="submenu.text" 
                :type="submenu.type"
                :position="submenu.position"
                :disable="submenu.disable"
                :text="submenu.text"
                :childs="submenu.childs"
                :cb_click="submenu.cb_click"
                :cb_change="submenu.cb_change"
                :multiple="submenu.multiple"
            ></header-sub-menu>
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
import {node,parent_position,submenu_type} from "./header_util";

@Component({
    name: "HeaderSubMenu",
    components: {
        HeaderSubMenu,
    }
})
export default class HeaderSubMenu extends Vue{
    @Prop() private type!: submenu_type
    @Prop() private position!: parent_position
    @Prop() private disable!: boolean
    @Prop() private text!: string
    @Prop() private childs!: node[]
    @Prop() private cb_click!: (e:Event)=>any
    @Prop() private cb_change!: (e:Event)=>any
    @Prop() private multiple!: boolean

    constructor(){
        super();
    }

    is_parent():boolean{
        return this.type==submenu_type.PARENT && this.childs.length > 0;
    }

    is_button():boolean{
        return this.type==submenu_type.BUTTON;
    }

    is_file():boolean{
        return this.type==submenu_type.FILE;
    }
}

</script>