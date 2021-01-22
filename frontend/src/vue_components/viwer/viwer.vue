<template>
    <div class="content" id="view-area">
        <canvas id="gl_canvas"></canvas>
    </div>
</template>

<style scoped lang="scss">
.content{
    height: 100%;
    width: 100%;
    display: inline-block;
}

#view-area {
    height: 100%;
}

#gl_canvas {
    width: 100%;
    height: 100%;
    display: block;
    background-color: black;
}
</style>

<script lang="ts">

import {System} from "../../systems"
import {IAtomicRender,SelectedEvent} from "../../Render"
import {WorkerAtomicRender} from "../../Render"
import {InvalidIdError} from "../../errorHandler"
import {chartWorker,WorkerHandler} from "../../Render/worker_interface/worker_handler"

import Component from "vue-class-component";
import {Vue,Prop,Emit, Watch} from "vue-property-decorator";

@Component({
    name: "Viwer",
    components:{
    }
})
export default class Viwer extends Vue{
    private renderer: IAtomicRender|undefined;

    @Prop({required:true})
    private system!: System|null;

    private worker: WorkerHandler|null = null;

    constructor(){
        super();
    }

    async mounted(){
        this.busy();
        await chartWorker().then((worker)=>{
            this.worker = worker
            try{
                const canvas = document.querySelector("#gl_canvas") as HTMLCanvasElement ;
                if (canvas === null) throw new InvalidIdError(`#gl_canvasが存在しません。`);
                this.renderer = new WorkerAtomicRender(canvas,this.worker);
            }catch(e){
                alert("エラーが発生しました。");
                throw e;
            }
            this.renderer.init().then(()=>{
                this.renderer?.addSelectedEvent((e:SelectedEvent)=>{this.selectAtom(e)})
                this.ready();
            })
        })
    }

    selectAtom(e:SelectedEvent){
        this.$emit("selectAtom",e.select)
    }

    @Watch('system')
    systemChanded(newSystem:System|null,oldSystem:System|null){
        this.busy();
        if(newSystem == null){
            return this.renderer?.clearScene().then((e)=>{this.ready()});
        }
        else{
            return this.renderer?.setSystem(newSystem).then((e)=>{this.ready()});
        }
   }

    @Emit()busy(){}
    @Emit()ready(){}
}

</script>