<template>
    <div id="user_form_bg" :class="form_class">
        <div>
            <form @submit.prevent="submit">
                <label>User Name</label><input class="intext" type="text" name="name" v-model="name" required/><br/>
                <label>Password</label><input class="in_text" type="password" name="pwd" v-model="pwd" required/><br/>
                <p id="information">{{inftext}}</p>
                <button type="submit">login</button>
                <button type="button" @click="sign_up">sign up</button>
                <button type="button" @click="cancel">cancel</button>
            </form>
        </div>
    </div>
</template>

<style scoped lang="scss">
#user_form_bg{
    width:100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;

    background-color: rgba(0,0,0,0.5);

    &.hidden{
        display: none;
    }

    & > div{
        color: black;
        position: absolute;
        margin: auto;
        width: 300px;
        height: 450px;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: whitesmoke;

        form{
            size: 12px;
            label{
                display: inline-block;
                width: 10em;
                text-align: right;
            }
            input.intext{
                text-align: left;
            }
            p#information{
                color: red;
            }
        }
    }
}
</style>

<script lang="ts">

import Component from "vue-class-component";
import {Vue,Prop,Emit,Watch} from "vue-property-decorator";

import axios from "axios"
import {vxm} from "../../store"

@Component({
    name: "UserForm",
})
export default class UserForm extends Vue{
    @Prop()
    private enable?: boolean;
    
    private name:string = "";
    private pwd:string = "";

    private inftext:string = "";

    private get islogin(){return vxm.user.isLogin}

    constructor(){
        super();
    }

    get form_class(){
        return{
            "hidden":!this.enable
        }
    }

    submit(e:Event){
        vxm.user.login({name:this.name,pwd:this.pwd})
        .then(()=>{
            this.login_success()
        })
        .catch((error)=>{
            console.log("in user form ")
            console.log(error)
            this.inftext=error
        })
    }

    sign_up(e:Event){
        axios.post('/apis/user',
                {
                    name: this.name,
                    pwd: this.pwd,
                }
            ).then((response)=>{
            }).catch((error)=>{
                if(error.response){
                    let response = error.response
                    console.log(response)
                    let status = response.status
                    this.inftext = response.data.detail
                }
            })
    }

    @Emit("cancel")
    cancel(e:Event){
        return
    }

    @Emit("login_success")
    login_success(){
        return
    }

    @Watch("enable")
    change_enable(newState:boolean,oldState:boolean){
        if (newState==true && oldState==false){
            this.name=""
            this.pwd=""
            this.inftext=""
        }
    }
}

</script>