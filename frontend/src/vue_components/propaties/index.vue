<template>
    <div id="propaties_view">
        # of Atoms: {{nAtoms}}<br>
        # of Bonds: {{nBonds}}<br>
    </div>
</template>

<style scoped>
#propaties_view {
    height: 100%;
    width: 100%;
    display: block;
}
</style>

<script lang="ts">
import {System} from "../../systems"

import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";

@Component({
    name: "propaties",
    components:{
    }
})
export default class Propaties extends Vue{
    @Prop({required:true})
    private system!:System|null;

    constructor(){
        super();
    }

    get nAtoms(){return this.system?.natoms;}
    get nBonds(){return this.system?.nbond;}

}
</script>