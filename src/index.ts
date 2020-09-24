import {IAtomicRender,SelectedEvent} from "./Render"
import {OnAtomicRender,WorkerAtomicRender} from "./Render"
import {AtomicsParsers,tryParseResult} from "./parser/parser"
import {System} from "./systems"
import {InvalidIdError} from "./errorHandler"

//import Vue from "vue"
import Component from "vue-class-component";
import {Vue,Prop} from "vue-property-decorator";
import NewAtomForm from './vue_components/addAtom.vue'
import LoaderView from "./vue_components/loaderView.vue"
import HeaderMenu from "./vue_components/header.vue"

@Component({
    el: "#vueapp",
    components:{
        NewAtomForm,
        LoaderView,
        HeaderMenu,
    }
})
class VueApp extends Vue{

    private system: System | null = null;
    private renderer: IAtomicRender|undefined;

    private newAtomEnable = false;
    private loaderEnable = false;

    mounted(){
        this.showLoaderView();
        try{
            const canvas = document.querySelector("#gl_canvas") as HTMLCanvasElement ;
            if (canvas === null) throw new InvalidIdError(`#gl_canvasが存在しません。`);
            this.renderer = new WorkerAtomicRender(canvas);
        }catch(e){
            alert("エラーが発生しました。");
            throw e;
        }
        this.renderer.init().then(()=>{
            this.renderer?.addSelectedEvent((e:SelectedEvent)=>{this.selectAtom(e)})
            this.hideLoaderView();
        })
    }

    New(){
        if(this.renderer === undefined)return;
        this.renderer.clearScene();
        this.system = null;
    }

    openFile(files:FileList){
        this.showLoaderView();
        if(this.renderer === undefined)return;

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            //this.setState("File Load")
            parser.parse(files).then((system)=>{
                //this.setState("Drow System")
                this.system = system;
                return this.renderer?.setSystem(system);
            }).then(()=>{
                //this.setState("Drow Finish")
                this.hideLoaderView();

            }).catch((reason)=>{

            })
        }
        else{
            alert(`指定したファイルは対応外です。対応したファイルの入力してください。`);
            this.hideLoaderView();
        }
    }

    selectAtom(e:SelectedEvent){
        alert(e.select);
    }

    showLoaderView(){
        this.loaderEnable = true;
    }
    hideLoaderView(){
        this.loaderEnable = false;
    }

    showNewAtomForm(){
        this.newAtomEnable = true;
    }
    newAtomSubmit(e:{element:string}){
        this.newAtomEnable = false;
    }
    newAtomCancel(){
        this.newAtomEnable = false;
    }
}
