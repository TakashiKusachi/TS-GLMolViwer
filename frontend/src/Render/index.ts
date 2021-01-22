
import { System } from '../systems';
import {WorkerAtomicRender} from "./worker_interface/renderInter"
import { Object3D } from 'three';

type Style={
    width: number,
    height:number,
}

export interface _OffscreenCanvas extends OffscreenCanvas{
    style: Style,
}


export type AnyCanvas = HTMLCanvasElement| _OffscreenCanvas;

export interface SelectedEvent{
    select: string;
    obj: Object3D|null;
}

export interface IAtomicRender{
    init: ()=>Promise<void>;
    isRun: Promise<boolean>;
    start: ()=>Promise<void>;
    stop: ()=>Promise<void>;
    setSystem: (system:System)=>Promise<void>;
    deleteAtom: (name:string)=>Promise<void>;
    //addAtom: (position:,element:,name:)=>Promise<void>;
    clearScene: ()=>Promise<void>;
    addSelectedEvent: (callbacl: (event:SelectedEvent)=>void)=>void;
}

export {WorkerAtomicRender}