import {isObject} from "./util.js";
import {Compile} from './compile.js'
import {Dep} from './dep.js'

/*
* props 的初始化主要过程，就是遍历定义的 props 配置。遍历的过程主要做两件事情：一个是调用 defineReactive 方法把每个 prop 对应的值变成响应式，可以通过 vm._props.xxx 访问到定义 props 中对应的属性。对于 defineReactive 方法，我们稍后会介绍；另一个是通过 proxy 把 vm._props.xxx 的访问代理到 vm.xxx 上，我们稍后也会介绍。
* */

// function initProps(vm, propsOptions) {
//     const propsData = vm.$options.propsData || {}
//     const keys = vm.$options._propKeys = []
//     for (const key in propsOptions) {
//         keys.push(key)
//         const value = propsData[key].default
//         defineReactive(vm._props, key, value)
//
//         if (!(key in vm)) {
//             proxy(vm, '_props', key)
//         }
//     }
// }

function initData(vm) {
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data() : data || {}
    for (let key in data) {
        // defineReactive(vm._data, key, data[key])
        proxy(vm, '_data', key)
    }
    observe(data)

    vm.$compile = new Compile(vm.$el, vm)
}

function defineReactive(obj, key, value) {
    let dep = new Dep()
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
            // console.log(`获取 ${key} 的值为 ${value}`)
            if (Dep.target) {
                // 将此字段的Watcher收集到依赖当中
                dep.depend()
            }
            return value
        },
        set(v) {
            if (v === value) {
                return
            }
            // 如果是对象重新遍历
            observe(v)
            value = v
            // console.log(`修改 ${key} 的值为 ${value}`)
            // 通知订阅者
            dep.notify()
        }
    })
}

function observe(obj) {
    if (!isObject(obj)) {
        return
    }

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 先递归，再绑定，防止触发get
            observe(obj[key])
            defineReactive(obj, key, obj[key])
        }
    }

    obj.__ob__ = null
}

const sharedPropertyDefinition = {
    configurable: true,
    enumerable: true
}

// 将data和props挂在到vm上
function proxy(vm, sourceKey, key) {
    sharedPropertyDefinition.get = function () {
        return vm[sourceKey][key]
    }
    sharedPropertyDefinition.set = function (v) {
        vm[sourceKey][key] = v
    }
    Object.defineProperty(vm, key, sharedPropertyDefinition)
}

export function initState(vm) {
    vm._watchers = []
    const opts = vm.$options

    if (opts.data) {
        initData(vm)
    } else {
        // observe(vm._data = {}, true)
    }
}

export function stateMixin(Vue) {
    Vue.prototype.$watch = function() {

    }
}
