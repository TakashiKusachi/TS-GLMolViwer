
import index from "./vue_components/index.vue"
var vueapp = new index();
vueapp.$mount("#vueapp");

/*
class Application{
    
    private system: System | null = null;
    private renderer: IAtomicRender;

    constructor(id:string){
        this.onLoad()
        try{
            const canvas = document.querySelector(id) as HTMLCanvasElement ;
            if (canvas === null) throw new InvalidIdError(`${id}が存在しません。`);
            this.renderer = new WorkerAtomicRender(canvas);
        }catch(e){
            alert("エラーが発生しました。");
            throw e;
        }
    }

    initialize(): void{
        this.renderer.init().then(()=>{
            this.setEvent();
            this.offLoad();
        }).catch((reason)=>{

        })
    }

    setEvent(): void {
        this.openfileEvent();
        this.newEvent();
        this.newAtomEvent();
        this.selectAtomEvent();
    }

    openfileEvent(){
        let openfile: HTMLElement;

        openfile = document.getElementById("file") as HTMLElement;
        if(openfile === null)throw new InvalidIdError("fileが存在しません。");
        openfile.addEventListener('change',(e)=>{this._openfile(e)});
    }

    _openfile(e: Event){
        let target = e.target as HTMLInputElement;
        let files = target.files as FileList;

        this.onLoad()

        let parser = new AtomicsParsers();
        if(parser.try_parse(files) == tryParseResult.SUCCESS){
            this.setState("File Load")
            parser.parse(files).then((system)=>{
                this.setState("Drow System")
                this.system = system;
                return this.renderer.setSystem(system);
            }).then(()=>{
                this.setState("Drow Finish")
                this.offLoad();
                target.value = "";

            }).catch((reason)=>{

            })
        }
        else{
            alert(`指定したファイルは対応外です。対応したファイルの入力してください。`);
            this.offLoad();
        }
    }

    newEvent(){
        let newbutton = document.getElementById("new") as HTMLElement;
        if(newbutton === null) throw new InvalidIdError("newが存在しません。");
        newbutton.addEventListener("click",(e)=>{this._newEvent();});
    }

    _newEvent(){
        this.renderer.clearScene();
        this.system = null;
    }

    newAtomEvent(){
        let newbutton = document.getElementById("newAtom") as HTMLElement;
        if(newbutton === null) throw new InvalidIdError("newAtomが存在しません。");

        newbutton.addEventListener("click",(e)=>{
            vueapp.showNewAtomForm();
        })
    }

    selectAtomEvent(){
        this.renderer.addSelectedEvent((event)=>{this._selectAtomEvent(event)});
    }

    _selectAtomEvent(event:SelectedEvent){
        let propaties = document.getElementById("control-area") as HTMLElement;
        let system = this.system as System;
        let i = system.atomIndexOf(event.select)
        let atom = system.getAtom(i)
    }

    setState(value: string){
        let state = document.getElementById("state");
        if(state === null)throw new InvalidIdError("stateが存在しません。");
        state.childNodes.forEach((values)=>{values.remove()});
        state.appendChild(document.createTextNode(value));
    }

    onLoad(){
        vueapp.showLoaderView()
    }

    offLoad(){
        vueapp.hideLoaderView();
    }
}
*/
