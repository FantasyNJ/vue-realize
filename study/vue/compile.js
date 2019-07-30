import {Watcher} from "./watcher.js";
import {isTextNode, isElementNode} from "./util.js";

export function Compile(el, vm) {
    this.$vm = vm
    this.$el = vm.$el
    this.reg = /\{\{(.*)\}\}/

    if (this.$el) {
        this.$fragment = this.node2Fragment()
        this.compileElement(this.$fragment)
        this.$el.appendChild(this.$fragment)
    }
}

Compile.prototype.compileElement = function (el) {
    console.log(el)
    Array.prototype.slice.call(el.childNodes).forEach((node) => {
        console.log(node, node.nodeType, '231312313')
        if (isTextNode(node)) {
            this.compileText(node)
        }

        if (isElementNode(node)) {
            this.compileElement(node)
        }
    })
}

Compile.prototype.node2Fragment = function () {
    let fragment = document.createDocumentFragment()

    let child
    while (child = this.$el.firstChild) {
        const node = child
        fragment.appendChild(node)
    }

    return fragment
}

Compile.prototype.compileText = function(node) {
    let originText = node.textContent
    if (this.reg.test(originText)) {
        // 记住，之前没有遇到的知识点
        let key = RegExp.$1.trim()

        const text = originText.replace(this.reg, () => {
            return this.getter(key)
        })
        node.textContent = text
        new Watcher(this.$vm, key, (val, oldVal) => {
            this.updateFn(node, originText, val)
        })
    }
}

Compile.prototype.updateFn = function(node, originText, val, oldVal) {
    const text = originText.replace(this.reg, function () {
        return val
    })
    console.log(val, node, '123123')
    node.textContent = text
}

Compile.prototype.getter = function (key) {
    let obj = this.$vm
    let keys = key.split('.')

    if (keys.length === 1) {
        return obj[key]
    } else {
        return keys.reduce((obj, key) => {
            return obj[key]
        }, obj)
    }
}
