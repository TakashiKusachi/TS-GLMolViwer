import { expose,Transfer } from "threads/worker"
import {Observable,Subject} from "threads/observable"
import {TransferDescriptor} from 'threads'

import {AtomicRender,TickCallBack} from "../render"
import {AnyCanvas,_OffscreenCanvas,SelectedEvent} from "../"
import {DMouseEvent,DWheelEvent} from "../../control/MatStdControl"
import { System,Position,ElemType,Atom } from '../../system';
import { observable } from "vue/types/umd"

let obj: AtomicRender|undefined;

function completedReturn(process: Promise<void>):Observable<void>{
    return new Observable<void>((observable)=>{
        process.then(()=>{
            observable.complete()
        })
    })
}

const render_worker = {
    init,
    setSystem,
    clearScene,
    resize,


    __setSelectEventObserber,
    __setTickCallBack,

    /**Event Handler */
    click,
    mouseMove,
    mouseUp,
    mouseDown,
    wheel,
}

function init(canvas: AnyCanvas|TransferDescriptor<AnyCanvas>,height: number,width:number){
    let offcanvas = canvas as _OffscreenCanvas;
    offcanvas.style = {height:height,width:width};
    obj = new AtomicRender(offcanvas);
    return completedReturn(new Promise((resolve)=>{
        obj = new AtomicRender(offcanvas);
        resolve();
    }))
}

function setSystem(system: System){
    let render = obj_check();
    return completedReturn(render.setSystem(system));
}

function clearScene(){
    let render = obj_check();
    render.clearScene();
}

function resize(height: number,width: number){
    let render = obj_check();
    render.resize(height,width);
}

function click(mouse_x:number,mouse_y:number){
    let render = obj_check();
    render.click(mouse_x,mouse_y);
}

function mouseUp(event:DMouseEvent){
    let render = obj_check();
    render.control.mouseUp(event);
}

function mouseMove(event: DMouseEvent){
    let render = obj_check();
    render.control.mousemove(event);
}

function mouseDown(event:DMouseEvent){
    let render = obj_check();
    render.control.mouseDown(event);
}

function wheel(e:DWheelEvent){
    let render = obj_check();
    render.control.wheel(e);
}

function __setSelectEventObserber(){
    let render = obj_check();
    return new Observable<SelectedEvent>((observer)=>{
        render.addSelectedEvent((event)=>{
            observer.next(event);
        })
    })
}

function __setTickCallBack(){
    let render = obj_check();
    return new Observable<TickCallBack>((observer)=>{
        render.setTickCallBack((sec)=>{
            observer.next(sec);
        })
    })

}

function obj_check(): AtomicRender{
    if (obj === undefined){
        throw Error("Not initialize");
    }
    return obj as AtomicRender;
}


export type RenderWorker = typeof render_worker;
expose(render_worker)