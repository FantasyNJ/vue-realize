// 监听
import Dep, { pushTarget, popTarget } from './dep.js';

import { parsePath, isObject } from './common.js'

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
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()

        // 返回fn
        this.getter = parsePath(expOrFn)

        // 当前的value值，在触发this.get的时候触发依赖收集
        this.value = this.get();
    }
    // 获取属性的值
    get(){
        Dep.target = this;
        // this.getter访问属性的时候触发每个属性的get()
        const value = this.getter.call(this.vm, this.vm);
        // 如果深度监听，遍历每层属性
        if (this.deep) {
            traverse(value);
        }
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
         1. 值改变时
         2. 如果值是一个obj，旧值和新值指向的是同一个obj，所以value === this.value，这是就判断this.deep是否为true
         3. 此处源码的判断条件(value !== this.value || isObject(value) || this.deep)还有isObject(value),不明白为什么要加判断是否为对象??????
         */
        if(value !== this.value || this.deep){
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
    // 取消dep与本watch实例的关联（unwatch）
    teardown(){
        // 遍历当前watch建立联系的dep，删除本watch
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
    }
    // 清除newDepIds和newDeps
    cleanupDeps(){
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

// 递归遍历一个对象以唤起所有转换的getter，这样对象内部的每个嵌套属性都会被收集为“深层”依赖关系。
// val 值  seen:存储depId，判断终止条件
const seenObjects = new Set();

function traverse (val, seen) {

    if (!seen) {
        seen = seenObjects
        seen.clear()
    }
    // 判断是否为对象
    const isO = isObject(val)
    // 如果是对象
    if (isO) {
        // 是监听的对象
        if (val.__ob__) {
            // 获取该对象Observe中的dep的id
            const depId = val.__ob__.dep.id
            if (seen.has(depId)) {
                return
            } else {
                seen.add(depId)
            }
        }

        let keys = Object.keys(val)
        let i = keys.length
        // 递归，此处触发val[keys[i]]的get()方法，从而将当前watch绑定到val[keys[i]]的dep中
        while (i--) traverse(val[keys[i]], seen)
    }
}