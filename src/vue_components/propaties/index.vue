<template>
    <div id="propaties_view">
    </div>
</template>

<style scoped>
#propaties_view {
    height: calc(100% - 4px);
    display: inline-block;
    width: 28%;
    border: 2px solid black;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";

@Component({
    name: "propaties",
    components:{
    }
})
export default class Propaties extends Vue{
    constructor(){
        super();
    }

}
</script>