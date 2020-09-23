<template>
    <div id="newAtomForm" :class="form_class">
        <form>
            <input id="elemtype" type="text" list="elemtypes" v-model="element"> <br>
            <datalist id="elemtypes">
                <option v-for="elem in elemType" :key="elem" :value="elem"></option>
            </datalist>
            <input id="newAtomSubmit" type="button" value="追加" @click="submit">
            <input id="newAtomCancel" type="button" value="キャンセル" @click="cancel">
        </form>
    </div>
</template>

<style scoped>

.is-hide{
    display:none;
}

#newAtomForm{
    width: 200px;
    height: 100px;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    margin: auto;

}

#newAtomForm > form{
    text-align: center;
    width: 200px;
    height: 100px;
    background-color: blanchedalmond;
    border: black;
    margin: auto;
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {ElemType,elemStr} from "../systems/system";

export type submitAtom={
    element:string;
}

@Component({
    name: "NewAtomFrom",
})
export default class NewAtomForm extends Vue{
    @Prop() private enable: boolean = false;
    private element: string = "";

    private elemType = elemStr
    constructor(){
        super();
    }

    @Emit()
    submit(e:Event):submitAtom{
        alert(this.element)
        return {
            element: this.element,
        };
    }

    @Emit()
    cancel(){
        return;
    }

    get form_class(){
        return{
            "is-hide": !this.enable,
        }
    }
}

</script>