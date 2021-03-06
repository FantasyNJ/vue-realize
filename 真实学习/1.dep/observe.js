import { isObject, def } from './common.js'

class Observe {
    constructor(value){
        // 当前遍历的obj或arr
        this.value = value;
        this._vmCount = 0;

        // ?????, 不可被遍历
        def(value, '__ob__', this);

        // 只遍历obj，arr的逻辑不写
        this.walk(value);
    }

    walk(obj){
        // 不理解为什么要用this.value二不是直接用obj，虽然this.value===obj
        const val = this.value;
        for(const key in obj){
            defineReactive(obj, key, val[key]);
        }
    }
}

function observe(val) {

    // 如果不是obj或arr不执行
    if( !isObject(val) ){
        return
    }

    // 开始观察数据
    let ob = new Observe(val);

    return ob;
}

//
function defineReactive(obj, key, val) {


    // 检查defineProperty的属性值
    const property = Object.getOwnPropertyDescriptor(obj, key)
    // 如果属性值的configurable为不可设置状态则阻止执行防止报错
    if (property && property.configurable === false) {
        return
    }

    // 声明getter和setter，在第一次监听数据是get和set都是undefined
    const getter = property && property.get;
    const setter = property && property.set;

    var childOb = observe(val);

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,   // alpha版本是false，正式版变为true了，不知是处于什么考虑？？？？
        get(){
            // 在第一次监听数据是get和set都是undefined，不用担心getter.call之后陷入死循环
            const value = getter ? getter.call(obj) : val;
            return val;
        },
        set(newVal){
            const value = getter ? getter.call(obj) : val
            // 指没有发生变化时不触发
            if(val === newVal){
                return;
            }

            // 重新赋值
            val = newVal;
        }
    })
}

export default observe;