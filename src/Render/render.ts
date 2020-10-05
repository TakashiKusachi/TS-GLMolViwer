
import * as THREE from 'three';
import { Object3D, Vector3, Raycaster, Vector2, GridHelper, Group } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import {Worker,spawn,Thread,ModuleThread,Transfer} from 'threads'
import { registerSerializer } from "threads"

import {System} from "../systems"
import {cube_,bond_radius,default_colors} from "./parameters"
import {MatStdControl} from "../control/MatStdControl"


import {AnyCanvas,SelectedEvent,IAtomicRender} from "."
import {Worker as AtomWorker} from "./worker/atomdrower"
import {GroupSerializerImplementation} from "./worker/serializer"
import { resolve } from 'path';

registerSerializer(GroupSerializerImplementation);

export type DMouseEvent = {
    clientX:number,clientY:number,button:number,
} | MouseEvent

export type TickCallBack={
    sec:number,
    isRun:boolean,
}

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

    constructor(canvas:AnyCanvas){

        //this.stats = Stats();
        //this.stats.showPanel(0);
        console.log(canvas)
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
        });
        
        //this.stats.domElement.style.position = "fixed";
        //this.stats.domElement.style.top = "50%";
        //document.body.appendChild(this.stats.domElement);

        this.camera = new THREE.PerspectiveCamera(45);
        this.camera.position.set(0, 0, +30);
        this.control = new MatStdControl(this.camera,canvas);

        this.scene = new THREE.Scene();
        this.light = new THREE.PointLight(0xffffff , 1.0);
        //this.clearScene();

        this.mouse = new Vector2(0,0);
        this.raycaster = new Raycaster();

        //this.resize();
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

    async stop(){
        this._isRun = false;
    }

    async start(){
        this._isRun = true;
    }

    get isRun(){
        return new Promise<boolean>((resolve)=>{
            resolve(this._isRun)
        })
    }

    get isTick(){
        return this._isTick;
    }

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

    click(mouse_x: number,mouse_y:number){
       this.mouse.x = mouse_x;
       this.mouse.y = mouse_y;
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
            cb({select:name})
        })
    }

    resize(height: number,width:number){
        this.renderer.setSize(width,height);
        this.camera.aspect = width/height;
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
        //this.renderer.dispose();

        var axes = new THREE.AxesHelper();
        this.scene.add(axes);
        this.scene.add(this.light);
    }
}

export class AtomicRender extends Render implements IAtomicRender{
    private system : System|null;
    
    private gatomics: THREE.Group | null;
    private gbond: THREE.Group | null;

    private tickCallers: Array<(sec:TickCallBack)=>void> = [];

    constructor(_canvas:AnyCanvas){
        super(_canvas);
        this.system = null;
        this.gatomics = null;
        this.gbond = null;

        this.clearScene();

    }

    async init(){

    }

    async setSystem(system: System){
        console.log("WorkerSet",system);
        this.stop();
        this.clearScene();
        this.system = system;
        let ret = new Promise<void>(async (resolve,reject)=>{
            await this.drowSystem2Scene();
            this.start();
            let selected_atom = this.gatomics?.children[-1];
            if (selected_atom !== undefined){
                this.selected(selected_atom,selected_atom.name)
            }
            resolve();
        });
        return ret;
    }

    async drowSystem2Scene(){
        let system = this.system as System;
        let accPos = new THREE.Vector3(0,0,0);

        
        let objLoader = new THREE.ObjectLoader()

        let atomdrower = await spawn<AtomWorker>(new Worker("./worker/atomdrower.ts"))
        //let bonddrower = await spawn(new Worker("./worker/bonddrower.ts"))
        //await atomdrower.eventObserver();
        let groups= await atomdrower.workerThread(system) as THREE.Group;
        //let gbonds = await bonddrower(system) as THREE.Group;
        console.log("Drow",groups);
        this.gatomics = groups.children.find((value)=>{return value.name === "AtomicsGroup"}) as Group;
        this.gbond = groups.children.find((value)=>{return value.name === "BondsGroup"}) as Group;

        this.addObject(this.gatomics);
        this.addObject(this.gbond);

        Thread.terminate(atomdrower);

    }
    /**
     * この関数は、worker(./worker/atomdrower.ts)でも作成されていますが、
     * これは変更予定のために残してあります。
     * 具体的には、このAtomicRenderクラスはworkerスレッドから呼ばれることも
     * 想定すると、AtomのObjectを別スレッドで生成するメリットがないため、
     * 同一スレッド下で生成を行う変更のために残してあります。
     * @param _system 
     * @param accPos 
     */
    drowAtoms(_system: System,accPos: THREE.Vector3):THREE.Group{
        let system = _system
        let center = accPos;
    
        let gatomics = new THREE.Group();
        let iter_atom = system.getAtoms();
    
        for(let node = iter_atom.next();node.done == false;node=iter_atom.next()){
    
            let atom = node.value;
    
            let pos = atom.position;
            let elem = atom.element;
            let name = atom.name;
            
            const cube = new THREE.SphereGeometry(0.5,cube_,cube_);
    
            var meshopt = {}
            meshopt = {color:default_colors[elem]}
            const material = new THREE.MeshStandardMaterial(meshopt);
            
            const box = new THREE.Mesh(cube, material);
    
            box.name = name;
            box.position.set(pos[0],pos[1],pos[2]);
            center = center.add(box.position);
            gatomics.add(box);
        }
        center  = center.divideScalar(gatomics.children.length);
        gatomics.translateX(-center.x);
        gatomics.translateY(-center.y);
        gatomics.translateZ(-center.z);
        gatomics.name = "AtomicsGroup";
        return gatomics;
    }
    
    drowBonds(_system:System,accPos: THREE.Vector3){
        let system = _system;
        let gbond = new THREE.Group();
        let center = accPos;
        let iter_bond = system.getBond();
        for(let node = iter_bond.next();node.done == false;node=iter_bond.next()){
            let bond = node.value;
            if(bond.atoma.index > bond.atomb.index){continue;}
    
            let bond_vec = new THREE.Vector3(bond.vector[0],bond.vector[1],bond.vector[2]);
            let bond_centor = new THREE.Vector3(bond.position[0],bond.position[1],bond.position[2])
            const cube = new THREE.CylinderGeometry(bond_radius,bond_radius,bond_vec.length(),10,1,true);
            const material = new THREE.MeshStandardMaterial({color:0xf0f0f0});
    
            const box = new THREE.Mesh(cube,material);
            box.position.set(bond_centor.x,bond_centor.y,bond_centor.z);
    
            let angle = bond_vec.angleTo(new THREE.Vector3(0,1,0));
            let nm_bond_vec = bond_vec.cross(new THREE.Vector3(0,1,0)).normalize();
            let quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(nm_bond_vec,-angle);
            box.rotation.setFromQuaternion(quaternion)
            gbond.add(box);
    
        }
        gbond.translateX(-center.x);
        gbond.translateY(-center.y);
        gbond.translateZ(-center.z);
        gbond.name = "BondsGroup";
        return gbond;
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
    
    async clearScene(){
        super.clearScene();
        this.gatomics = null;
        this.gbond = null;
        this.system = null;
    }

    setTickCallBack(cb: (sec:TickCallBack)=>void){
        this.tickCallers.push(cb);
    }

    tickCallBack(sec:TickCallBack){
        if(this.tickCallers === undefined)return;
        this.tickCallers.forEach(cb=>cb(sec));
    }
}
