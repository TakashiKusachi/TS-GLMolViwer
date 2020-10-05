type node={
    /**label text */
    text:string;
    /**button ID */
    id:string;

    /**button type */
    type?:string;
    multiple?:boolean;

    childs: node[];
    cb_click?: (e:Event)=>any;
    cb_change?: (e:Event)=>any;
}

export {node};