import {initState} from "./state.js";
import {query} from "./util.js";

let uid = 0

export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this
        vm._self = vm
        vm._uid = uid++
        vm._self = vm

        vm.$options = options || {}
        vm.$el = query(vm.$options.el || document.body)

        // initLifecycle(vm)
        // initEvents(vm)
        // initRender(vm)
        // callHook(vm, 'beforeCreate')
        // initInjections(vm) // resolve injections before data/props
        initState(vm)
        // initProvide(vm) // resolve provide after data/props
        // callHook(vm, 'created')

        // 挂载
        // if (vm.$options.el) {
        //     vm.$mount(vm.$options.el)
        // }
    }
}
