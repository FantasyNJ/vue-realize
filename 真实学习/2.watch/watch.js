// 监听
import Dep, { pushTarget, popTarget } from './dep';

let uid = 0;

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
    }
}