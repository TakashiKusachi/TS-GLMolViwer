
import * as THREE from 'three';
import { Object3D, Vector3, Raycaster, Vector2, GridHelper, Group } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import {Worker,spawn,Thread} from 'threads'
import { registerSerializer } from "threads"

import { System,Position,ElemType,Atom } from './system';
import {cube_,bond_radius,default_colors} from "./parameters"
import {MatStdControl} from "./control/MatStdControl"

import {GroupSerializerImplementation} from "./worker/serializer"

registerSerializer(GroupSerializerImplementation);

export interface SelectedEvent{
    obj: Object3D;
    select: string;
}

abstract class Render{
    
    private canvas_id: string;

    private renderer: THREE.WebGLRenderer;
    private scene : THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private control: MatStdControl;
    private light: THREE.Light;
    private raycaster: THREE.Raycaster;

    private _isTick: boolean = true;
    private _isRun: boolean = false;

    private stats: Stats;

    private mouse: Vector2;

    private cbSelected: Array<(event:SelectedEvent)=>void> = [];

    constructor(canvas_id:string){

        this.stats = Stats();
        this.stats.showPanel(0);

        this.canvas_id = canvas_id;
        let canvas = <HTMLCanvasElement>document.querySelector(canvas_id);
        canvas.oncontextmenu = ()=>{return false};
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
        });
        
        this.stats.domElement.style.position = "fixed";
        this.stats.domElement.style.top = "50%";
        document.body.appendChild(this.stats.domElement);

        this.camera = new THREE.PerspectiveCamera(45);
        this.camera.position.set(0, 0, +30);
        this.control = new MatStdControl(this.camera,canvas);

        this.scene = new THREE.Scene();
        this.light = new THREE.PointLight(0xffffff , 1.0);
        this.clearScene();

        this.mouse = new Vector2(0,0);
        this.raycaster = new Raycaster();

        window.addEventListener('resize',()=>{this.resize()},false);
        canvas.addEventListener('click',(event)=>{
            this.click(event);
        })

        this.resize();
        this.tick();
    }

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

    stop(){
        this._isRun = false;
    }

    start(){
        this._isRun = true;
    }

    get isRun(){
        return this._isRun;
    }

    get isTick(){
        return this._isTick;
    }

    tick(){
        const sec = performance.now() / 1000;
        if(!this.isTick)return;
        this.tickEffect();
        requestAnimationFrame(()=>{this.tick();});
        this.stats.update();

        if(!this.isRun)return;
        this.control.update();
        this.lightSync();
        this.renderer.render(this.scene,this.camera);
    }

    abstract tickEffect():void;

    click(event :MouseEvent){
        const element = event.currentTarget as HTMLElement;

        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;

        const w = element.offsetWidth;
        const h = element.offsetHeight;

        this.mouse.x = ( x / w ) * 2 - 1;
        this.mouse.y = -( y / h ) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children,true);
        if (intersects.length > 0){
            let obj = intersects[0].object;
            this.selected(obj,obj.name);
        }
    }

    addSelectedEvent(callback: (event:SelectedEvent)=>void){
        this.cbSelected.push(callback);
    }

    selected(obj:Object3D,name: string){
        this.cbSelected.forEach((cb)=>{
            cb({select:name,obj:obj})
        })
    }

    resize(){
        let canvas = <HTMLCanvasElement>document.querySelector(this.canvas_id);
        let parent = canvas.parentElement as HTMLElement;
        let pheight = parent.clientHeight;
        let pwidth = parent.clientWidth;
        this.renderer.setSize(pwidth,pheight);
        this.camera.aspect = pwidth/pheight;
        this.camera.updateProjectionMatrix();
    }

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
        this.renderer.dispose();

        var axes = new THREE.AxesHelper();
        this.scene.add(axes);
        this.scene.add(this.light);
    }
}

/**
 * 継承関係じゃなくてもいい気はする。
 */
class AtomicRender extends Render{
    private system: System | null;

    private gatomics: THREE.Group | null;
    private gbond: THREE.Group | null;

    constructor(canvas_id:string){
        super(canvas_id);
        this.system = null;
        this.gatomics = null;
        this.gbond = null;
    }

    home(){

    }

    async setSystem(system: System){
        this.stop();
        this.clearScene();
        this.system = system;
        let ret = new Promise<void>(async (resolve,reject)=>{
            await this.drowSystem2Scene();
            this.start();
            resolve();
        });
        return ret;
    }

    async drowSystem2Scene(){
        let system = this.system as System;
        let accPos = new THREE.Vector3(0,0,0);

        let objLoader = new THREE.ObjectLoader()

        let atomdrower = await spawn(new Worker("./worker/atomdrower.ts"))
        //let bonddrower = await spawn(new Worker("./worker/bonddrower.ts"))
        
        let groups= await atomdrower(system) as THREE.Group;
        //let gbonds = await bonddrower(system) as THREE.Group;
        console.log("Drow",groups);
        this.gatomics = groups.children.find((value)=>{return value.name === "AtomicsGroup"}) as Group;
        this.gbond = groups.children.find((value)=>{return value.name === "BondsGroup"}) as Group;

        this.addObject(this.gatomics);
        this.addObject(this.gbond);

        Thread.terminate(atomdrower);

    }

    calcCenter():THREE.Vector3{
        if (this.gatomics == null){
            return new THREE.Vector3(0,0,0);
        }
        let atomics = this.gatomics.children as Object3D[];
        var cen = atomics.map((value)=>{return value.position}).reduce((acc,value)=>{return acc.add(value)},new THREE.Vector3(0,0,0));
        cen = cen.divideScalar(atomics.length);
        return cen;
    }

    tickEffect(){
    }

    clearScene(){
        super.clearScene();
        this.gatomics = null;
        this.gbond = null;
        this.system = null;
    }
}

export {AtomicRender}