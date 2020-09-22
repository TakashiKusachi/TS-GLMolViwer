<template>
    <div id="newAtomForm" :class="form_class">
        <form>
            <input id="elemtype" type="text" list="elemtypes"> <br>
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
    width: 150px;
    height: 50px;
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
    width: 150px;
    height: 50px;
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

@Component({
    name: "NewAtomFrom",
})
export default class NewAtomForm extends Vue{
    @Prop() private enable: boolean = false;
    constructor(){
        super();
    }

    @Emit()
    submit(e:Event){
        return;
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