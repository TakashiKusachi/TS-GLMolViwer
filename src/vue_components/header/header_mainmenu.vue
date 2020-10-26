<template>
    <li class="header_menu_main_content">
        {{root.text}}
        <ul v-if="root.childs.length > 0" >
            <header-sub-menu v-for="submenu in root.childs" :key="submenu.text" :root="submenu" ></header-sub-menu>
        </ul>
    </li>
</template>

<style scoped>

li.header_menu_main_content{
    height: 100%;
    padding-right: 0.5em;
    padding-left: 0.5em;
    background-color: dimgray;
    border-width: 1px;
    border-style: none solid none none;
    border-color: black;
    color: white;
    position: relative;
}

li.header_menu_main_content:hover{
    background-color: gray;
}

li.header_menu_main_content > ul{
    position: absolute;
    top: 100%;
    margin: 0px;
    left: 0px;

    display: none;

    list-style: none;
}

li.header_menu_main_content:hover > ul{
    display: block;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node} from "./header_util"
import HeaderSubMenu from "./header_submenu.vue"

@Component({
    name: "HeaderMainMenu",
    components: {
        HeaderSubMenu,
    }
})
export default class HeaderMainMenu extends Vue{
    @Prop() private root?: node;
    private hover: boolean = false;
    constructor(){
        super();
    }
}

</script>