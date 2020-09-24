
import { Object3D, Vector3, Raycaster, Vector2, GridHelper, Group } from 'three';
import {Worker,spawn,Thread,ModuleThread,Transfer} from 'threads'
import Stats from 'three/examples/jsm/libs/stats.module';

import { System } from '../systems';
import {Position,ElemType} from '../systems/system'
import {RenderWorker} from "./worker/render_worker"
import {AnyCanvas,SelectedEvent,IAtomicRender,_OffscreenCanvas} from "."
import {NotSupportOffscreenCanvas} from "./errorHandler"
import {AtomicRender,TickCallBack} from "./render"
import { DMouseEvent,DWheelEvent } from '../control/MatStdControl';
import { Observable } from 'threads/observable';
import { resolve } from 'path';


abstract class CanvasEventHandler{
    
    private stats: Stats;
    constructor(canvas: HTMLCanvasElement){

        this.stats = Stats();
        this.stats.showPanel(0);
        this.stats.domElement.style.position = "fixed";
        this.stats.domElement.style.top = "50%";
        document.body.appendChild(this.stats.domElement);

        canvas.oncontextmenu = ()=>{return false};

        window.addEventListener('resize',(event)=>{
            let parent = canvas.parentElement as HTMLElement;
            let pheight = parent.clientHeight;
            let pwidth = parent.clientWidth;
            this.resize(pheight,pwidth);
        },false);

        canvas.addEventListener('click',(event)=>{
            const element = event.currentTarget as HTMLElement;
    
            const x = event.clientX - element.offsetLeft;
            const y = event.clientY - element.offsetTop;
    
            const w = element.offsetWidth;
            const h = element.offsetHeight;
    
            let mouse_x = ( x / w ) * 2 - 1;
            let mouse_y = -( y / h ) * 2 + 1;
            this.click(mouse_x,mouse_y);
        });

        canvas.addEventListener('mousemove',(e)=>{
            this.mouseMove({clientX:e.clientX,clientY:e.clientY,button:e.button});
        });

        canvas.addEventListener('mouseup',(e)=>{
            this.mouseUp({clientX:e.clientX,clientY:e.clientY,button:e.button});
        });

        canvas.addEventListener('mousedown',(e)=>{
            this.mouseDown({clientX:e.clientX,clientY:e.clientY,button:e.button});
        });

        canvas.addEventListener('wheel',(e)=>{
            this.wheel({deltaY:e.deltaY});
        });
    }

    protected f_resize(canvas: HTMLCanvasElement){
        let parent = canvas.parentElement as HTMLElement;
        let pheight = parent.clientHeight;
        let pwidth = parent.clientWidth;
        this.resize(pheight,pwidth);
    }

    abstract resize(height: number,width: number):void;
    abstract click(mouse_x:number,mouse_y:number):void;
    abstract mouseMove(event: DMouseEvent):void;
    abstract mouseUp(event: DMouseEvent):void;
    abstract mouseDown(event: DMouseEvent):void;
    abstract wheel(e:DWheelEvent):void;

    /**
     * 
     * この抽象クラスでは使用しませんが、Three.jsのアニメーション処理
     * のコールバック処理として使われることを想定しています。
     * 実際にそこまで呼び出される仕組みはそれそれの実装に任されます。
     */
    abstract tick(sec:TickCallBack):void;

    stats_update(){
        this.stats.update();
    }

}

export class WorkerAtomicRender extends CanvasEventHandler implements IAtomicRender{

    private system: System | null = null;
    private canvas: HTMLCanvasElement;

    private selectObserver: Observable<SelectedEvent> | undefined;
    private cbSelected: Array<(event:SelectedEvent)=>void> = [];
    private worker: ModuleThread<RenderWorker>|null = null;

    constructor(_canvas:AnyCanvas){
        super(_canvas as HTMLCanvasElement);
        this.canvas = _canvas as HTMLCanvasElement;
    }

    async init(){
        console.log("init")
        this.worker = await spawn<RenderWorker>(new Worker("./worker/render_worker.ts"));

        if(this.canvas.transferControlToOffscreen === undefined)throw new NotSupportOffscreenCanvas(`${this.canvas.id}はoffscreencanvasに対応していません。`)
        let canvas = this.canvas.transferControlToOffscreen() as _OffscreenCanvas;
        
        canvas.style = {height:this.canvas.height,width:this.canvas.width}
        await this.worker.init(Transfer(canvas),this.canvas.height,this.canvas.width).finally();
        this.f_resize(this.canvas);
        await this.__setSelectEventObserber()
        await this.__setTickCallBack();
    }

    get isRun(){
        if(this.worker === null)throw new Error("Not initialize of render")
        return this.worker.isRun();
    }

    start(){
        if(this.worker === null)throw new Error("Not initialize of render")
        return this.worker.start();
    }
    
    stop(){
        if(this.worker === null)throw new Error("Not initialize of render")
        return this.worker.stop();
    }

    async setSystem(system: System){
        console.log("setSystem",system)
        return this.worker?.setSystem(system).finally();
    }

    async clearScene(){
        await this.worker?.clearScene();
    }

    async resize(height: number,width: number){
        await this.worker?.resize(height,width);
    }

    async click(mouse_x:number,mouse_y:number){
        await this.worker?.click(mouse_x,mouse_y);
    }

    async mouseUp(event: DMouseEvent){

        await this.worker?.mouseUp(event);
    }

    async mouseMove(event: DMouseEvent){
        await this.worker?.mouseMove(event);
    }

    async mouseDown(event: DMouseEvent){
        await this.worker?.mouseDown(event);
    }

    async wheel(e: DWheelEvent){
        await this.worker?.wheel(e);
    }

    addSelectedEvent(callback: (event:SelectedEvent)=>void){
        this.cbSelected.push(callback);
    }

    async __setSelectEventObserber(){
        this.selectObserver = this.worker?.__setSelectEventObserber()
        this.selectObserver?.subscribe((value)=>{
            this.cbSelected.forEach((cb)=>{
                cb({select:value.select})
            })
        })
    }

    async __setTickCallBack(){
        this.worker?.__setTickCallBack().subscribe((sec)=>{
            this.tick(sec);
        })
    }

    async addAtom(position:Position,element:ElemType,name:string){
        
    }

    async tick(sec:TickCallBack){
        this.stats_update();
    }

}


/**
 * 継承関係じゃなくてもいい気はする。
 */
/*
export class OnAtomicRender extends CanvasEventHandler implements IAtomicRender{
    private render: AtomicRender|undefined;
    private system: System | null;
    private canvas: HTMLCanvasElement;

    constructor(_canvas:AnyCanvas){
        super(_canvas as HTMLCanvasElement);
        this.canvas = _canvas as HTMLCanvasElement;
        this.system = null;

        //this.resize();
    }
    
    async init(){
        this.render = new AtomicRender(this.canvas);
        this.f_resize(this.canvas);
        this.render.setTickCallBack((sec)=>this.tick(sec));
    }

    get isRun(){
        return new Promise<boolean>((resolve)=>{
            if(this.render === undefined)throw new Error("Not initialize of render")
            resolve(this.render.isRun);
        })
    }

    async start(){
        if(this.render === undefined)throw new Error("Not initialize of render")
        this.render.start();
    }
    
    async stop(){
        if(this.render === undefined)throw new Error("Not initialize of render")
        this.render.stop();
    }

    async setSystem(system:System){
        await this.render?.setSystem(system);
    }

    async clearScene(){
        this.render?.clearScene();
    }

    addSelectedEvent(callback: (event:SelectedEvent)=>void){
        this.render?.addSelectedEvent(callback);
    }

    resize(height:number,width:number){
        this.render?.resize(height,width)
    }

    click(mouse_x:number,mouse_y:number){
        this.render?.click(mouse_x,mouse_y);
    }

    mouseUp(event:DMouseEvent){
        this.render?.control.mouseUp(event);
    }

    mouseMove(event: DMouseEvent){
        this.render?.control.mousemove(event);
    }

    mouseDown(event:DMouseEvent){
        this.render?.control.mouseDown(event);
    };
    
    wheel(event: WheelEvent){
        this.render?.control.wheel(event);
    }

    tick(sec:TickCallBack){
        this.stats_update();

    }
}
*/