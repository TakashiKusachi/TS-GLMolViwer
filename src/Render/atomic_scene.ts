
import * as THREE from 'three'
import {Scene,Vector3, Object3D} from 'three'

import {cube_segments,bond_radius,bond_segments,default_colors} from "./parameters"
import {System,IAtom} from "../systems"

type atom_bond = {
    atoma: Object3D;
    atomb: Object3D;
    bond: Object3D;
}

class TableAtomBond{
    private bond_list: atom_bond[];

    constructor(){
        this.bond_list = [];
    }
}

class AtomicScene{
    private system?: System;

    /** 重心 */
    private weightCenter: Vector3;

    constructor(){
        this.weightCenter = new Vector3(0,0,0);
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
    }

    /**
     * get 重心
     * 
     * @return 重心
     */
    getWeightCenter():Vector3{
        return this.weightCenter;
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
        let center = new Vector3(0,0,0);
    
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
            center = center.add(box.position);
            gatomics.add(box);
        }
        center  = center.divideScalar(gatomics.children.length);
        this.weightCenter = center;
        gatomics.translateX(-center.x);
        gatomics.translateY(-center.y);
        gatomics.translateZ(-center.z);
        gatomics.name = "AtomicsGroup";
        return gatomics;
    }

    drowBonds(_system:System){
        let system = _system;
        let gbond = new THREE.Group();
        let center = this.weightCenter;
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
            gbond.add(box);
    
        }
        gbond.translateX(-center.x);
        gbond.translateY(-center.y);
        gbond.translateZ(-center.z);
        gbond.name = "BondsGroup";
        return gbond;
    }

    clearScene(){
        this.system = undefined;
        this.weightCenter = new Vector3(0,0,0);
    }
}