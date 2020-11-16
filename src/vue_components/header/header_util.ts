import { callbackify } from "util";


export enum submenu_type{
    PARENT,
    BUTTON,
    FILE,
}

type base_node ={
    type: submenu_type;
}

type node_parent = base_node &{
    type:submenu_type.PARENT;
    text:string;
    childs: node[];
}

type node_button_type = base_node & {
    type: submenu_type.BUTTON;
    text: string;
    cb_click: (e:Event)=>any;
}

type note_file_input_type = base_node &{
    type: submenu_type.FILE;
    text:string;
    cb_change: (e:Event)=>any;
    multiple: boolean;
}

type node = node_parent | node_button_type | note_file_input_type;

/*
type node={
    /**label text /
    text:string;
    /**button ID /
    id:string;

    /**button type /
    type?:string;
    multiple?:boolean;

    childs: node[];
    cb_click?: (e:Event)=>any;
    cb_change?: (e:Event)=>any;
}
*/

export {node};