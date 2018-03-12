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

        // 存储当前watch已经建立联系的dep
        this.deps = []
        this.depIds = []

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
            // 旧值
            const oldVal = this.value
            // 更新value，如果是对象原先指针已经断了
            this.value = value
            // 触发watch回调函数
            this.cb.call(this.vm, value, oldVal)
        }
    }
    // 存储与watch建立联系的dep
    /* 此处为自己实现 */
    addDep (dep) {
        const id = dep.id
        // 当前dep没有与watch建立联系
        if( !this.depIds.includes(id) ){
            this.depIds.push(id)
            this.deps.push(dep)
            // dep中存储当前watch
            dep.addSub(this)
        }
    }
    // 取消dep与本watch实例的关联（unwatch）
    teardown(){
        // 遍历当前watch建立联系的dep，删除本watch
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
    }
}