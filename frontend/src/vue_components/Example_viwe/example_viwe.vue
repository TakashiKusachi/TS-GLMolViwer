<template>
    <div id="view" v-bind:class="{hidden:is_hidden}">
        <div id="view-main">
            <table>
                <tr>
                    <th>name</th><th>owner name</th><th>group name</th>
                </tr>
                <tr v-for="item in dataset" :key="item.id" @click="select_click(item.id)" v-bind:class="{checked: is_selected(item.id)}">
                    <td>{{item.name}}</td><td>{{item.owner_name}}</td><td>{{item.group_name}}</td>
                </tr>
            </table>
        </div>
        <p>{{textarea}}</p>
        <input type="button" value="OK" @click="selectId"><input type="button" value="Cancel" @click="click_cancel"/>
    </div>
</template>

<style lang="scss" scope>
div#view {
    float: left;
    position: absolute;
    top: 100vh / 2 - 25vh;
    height: 50vh;
    left: 100vw / 2 - 35vw;
    width: 70vw;
    background-color: white;
    border: 3px outset gray;
    div{
        float:none;
        position:relative;

        &#view-main {
            height : 50%;
            overflow-y: scroll;
            table{
                height: 100%;
                display: table;
                border-collapse: collapse;
                tr{
                    display: table-row;
                    background-color: white;
                    width: 100%;
                    th{
                        display: table-cell;
                        padding: 0px 2em;
                        border: 1px solid black;
                        background-color: gray;
                    }
                    td{
                        display: table-cell;
                        width: auto;
                        padding: 0px 2em;
                        border: 1px solid gray;
                    }
                }
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
    }

    click_cancel(){
        this.is_hidden = true;
    }

    is_selected(id:number){
        return this.selected === id;
    }

    select_click(id:number){
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

}
</script>
