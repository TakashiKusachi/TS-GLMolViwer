import { expose } from "threads/worker"
import * as THREE from 'three'
import { registerSerializer, DefaultSerializer } from "threads"

import {System} from "../system"
import {cube_,bond_radius,default_colors} from "../parameters"

import {GroupSerializer,GroupSerializerImplementation} from "./serializer"

registerSerializer(GroupSerializerImplementation)

function drowAtoms(_system: System,accPos: THREE.Vector3):THREE.Group{
    let system = new System(_system,false)
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

function drowBonds(_system:System,accPos: THREE.Vector3){
    let system = new System(_system,false);
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

expose (
    (system)=>{
        let total = new THREE.Group();
        let accPos = new THREE.Vector3(0, 0, 0);
        total.add(drowAtoms(system,accPos));
        total.add(drowBonds(system,accPos));
        return GroupSerializer.serialize(total);
    }
)