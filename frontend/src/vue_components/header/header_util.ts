export enum submenu_type{
    PARENT,
    BUTTON,
    FILE,
}

export enum parent_position{
    LEFT,
    RIGHT,
}

type base_node ={
    type: submenu_type;
    position?: parent_position;
    disable: boolean;
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

export {node};