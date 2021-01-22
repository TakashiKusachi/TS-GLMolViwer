
import * as THREE from 'three';
import { Object3D, Vector3, Raycaster, Vector2, GridHelper, Group } from 'three';

import {System} from "../systems"
import {cube_segments,bond_radius,bond_segments,default_colors, atoms_layer} from "./parameters"
import {MatStdControl} from "../control/MatStdControl"


import {AnyCanvas,SelectedEvent,IAtomicRender} from "."
import {AtomicScene} from "./atomic_scene"
import { positionChange } from './worker/dao';

export type DMouseEvent = {
    clientX:number,clientY:number,button:number,
} | MouseEvent

export type TickCallBack={
    sec:number,
    isRun:boolean,
}

/** 
 * Three.js/WebGLに基づきcanvasを操作するクラス。
 * 
 * 基本的な役割は,sceneやカメラの保持、そのほかユーザ操作のイベントを受け取る。
 * ほとんど、AtomicRender専用なら分ける必要がなくないかと言われたらその通り。
 * 
 */
export abstract class Render{

    private renderer: THREE.WebGLRenderer;
    private scene : THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    public control: MatStdControl; /**pulic なのはどう考えても問題あり */
    private light: THREE.Light;
    private raycaster: THREE.Raycaster;

    private _isTick: boolean = true;
    private _isRun: boolean = false;

    //private stats: Stats;

    private mouse: Vector2;

    private cbSelected: Array<(event:SelectedEvent)=>void> = [];
    private tickHandler: Array<()=>void> = []

    /**
     * コンストラクタ
     * 
     * カメラ、カメラコントロール、シーン、レンダーの初期化を行っています。
     * 
     * @param canvas 描画対象のキャンバス。AnyCanvasとしているが、現使用では、Offscreencanvasのみ
     */
    constructor(canvas:AnyCanvas){

        console.log(canvas)
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
        });
        

        this.camera = new THREE.PerspectiveCamera(45);
        this.camera.position.set(0, 0, +30);
        this.control = new MatStdControl(this.camera,canvas);

        this.scene = new THREE.Scene();
        this.light = new THREE.PointLight(0xffffff , 1.0);

        this.mouse = new Vector2(0,0);
        this.raycaster = new Raycaster();

        this.tick();
    }

    /**
     * カメラを指定した点を見る方向に設定します。
     * 
     * 内部でカメラコントローラにそのまま引き渡します。
     * 
     * @param valx 点のx座標(number)、もしくは座標(Vector3)
     * @param valy 
     * @param valz 
     */
    lookAt(valx: number | Vector3,valy?:number, valz?:number){
        this.control.lookAt(valx,valy,valz);
    }

    moveAt(valx: number | Vector3, valy?:number, valz?:number){
        this.control.moveAt(valx,valy,valz);
        if (typeof(valx) == 'number'){
            var x = valx as number;
            var y = valy as number;
            var z = valz as number;
            this.light.position.set(x,y,z);
        }
        else{
            this.light.position.set(valx.x,valx.y,valx.z);
        }
    }

    lightSync(){
        this.light.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z,
        )
    }

    /**
     * レンダーを停止します。
     */
    async stop(){
        this._isRun = false;
    }

    /**
     * レンダーを再開します。
     */
    async start(){
        this._isRun = true;
    }

    /**
     * 
     * @return 
     */
    get isRun(){
        return new Promise<boolean>((resolve)=>{
            resolve(this._isRun)
        })
    }

    get isTick(){
        return this._isTick;
    }

    /**
     * 
     * @hidden
     */
    tick(){
        const sec = performance.now() / 1000;
        if(!this.isTick)return;
        requestAnimationFrame(()=>{this.tick();});
        //this.stats.update();
        //this.tickCallBack();
        this.tickCallBack({sec:sec,isRun:this._isRun});
        if(!this.isRun)return;
        this.control.update();
        this.lightSync();
        this.renderer.render(this.scene,this.camera);
    }

    abstract tickCallBack(sec:TickCallBack):void;


    /**
     * マウスによるcanvasクリックのcallback関数
     * 
     * Three.Raycasterを使ってオブジェクトとの交点検出を行い、クリックされたオブジェクトを検出する。
     * 
     * @param mouse_x 
     * @param mouse_y 
     */
    click(mouse_x: number,mouse_y:number){
       this.mouse.x = mouse_x;
       this.mouse.y = mouse_y;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.layers.set(atoms_layer)
        const intersects = this.raycaster.intersectObjects(this.scene.children,true);
        if (intersects.length > 0){
            let obj = intersects[0].object;
            this.selected(obj,obj.name);
        }
        else{
            this.selected(null,"");
        }
    }
    
    /**
     * コールバック関数の設定メソッド
     * 
     * @param callback 
     */
    addSelectedEvent(callback: (event:SelectedEvent)=>void){
        this.cbSelected.push(callback);
    }

    /**
     * クリック等によるオブジェクトを選択したときに、選択したイベントをコールバック関数に渡す処理。
     * 
     * @param obj Not Used
     * @param name 
     */
    selected(obj:Object3D|null,name: string){
        this.cbSelected.forEach((cb)=>{
            cb({select:name,obj:obj})
        })
    }

    /**
     * 画面リサイズ処理のcallback関数
     * 
     * @param height 
     * @param width 
     */
    resize(height: number,width:number){
        this.renderer.setSize(width,height);
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * sceneにオブジェクトを追加する関数
     * 
     * @param obj 
     */
    addObject(obj:THREE.Object3D){
        this.scene.add(obj);
    }

    removeObject(obj:THREE.Object3D){
        this.scene.remove(obj);
    }

    clearScene(){
        this.scene.remove.apply(this.scene,this.scene.children);

        this.moveAt(0,0,+100);
        this.lookAt(0,0,0);
        this.control.reset();
        //this.renderer.dispose();

        var axes = new THREE.AxesHelper();
        axes.name = "AxesHelper"
        this.scene.add(axes);
        this.scene.add(this.light);
    }
}

/**
 * 
 */
export class AtomicRender extends Render implements IAtomicRender{

    private atomicScene: AtomicScene;
    private system : System|null;

    private tickCallers: Array<(sec:TickCallBack)=>void> = [];

    constructor(_canvas:AnyCanvas){
        super(_canvas);
        this.system = null;
        this.atomicScene = new AtomicScene();
        this.clearScene();
        this.addSelectedEvent((e)=>{this.__selected(e)})
    }

    async init(){
    }

    async __selected(select: SelectedEvent){
        this.atomicScene.hilight_atom(select.obj)
    }

    async setSystem(system: System){
        console.log("WorkerSet",system);
        this.stop();
        this.clearScene();

        this.system = System.getSystem(system);
        let ret = new Promise<void>(async (resolve,reject)=>{
            this.atomicScene.setSystem(this.system as System);
            this.start();
            //let selected_atom = this.gatomics?.children[-1];
            //if (selected_atom !== undefined){
            //    this.selected(selected_atom,selected_atom.name)
            //}
            this.addObject(this.atomicScene.getObjects());
            //await this.lookHome();
            resolve();
        });
        return ret;
    }
    
    async deleteAtom(name:string){
        this.atomicScene.deleteAtom(name);
    }

    async clearScene(){
        super.clearScene();
        this.atomicScene.clearScene();
        this.system = null;
    }

    setTickCallBack(cb: (sec:TickCallBack)=>void){
        this.tickCallers.push(cb);
    }

    tickCallBack(sec:TickCallBack){
        if(this.tickCallers === undefined)return;
        this.tickCallers.forEach(cb=>cb(sec));
    }

    changePosition(obj: positionChange){
        this.atomicScene.
    }
}
