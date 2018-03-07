//  判断是否为obj或arr
export const isObject = function (v) {
    return v !== null && typeof v === 'object';
}

// 设置对象的值是否为可遍历
export const def = function (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        writable: true,
        enumerable: !!enumerable,
        configurable: true
    })
}

// 删除数组中的一项
export const remove = (arr, item) => {
    let index = arr.indexOf(item);
    arr.splice(index, 1);
}

// 判断是不是obj
export function isPlainObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}