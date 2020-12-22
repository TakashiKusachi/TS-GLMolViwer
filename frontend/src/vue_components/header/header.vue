<template>
    <header id="header-contents">
        <header-main-menu v-for="rootmenu in nodes" :key="rootmenu.text" :root="rootmenu"></header-main-menu>
    </header>
</template>

<style lang="scss" scoped>

#header-contents {
    background-color: dimgray;
    list-style: none;
    border-bottom: 1px solid black;
}

</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node, submenu_type} from "./header_util"
import HeaderMainMenu from "./header_mainmenu.vue"

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