// 监听
import Dep, { pushTarget, popTarget } from './dep.js';

import { parsePath } from './common.js'

let uid = 0;

// immediate不接收
// expOrFn先不考虑为fn的情况
export default class Watcher {
    constructor(vm, expOrFn, cb, options){
        this.id = ++uid
        // 指向传入的vue实例化对象
        this.vm = vm;
        // 回调函数
        this.cb = cb;

        if(options){
            // 是否深度监听
            this.deep = !!options.deep
        }else{
            this.deep = false;
        }

        // 返回fn
        this.getter = parsePath(expOrFn)

        // 当前的value值
        this.value = this.get();
    }
    // 获取属性的值
    get(){
        Dep.target = this;
        const value = this.getter(this.vm);
        Dep.target = null;
        return value;
    }
    update(){
        this.run()
    }
    run(){
        // 新值
        const  value = this.get()
        // 当值改变时
        if(value !== this.value){
            // 更新value
            this.value = value
            // 触发watch回调函数
            this.cb.call(this.vm)
        }
    }
    addDep (dep) {
        const id = dep.id
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }
}