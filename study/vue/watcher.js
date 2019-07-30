import {Dep} from "./dep.js";

export class Watcher {
    constructor(vm, key, cb) {
        this.key = key.trim()
        this.vm = vm
        this.cb = cb
        this.depIds = []

        this.value = this.get()
    }

    // compile时收集
    get() {
        Dep.target = this
        const value = this.getter()
        Dep.target = null
        return value
    }

    update() {
        this.run()
    }

    run() {
        const oldVal = this.value
        const value = this.get() // 会走addDep
        if (value !== oldVal) {
            this.cb.call(this.vm, value, oldVal)
            this.value = value
        }
    }

    addDep(dep) {
        // 判断dep中是否已经有当前watcher，如果没有则添加当前watcher
        if (!this.depIds.includes(dep.uid)) {
            dep.addSub(this)
            this.depIds.push(dep.uid)
        }
    }

    getter(){
        let obj = this.vm
        let key = this.key
        let keys = key.split('.')

        if (keys.length === 1) {
            return obj[key]
        } else {
            return keys.reduce((obj, key) => {
                return obj[key]
            }, obj)
        }
    }
}
