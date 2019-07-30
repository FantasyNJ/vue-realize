export function query(el) {
    if (typeof el === 'string') {
        return document.querySelector(el)
    } else {
        return el
    }
}

export function isObject(data) {
    return data !== null && typeof data === 'object'
}

export function isPlainObject(data) {
    return Object.prototype.toString.call(data) === '[object Object]'
}

export function isElementNode(node) {
    return node.nodeType == 1
}

export function isTextNode(node) {
    return node.nodeType == 3
}
