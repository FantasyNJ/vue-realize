// 增加观察者队列中的观察者并发布更新通知
import { remove } from './common.js'

let uid = 0;

export default class Dep {
    constructor(){
        this.id == uid++;
        this.subs = [];
    }
    // 添加进队列
    addSub (sub) {
        this.subs.push(sub)
    }
    // 从队列中删除
    removeSub (sub) {
        remove(this.subs, sub)
    }
    // ???
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    // ???
    notify () {
        // stablize the subscriber list first
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

Dep.target = null;