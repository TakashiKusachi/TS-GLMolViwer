
import { System } from '../systems';
import {WorkerAtomicRender,OnAtomicRender} from "./renderInter"
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
}

export interface IAtomicRender{
    init: ()=>Promise<void>;
    isRun: Promise<boolean>;
    start: ()=>Promise<void>;
    stop: ()=>Promise<void>;
    setSystem: (system:System)=>Promise<void>;
    //addAtom: (position:,element:,name:)=>Promise<void>;
    clearScene: ()=>Promise<void>;
    addSelectedEvent: (callbacl: (event:SelectedEvent)=>void)=>void;
}

export {WorkerAtomicRender,OnAtomicRender}