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
            x: <input type="text" :value="atomPx" v-on:input="setAtomPx = $event.target.value"/><br>
            y: <input type="text" :value="atomPy" v-on:input="setAtomPy = $event.target.value"/><br>
            z: <input type="text" :value="atomPz" v-on:input="setAtomPz = $event.target.value"/><br>
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
            font-size: 1em;
            border: none;
        }
    }
}
</style>

<script lang="ts">
import {System,IAtom} from "../../systems"

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
    private atom!:IAtom|null;

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

    /**
     * parseFloatで例外を発生させるための関数
     * 
     * @param value numberの数値に変換する文字列
     * @throws 数値に変換できない文字列を入力したときに発生します。
     */
    __parse2Float(value:string):number{
        let num: number = parseFloat(value)
        if(isNaN(num)){
            throw "invalid error ["+value+"]"
        }
        return num
    }
    set setAtomPx(value:string){
        try{
            if(this.atom != null){
                //this.atom.position[0] = this.__parse2Float(value)
            }
        }
        catch(e){
            console.log(e)
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

    set setAtomPy(value:string){
        try{
            if(this.atom != null){
                //this.atom.position[1] = this.__parse2Float(value)
            }
        }
        catch(e){
            console.log(e)
        }
    }
    get atomPy(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.position[1]
        }
    }

    set setAtomPz(value:string){
        try{
            if(this.atom != null){
                //this.atom.position[2] =  this.__parse2Float(value)
            }
        }
        catch(e){
            console.log(e)
        }
    }
    get atomPz(){
        if(this.atom == null){
            return "";
        }
        else {
            return this.atom.position[2]
        }
    }
}
</script>