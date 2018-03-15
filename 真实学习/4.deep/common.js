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

// watch中解析路径
// 非数字字母 . $ 符号
const bailRE = /[^\w\.]/
export function parsePath (path) {
    // 如果非数字字母 . $ 符号，不执行
    if (bailRE.test(path)) {
        return
    } else {
        // 解析路径 list.a.b ==> ['list', 'a', 'b']
        const segments = path.split('.')
        // 闭包，返回函数，传入对象例如vue，返回list.a.b的值
        return function (obj) {
            // for循环，obj依次为this.list, this.list.a, this.list.a.b的值
            for (let i = 0; i < segments.length; i++) {
                if (!obj) return
                obj = obj[segments[i]]
            }
            // 返回this.list.a.b的值
            return obj
        }
    }
}