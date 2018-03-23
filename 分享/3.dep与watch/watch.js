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

        // 返回fn
        this.getter = parsePath(expOrFn)

        // 当前的value值
        this.value = this.get();
    }
    // 获取属性的值
    get(){
        // 关键点，Dep.target在此处设置为当前Watcher实例
        Dep.target = this;
        const value = this.getter(this.vm);
        Dep.target = null;
        this.cleanupDeps();
        return value;
    }
    update(){
        this.run()
    }
    run(){
        // 新值
        const value = this.get()
        /*
         值改变时
         */
        if(value !== this.value ){
            // 旧值
            const oldVal = this.value
            // 更新value，如果是对象原先指针已经断了
            this.value = value
            // 触发watch回调函数
            this.cb.call(this.vm, value, oldVal)
        }
    }
    // 存储与watch建立联系的dep
    addDep (dep) {
        const id = dep.id
        // newDepIds没有该属性的depId时，在newDepIds存储depId，newDeps存储dep
        if( !this.newDepIds.has(id) ){
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            // 如果depIds中不存在当前depId，dep添加当前watch,防止重复添加
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }
    // 清除newDepIds和newDeps
    cleanupDeps() {
        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            // 新增加的dep中没有当前watch中已存储的dep，则在dep中删除当前watch
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        // 清空newDepIds newDeps
        // newDepIds 赋给 depIds， newDeps 赋给 deps。这些值是数组，不能直接赋值并清除
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }
}