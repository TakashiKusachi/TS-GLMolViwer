<template>
    <div id="loader-bg" :class="loader_class">
        <div id="loader" :class="loader_class">
            <vue-loaders name="ball-pulse" color="gray" scale="1"></vue-loaders>
            <p>NowLoading</p>
        </div>
    </div>
</template>

<style scoped>

.is-hide{
    display:none;
}

#loader-bg{
    width:100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;

    background-color: rgba(0,0,0,0.5);
}

#loader{
    text-align: center;
    position: absolute;
    width: 150px;
    height: 50px;
    background-color: rgb(21, 6, 92);
    border: black;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}

#loader > p{
    color: antiquewhite;
}
</style>

<script lang="ts">
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import 'vue-loaders/dist/vue-loaders.css'
import VueLoaders from 'vue-loaders'

Vue.use(VueLoaders)

@Component({
    name: "LoaderView",
})
export default class LoaderView extends Vue{
    @Prop() private enable: boolean = false;
    constructor(){
        super();
    }

    get loader_class(){
        return{
            "is-hide": !this.enable,
        }
    }
}
</script>