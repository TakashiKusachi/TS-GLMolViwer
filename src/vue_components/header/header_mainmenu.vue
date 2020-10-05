<template>
    <li>
        {{root.text}}
        <ul v-if="root.childs.length > 0" >
            <header-sub-menu v-for="submenu in root.childs" :key="submenu.text" :root="submenu" ></header-sub-menu>
        </ul>
    </li>
</template>

<style scoped>

li{
    height: 20px;
    padding-right: 10px;
    padding-left: 10px;
    background-color: rgb(140, 221, 137);
    position: relative;
}

li > ul{
    background-color: rgb(137, 187, 221);
    position: absolute;
    top: 100%;
    margin: 0px;
    left: 0px;

    display: none;

    list-style: none;
}

li:hover > ul{
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