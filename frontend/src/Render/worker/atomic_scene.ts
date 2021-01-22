
import * as THREE from 'three'
import {Scene,Vector3, Object3D} from 'three'

import {cube_segments,bond_radius,bond_segments,default_colors,atoms_layer,bonds_layer} from "../parameters"
import {System,IAtom} from "../../systems"
import { positionChange } from './dao';

export class AtomicScene{
    private system?: System;
    private gatomics?: THREE.Group;
    private gbonds?: THREE.Group;
    private obj3d_selected_atom: Object3D;

    /** 重心 */
    private accumPos: Vector3;

    constructor(){
        this.accumPos = new Vector3(0,0,0);

        const cube = new THREE.SphereGeometry(0.7,cube_segments,cube_segments);
            
        var meshopt = {}
        meshopt = {color:0xffffff,wireframe:true}
        const material = new THREE.MeshBasicMaterial(meshopt);
        
        this.obj3d_selected_atom = new THREE.Mesh(cube, material);
    }

    /**
     * 
     * 
     * 現在登録されているsceneを廃棄して新たにsceneを構築します。
     * 
     * @param system sceneに登録するシステム
     */
    async setSystem(system: System){
        this.clearScene();
        this.system = system;
        let gatomics = this.drowAtoms(system);
        let gbonds = this.drowBonds(system);

        this.gatomics = gatomics;
        this.gbonds = gbonds;
    }

    /**
     * get 重心
     * 
     * @return 重心
     */
    getWeightCenter():Vector3{
        let center = this.accumPos.divideScalar(this.getNumAtoms());
        return center;
    }

    getNumAtoms():number{
        if (this.gatomics == undefined){
            return 0;
        }
        else{
            return this.gatomics.children.length;
        }
    }

    getObjects():THREE.Object3D{
        let objects = new THREE.Group();
        if ( this.gatomics != undefined) objects.add(this.gatomics);
        if ( this.gbonds != undefined) objects.add(this.gbonds);
        objects.name = "ATOMIC_SCENE_ALL_OBJECTS";
        let center = this.getWeightCenter();
        objects.translateX(-center.x);
        objects.translateY(-center.y);
        objects.translateZ(-center.z);

        return objects;
    }

    deleteAtom(name:string){
        if (this.gatomics == undefined)return;

        let hitobject = this.gatomics.children.find((value)=>{
            return value.name == name;
        })

        if(hitobject == undefined)return;
        this.gatomics.remove(hitobject);
    }

    /**
     * 原子Groupの作成
     * 
     * systemから原子のMeshのGroupを作成する。
     * 
     * @param _system 
     */
    drowAtoms(_system: System):THREE.Group{
        let system = _system
        let accum = new Vector3(0,0,0);
    
        let gatomics = new THREE.Group();
        let iter_atom = system.getAtoms();
    
        for(let node = iter_atom.next();node.done == false;node=iter_atom.next()){
    
            let atom = node.value;
    
            let pos = atom.position;
            let elem = atom.element;
            let name = atom.name;
            
            const cube = new THREE.SphereGeometry(0.5,cube_segments,cube_segments);
    
            var meshopt = {}
            meshopt = {color:default_colors[elem]}
            const material = new THREE.MeshStandardMaterial(meshopt);
            
            const box = new THREE.Mesh(cube, material);
    
            box.name = name;
            box.position.set(pos[0],pos[1],pos[2]);
            box.layers.enable(atoms_layer)
            accum = accum.add(box.position);
            gatomics.add(box);
        }
        this.accumPos = accum;
        gatomics.name = "AtomicsGroup";
        return gatomics;
    }

    drowBonds(_system:System){
        let system = _system;
        let gbond = new THREE.Group();
        let iter_bond = system.getBond();
        for(let node = iter_bond.next();node.done == false;node=iter_bond.next()){
            let bond = node.value;
            if(bond.atoma.index > bond.atomb.index){continue;}
    
            let bond_vec = new THREE.Vector3(bond.vector[0],bond.vector[1],bond.vector[2]);
            let bond_centor = new THREE.Vector3(bond.position[0],bond.position[1],bond.position[2])
            const cube = new THREE.CylinderGeometry(bond_radius,bond_radius,bond_vec.length(),bond_segments,1,true);
            const material = new THREE.MeshStandardMaterial({color:0xf0f0f0});
    
            const box = new THREE.Mesh(cube,material);
            box.position.set(bond_centor.x,bond_centor.y,bond_centor.z);
    
            let angle = bond_vec.angleTo(new THREE.Vector3(0,1,0));
            let nm_bond_vec = bond_vec.cross(new THREE.Vector3(0,1,0)).normalize();
            let quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(nm_bond_vec,-angle);
            box.rotation.setFromQuaternion(quaternion)
            box.layers.enable(bonds_layer)
            gbond.add(box);
    
        }
        gbond.name = "BondsGroup";
        return gbond;
    }

    clearScene(){
        this.system = undefined;
        this.accumPos = new Vector3(0,0,0);
        this.gatomics = undefined;
        this.gbonds = undefined;
    }

    /**
     * 
     * @param obj 
     */
    hilight_atom(obj: Object3D|null){
        console.log("hilight_atom:")
        if (obj != null){
            console.log("obj is not null")
            this.obj3d_selected_atom.position.set(obj?.position.x,obj?.position.y,obj?.position.z);

            obj?.parent?.add(this.obj3d_selected_atom)
        }
        else{
            console.log("obj is null")
            this.gatomics?.remove(this.obj3d_selected_atom)
        }
    }
}