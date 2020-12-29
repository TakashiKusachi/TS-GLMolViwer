<template>
    <div class="header_user_menu right_side">
        User: {{this.user.name}}
        <ul class="right_side">
            <header-sub-menu v-for="submenu in nodes" :key="submenu.text" 
                :type="submenu.type"
                :position="submenu.position"
                :disable="submenu.disable"
                :text="submenu.text"
                :childs="submenu.childs"
                :cb_click="submenu.cb_click"
                :cb_change="submenu.cb_change"
                :multiple="submenu.multiple"
            ></header-sub-menu>
        </ul>
        <user-form :enable="form_enable" @cancel="form_cancel" @change_user_state="login"></user-form>
    </div>
</template>

<style scoped>

.right_side{
    float:right;
}

.header_user_menu{
    display: inline-block;
    height: 1.5em;
    padding-right: 0.5em;
    padding-left: 0.5em;
    background-color: dimgray;
    border-width: 1px;
    border-style: none solid none none;
    border-color: black;
    color: white;
    position: relative;
}

.header_user_menu:hover{
    background-color: gray;
}

.header_user_menu > ul{
    position: absolute;
    top: 100%;
    margin: 0px;

    display: none;

    list-style: none;
}

.header_user_menu > ul.left_side{
    left: 0px;
}

.header_user_menu > ul.right_side{
    right: 0px;
}

.header_user_menu:hover > ul{
    display: block;
}
</style>

<script lang="ts">
import axios from "axios"
import Component from "vue-class-component";
import {Vue,Prop,Emit} from "vue-property-decorator";
import {node, parent_position,submenu_type} from "./header_util"
import HeaderSubMenu from "./header_submenu.vue"
import UserForm,{userState} from "./header_user_form.vue"

export type user_model ={
    name: string,
    id: string,
}

@Component({
    name: "HeaderUserMenu",
    components: {
        HeaderSubMenu,
        UserForm,
    }
})
export default class HeaderUserMenu extends Vue{
    @Prop()
    private user!: user_model;
    
    private form_enable: boolean = false;

    private login_node:node ={
        type: submenu_type.BUTTON,
        text: "Login",
        disable: true,
        cb_click: this.from_enable,
    }
    private logout_node:node ={
        type: submenu_type.BUTTON,
        text: "Logout",
        disable: false,
        cb_click: ()=>{
                axios.post('/apis/user/logout',
                ).then((response)=>{
                    this.login({
                        name:"",id:"",enable:false
                    })
                }).catch((error)=>{
                    alert("正常にログアウトできませんでした。強制ログアウトを行いました。")
                    this.login({
                        name:"",id:"",enable:false
                    })
            })
        },
    }

    private nodes:node[] = [
        this.login_node,
        this.logout_node,
    ]

    constructor(){
        super();
    }

    from_enable(){
        this.form_enable = true;
    }

    form_cancel(){
        this.form_enable = false;
    }

    login(_user:userState){
        if (_user.enable == true){
            this.user.name = _user.name
            this.user.id = _user.id
            this.login_node.disable = false
            this.logout_node.disable = true
        }
        else{
            this.user.name = ""
            this.user.id = ""
            this.login_node.disable = true
            this.logout_node.disable = false
        }
        this.form_cancel()
    }
}

</script>