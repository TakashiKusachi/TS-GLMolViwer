<template>
    <div id="propaties_view">
        <p>System</p>
        <div>
            # of Atoms: {{nAtoms}}<br>
            # of Bonds: {{nBonds}}<br>
        </div>

        <p v-show="isAtomNotNull">Atoms</p>
        <div v-show="isAtomNotNull">
            Name: {{atomName}}<br>
            Position:<br>
            x: <input type="text" :value="atomPx"/><br>
            y: <input type="text" :value="atomPy"/><br>
            z: <input type="text" :value="atomPz"/><br>
        </div>
    </div>
</template>

<style scoped lang="scss">
#propaties_view {
    height: 100%;
    width: 100%;
    display: block;
    p {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
    }
    div{
        display: block;
        height: auto;
        width: 100%;
        input {
            border: none;
        }
    }
}
</style>

<script lang="ts">
import {System,Atom} from "../../systems"

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

    @Prop()
    private atom!:Atom|null;

    constructor(){
        super();
    }

    get nAtoms(){return this.system?.natoms;}
    get nBonds(){return this.system?.nbond;}

    get isAtomNotNull(){
        return this.atom!=null;
    }
    get atomName(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.name
        }
    }
    get atomPx(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.position[0]
        }
    }
    get atomPy(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.position[1]
        }
}    get atomPz(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.position[2]
        }
    }

}
</script>