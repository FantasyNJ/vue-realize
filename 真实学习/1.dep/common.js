//  判断是否为obj或arr
export const isObject = function (v) {
    return v !== null && typeof v === 'object';
}

// 这是对象的值是否为可遍历
export const def = function (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        writable: true,
        enumerable: !!enumerable,
        configurable: true
    })
}