<template>
    <div class="header_user_menu right_side">
        User
        <ul class="right_side">
            <header-sub-menu v-for="submenu in filltedNode" :key="submenu.text" :root="submenu" ></header-sub-menu>
        </ul>
    </div>
</template>

<style scoped>

.right_side{
    float:right;
}

.header_user_menu{
    display: inline-block;
    height: 1.5em;
    padding-right: 0.5em;
    padding-left: 0.5em;
    background-color: dimgray;
    border-width: 1px;
    border-style: none solid none none;
    border-color: black;
    color: white;
    position: relative;
}

.header_user_menu:hover{
    background-color: gray;
}

.header_user_menu > ul{
    position: absolute;
    top: 100%;
    margin: 0px;

    display: none;

    list-style: none;
}

.header_user_menu > ul.left_side{
    left: 0px;
}

.header_user_menu > ul.right_side{
    right: 0px;
}

.header_user_menu:hover > ul{
    display: block;
}
</style>

<script lang="ts">
import axios from "axios"
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node, parent_position,submenu_type} from "./header_util"
import HeaderSubMenu from "./header_submenu.vue"

export type user_model ={
    name: string,
    id: string,
}

@Component({
    name: "HeaderUserMenu",
    components: {
        HeaderSubMenu,
    }
})
export default class HeaderUserMenu extends Vue{
    @Prop()
    private user!: user_model;

    private nodes:node[] = [
        {
            type: submenu_type.BUTTON,
            text: "Login",
            disable: !this.isLogined,
            cb_click: ()=>{

            }
        },
        {
            type: submenu_type.BUTTON,
            text: "Logout",
            disable: this.isLogined,
            cb_click: ()=>{

            }
        },
    ]
    constructor(){
        super();
    }

    get filltedNode(){
        return this.nodes.filter((value)=>{
            return value.disable==false
        })
    }

    get isLogined(){
        return this.user.id == ""
    }
}

</script>