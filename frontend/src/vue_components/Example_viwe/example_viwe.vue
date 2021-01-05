<template>
    <div id="view" v-bind:class="{hidden:is_hidden}">
        <div id="grid"></div>
        <p>{{textarea}}</p>
        <input type="button" value="OK" @click="selectId"><input type="button" value="Cancel" @click="click_cancel"/>
    </div>
</template>

<style lang="scss" scope>
div#view {
    float: left;
    position: absolute;
    top: 100vh / 2 - 40vh;
    height: 80vh;
    left: 100vw / 2 - 30vw;
    width: 60vw;
    background-color: white;
    border: 3px outset gray;
    overflow-y: scroll;
    div{
        float:none;
        position:relative;

        &#view-main {
            height : 50%;
            table{
                tr.checked{
                    background-color: yellowgreen;
                }
                tr:hover{
                    background-color: silver;
                }
                tr.checked:hover{
                    background-color: gray;
                }

            }
        }
    }
    p{
        display: block;
        width: 98%;
        height: 20%;
        margin: 1em auto 0px;
        border: 1px solid gray;
        overflow-y: scroll;
    }
}

.hidden{
    display: none;
}

</style>

<script lang="ts">

import Component from "vue-class-component";
import {Vue,Prop,Emit, Watch} from "vue-property-decorator";
import {Grid as jGrid} from "gridjs"
import "gridjs/dist/theme/mermaid.css"
import {RowSelection} from "gridjs-selection"

type datalist={
    id:number,
    name:string,
    unique_id:string,
    description:string,
    owner_name:string,
    group_name:string,
}

@Component({
    name: "example_viwe",
    components:{
    }
})
export default class example_viwe extends Vue{
    @Prop()
    private dataset:datalist[] | null = null;

    private is_hidden:boolean = true
    private selected:number | null = null;
    private textarea:string= "";

    constructor(){
        super();
    }

    @Watch("dataset")
    chande_dataset(newData:datalist[], oldData:datalist[]){
        this.is_hidden = false;
        this.make_grid(newData)
    }

    click_cancel(){
        this.is_hidden = true;
    }

    is_selected(id:number){
        return this.selected === id;
    }

    select_click(id:number,description:string=""){
        this.selected = id;
        if (this.dataset === null || this.dataset.length == 0){
            console.log("dataset is empty")
            return "";
        }
        let query = this.dataset.find((item:datalist) => {return item.id==this.selected});
        if (query === undefined){
            console.log("not query")
            return "";
        }
        this.textarea = query.description
    }

    @Emit('select_id')
    selectId(){
        if (this.dataset === null || this.dataset.length == 0){
            console.log("dataset is empty")
            return "";
        }
        let query = this.dataset.find((item:datalist) => {return item.id==this.selected});
        if (query === undefined){
            console.log("not query")
            return "";
        }
        this.is_hidden = true;
        return query.unique_id;
    }

    make_grid(data:datalist[]){
        let grid = new jGrid({
            columns:[
                {id:"id",           name:"index",       hidden:true},
                {id:"unique_id",    name:"unique_id",   hidden:true},
                {id:"name",         name:"name",        hidden:false},
                {id:"description",  name:"description", hidden:true},
                {id:"owner_name",   name:"owner name",  hidden:false},
                {id:"group_name",    name:"group name",  hidden:false}
            ],
            data: data,
            pagination: {
                limit: 10,
                enabled: true,
            },
            style:{
                table:{
                    'overflow':"scroll",
                    'height':"40%",
                    'width':"80%"
                },
                th:{
                    'padding':"0px",
                    'size':"10px"
                },
                td:{
                    'padding':"0px",
                    'size':"10px"
                }
            }
        })

        grid.on("rowClick",(e,row)=>{
            let cells = row.cells
            console.log(row)
            console.log(cells)

        })

        grid.render(document.getElementById("grid") as Element)

        return grid
    }
}
</script>
