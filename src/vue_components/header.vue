<template>
    <header id="header-contents">
        <ul class="header_single">
            <header-main-menu v-for="rootmenu in nodes" :key="rootmenu.text" :root="rootmenu"></header-main-menu>
        </ul>
    </header>
</template>

<style lang="scss" scoped>

#header-contents {
    height: 1.5em;
}

ul.header_single {
    display: flex;
    height: 100%;
    background-color: dimgray;
    list-style: none;
    border-left: 1px solid black;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node, submenu_type} from "./header/header_util"
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
    @Prop() private nodes? :node[];

}
</script>