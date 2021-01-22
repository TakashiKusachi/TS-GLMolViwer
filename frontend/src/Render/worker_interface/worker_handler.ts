
import {Worker,spawn,Thread,ModuleThread,Transfer} from 'threads'
import {RenderWorker} from "../worker/render_worker"

export type WorkerHandler = ModuleThread<RenderWorker>

class clsWorker{
    private __hander: WorkerHandler;
    constructor(hander:WorkerHandler){
        this.__hander = hander;
    }
    get handler(){
        return this.__hander;
    }
}

export async function chartWorker(name:string = "../worker/render_worker.ts"){
    let worker = await spawn<RenderWorker>(new Worker("../worker/render_worker.ts"));
    let _worker = new clsWorker(worker)
    return worker
}