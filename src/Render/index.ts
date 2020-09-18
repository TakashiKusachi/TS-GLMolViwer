
import { System } from '../system';
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
    setSystem: (system:System)=>Promise<void>;
    clearScene: ()=>Promise<void>;
    addSelectedEvent: (callbacl: (event:SelectedEvent)=>void)=>void;
}