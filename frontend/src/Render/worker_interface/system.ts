import {Atom,Bond,ISystem,System} from "../../systems/index"

import {Worker,spawn,Thread,ModuleThread,Transfer} from 'threads'
import {RenderWorker} from "../worker/render_worker"
import {WorkerHandler} from "./worker_handler"
/**
 * worker内に存在するsystemとアクセスするためのクラス
 */
class WoIn_System extends System{
    public systemName:string = "car"
    private worker: WorkerHandler;

    constructor(worker: WorkerHandler){
        super()
        this.worker = worker;

    }
}
