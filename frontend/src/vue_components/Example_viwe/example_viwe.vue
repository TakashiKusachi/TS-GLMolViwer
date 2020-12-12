<template>
    <div id="view" class="hidden">
        <div id="view-main">
            <ul>
                <li v-for="item in dataset" :key="item.id">
                    {{item.name}}
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scope>
div#view {
    float: left;
    position: absolute;
    top: 50vh;
    left: 50vw;
    background-color: white;
    border: black;
    height: 100px;
    width: 100px;
}

div#view-main {
    height : 80%;

}
.hidden{
    display: none;
}
</style>

<script lang="ts">

import Component from "vue-class-component";
import {Vue,Prop,Emit, Watch} from "vue-property-decorator";

@Component({
    name: "example_viwe",
    components:{
    }
})
export default class example_viwe extends Vue{
    @Prop()
    private dataset:any = null;

    constructor(){
        super();
    }

}
</script>
