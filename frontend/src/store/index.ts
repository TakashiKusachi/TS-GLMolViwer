import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {createModule,action,mutation, extractVuexModule, createProxy,getter} from "vuex-class-component"


Vue.use(Vuex)

const VuexModule = createModule({
    namespaced: "user",
    strict: false,
    target: "nuxt"
})

export class UserStore extends VuexModule{
    @getter public name = "";
    @getter public id = "";
    @getter public isLogin:boolean = false;

    @mutation setName(name:string){
        this.name = name;
    }
    @mutation setId(id:string){
        this.id = id
    }
    @mutation setIsLogin(state:boolean){
        this.isLogin = state
    }

    @action
    public async login(pyload:{name:string,pwd:string}){
        let name = pyload.name
        let pwd = pyload.pwd
        return await axios.post('/apis/user/login',
            {
                name: name,
                pwd: pwd,
            }
        ).then((response)=>{
            return this.getUser()
        }).catch((error)=>{
            if(error.response){
                let response = error.response
                console.log(response)
                throw response.data.detail
            }
        })
    }

    @action
    public async logout(){
        axios.post('/apis/user/logout',)
        .then((response)=>{
            this.setName("")
            this.setId("")
            this.setIsLogin(false)
        }).catch((error)=>{
            alert("正常にログアウトできませんでした。強制ログアウトを行いました。")
            this.setName("")
            this.setId("")
            this.setIsLogin(false)
        })
    }

    @action
    public async getUser(){
        return axios.get('/apis/user')
        .then((response)=>{
            let data = response.data
            this.setName(data.name)
            this.setId(data.id)
            this.setIsLogin(true)
        }).catch((error)=>{
            this.setName("")
            this.setId("")
            this.setIsLogin(false)
            let response = error.response
            console.log(response)
            throw response.data.detail
        })
    }
}

export const store = new Vuex.Store({
    modules: {
        ...extractVuexModule(UserStore)
    }
})

export const vxm = {
    user: createProxy(store,UserStore),
}