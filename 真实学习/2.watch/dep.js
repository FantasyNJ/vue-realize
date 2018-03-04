// 增加观察者队列中的观察者并发布更新通知
import { remove } from './common.js'

let uid = 0;

export default class Dep {
    constructor(){
        this.id = uid++;
        this.subs = [];
    }
    // 添加订阅者
    addSub (sub) {
        this.subs.push(sub)
    }
    // 删除订阅者
    removeSub (sub) {
        remove(this.subs, sub)
    }
    // 检查当前Dep.target是否存在以及判断这个watcher已经被添加到了相应的依赖当中，如果没有则添加订阅者(依赖)，如果已经被添加了那么就不做处理
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    // 通知订阅者(依赖)更新
    notify () {
        // stablize the subscriber list first
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

Dep.target = null;