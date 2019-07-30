let uid = 0

export class Dep {
    // watcher
    static target = null
    constructor() {
        this.uid = uid++
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    notify () {
        // stabilize the subscriber list first
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }

    depend() {
        Dep.target.addDep(this)
    }
}
