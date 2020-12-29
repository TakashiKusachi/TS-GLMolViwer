<template>
    <div class="header_menu_main_content" v-bind:class="{right_side:isRightSide}">
        {{root.text}}
        <ul v-if="root.childs.length > 0" v-bind:class="{right_side:isRightSide, left_side:!isRightSide}">
            <header-sub-menu v-for="submenu in root.childs" :key="submenu.text" 
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
    </div>
</template>

<style scoped>

.right_side{
    float:right;
}

.header_menu_main_content{
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

.header_menu_main_content:hover{
    background-color: gray;
}

.header_menu_main_content > ul{
    position: absolute;
    top: 100%;
    margin: 0px;

    display: none;

    list-style: none;
}

.header_menu_main_content > ul.left_side{
    left: 0px;
}

.header_menu_main_content > ul.right_side{
    right: 0px;
}

.header_menu_main_content:hover > ul{
    display: block;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node, parent_position} from "./header_util"
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
    get isRightSide(){
        if (this.root === undefined){
            return false
        }
        if (this.root.position === undefined){
            return false
        }
        else if(this.root.position === parent_position.LEFT){
            return false
        }
        return true
    }
}

</script>