
import {PerspectiveCamera,OrthographicCamera} from 'three';
import {Vector2,Vector3} from 'three';
import {Quaternion} from 'three'
import {Control} from './control';

type AnyCamera = PerspectiveCamera | OrthographicCamera;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

export type DMouseEvent = {
    clientX:number,clientY:number,button:number,
} | MouseEvent
export type DWheelEvent ={
        deltaY:number
}|WheelEvent;

/**某visualizerの動きを模倣したcameraコントローラ */
class MatStdControl implements Control{
    private canvas: AnyCanvas;
    private camera: AnyCamera;

    private _leftbtn: boolean = false;
    private _centerbtn: boolean = false;
    private _rightbtn: boolean = false;

    private look: Vector3;
    private position: Vector3;

    private mouseposition: Vector2;
    private startCameraPosition: Vector3;
    private startUpVector: Vector3;
    private startUpCrossVector: Vector3;
    private moveScale: number = 10;

    private zoom: number = 0;
    private maxZoom: number;
    private minZoom: number;
    private base: number = Math.E;
    private zoomScale: number = 125 * 2;

    /**
     * @param camera コントロールされるカメラのオブジェクト
     * @param canvas webGLがレンダリングしている<canvas>のエレメント
     */
    constructor(camera: AnyCamera, canvas: AnyCanvas){
        this.canvas = canvas;
        this.camera = camera;

        this.look = new Vector3(0,0,0);
        this.position = new Vector3(0,0,+30);

        this.mouseposition = new Vector2(0,0);
        this.startCameraPosition = new Vector3(0,0,0);
        this.startUpVector = new Vector3(0,0,0);
        this.startUpCrossVector = new Vector3(0,0,0);
        

        this.maxZoom = 40;
        this.minZoom = -40;
        /*
        this.canvas.addEventListener('mousemove',(e)=>{this.mousemove(e);});
        this.canvas.addEventListener('mouseup',(e)=>{this.mouseUp(e);});
        this.canvas.addEventListener('mousedown',(e)=>{this.mouseDown(e);});
        this.canvas.addEventListener('wheel',(e)=>{this.wheel(e);});
        */
    }

    /**
     * mousemoveイベントの処理ハンドラ。
     * @param event mousemoveのイベント
     */
    mousemove(event: DMouseEvent){
        /**
         * 右ボタンドラッグによるオブジェクトの回転操作 
         * 厳密には、カメラがlookAtを中心に回転している。
         * 
         * @notes
         * lookAtが常に原点じゃないとだめ
         */
        if(this._rightbtn){
            let delta = (new Vector2(event.clientX,event.clientY)).sub( this.mouseposition);

            let newPos = this.startCameraPosition.clone();
            let quaternion = new Quaternion();
            let x_quanternion = new Quaternion();
            let y_quanternion = new Quaternion();
            x_quanternion.setFromAxisAngle(this.startUpVector,-delta.x*Math.PI/180);
            y_quanternion.setFromAxisAngle(this.startUpCrossVector,delta.y*Math.PI/180);
            quaternion.multiply(x_quanternion).multiply(y_quanternion);
            newPos.applyQuaternion(quaternion);

            this.moveAt(newPos);

            let newUp = this.startUpVector.clone();
            quaternion.setFromAxisAngle(this.startUpCrossVector,delta.y*Math.PI/180);
            newUp.applyQuaternion(quaternion);
            this.camera.up.set(newUp.x,newUp.y,newUp.z);
            this.camera.lookAt(this.look);

            this.setInfo(event)
        }
        /**
         * 真ん中ボタンドラッグによる視点の平行移動
         * 
         * @Notes
         * 平行移動したとき、objectは原点のままです。このため、上の回転の際にはあくまでobjectを周回するような視点移動になります。
         * （移動したlookAt（!＝原点)を中心に回転するわけではないということ）
         * この利点は、視点がobjectの中に入り込むことがないところです。
         * 直感的には理解しずらいかもしれないが、操作感的にはこれがいいと思います。
         */
        else if(this._centerbtn){
            let delta = (new Vector2(event.clientX,event.clientY)).sub( this.mouseposition).divideScalar(this.moveScale);

            let movey = this.startUpVector.multiplyScalar(delta.y);
            let movex = this.startUpCrossVector.multiplyScalar(delta.x)

            let newpos = this.startCameraPosition.clone().add(movex).add(movey);
            let newlook = this.look.clone().add(movex).add(movey);

            this.moveAt(newpos);
            this.lookAt(newlook);

            this.setInfo(event)

        }
    }

    mouseDown(event: DMouseEvent){
        switch(event.button){
            case 0:
                this._leftbtn = true;break;
            case 1:
                this._centerbtn = true;break;
            case 2:
                this._rightbtn = true;break;
        }
        this.setInfo(event);
    }

    mouseUp(event: DMouseEvent){
        switch(event.button){
            case 0:
                this._leftbtn = false;break;
            case 1:
                this._centerbtn = false;break;
            case 2:
                this._rightbtn = false;break;
        }

    }

    wheel(event: DWheelEvent){
        let delta = event.deltaY / this.zoomScale;
        this.zoom = Math.min(Math.max(this.zoom + delta,this.minZoom),this.maxZoom);

        this.camera.zoom = Math.pow(this.base, this.zoom);
        this.camera.updateProjectionMatrix();
    }

    update(){

    }

    lookAt(valx: number | Vector3,valy?:number, valz?:number){
        if (typeof(valx) == 'number'){
            this.look = new Vector3(valx,valy,valz);
        }
        else{
            this.look = valx;
        }
        this.camera.lookAt(this.look);
    }

    moveAt(valx: number | Vector3, valy?:number, valz?:number){
        if (typeof(valx) == 'number'){
            var x = valx as number;
            var y = valy as number;
            var z = valz as number;
            this.position = new Vector3(x,y,z);
        }
        else{
            this.position = valx;
        }
        this.camera.position.set(this.position.x,this.position.y,this.position.z);
    }

    setInfo(e: DMouseEvent){
        this.mouseposition = new Vector2(e.clientX,e.clientY);
        this.startCameraPosition = this.camera.position.clone();
        this.startUpVector = this.camera.up.clone();
        this.startUpCrossVector = this.startCameraPosition.clone().cross(this.startUpVector).normalize();
    }

    reset(){
        this.zoom = 0;
        this.look.set(0,0,0);
        this.position.set(0,0,+300);
        this.camera.up.set(0,1,0);
    }
}

export {MatStdControl}