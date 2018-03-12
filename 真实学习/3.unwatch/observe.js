import { isObject, def } from './common.js'
import Dep from './dep.js'

// Observe中的value只可能是obj或arr
class Observe {
    constructor(value){
        // 当前遍历的obj或arr
        this.value = value;
        this._vmCount = 0;

        //??? dep记录了和这个value值的相关依赖
        this.dep = new Dep()

        // ?????, 不可被遍历,value其实就是vm._data, 即在vm._data上添加__ob__属性
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

    //??? 每个属性新建一个dep实例，管理这个属性的依赖
    const dep = new Dep()


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
            // 该属性存在watch监听, 添加watch实例化对象
            if( Dep.target ){
                dep.depend();
            }
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

            // 如果新的值为obj或arr（observe中有判断），对得到的新值进行observe
            childOb = observe(newVal)

            // 值改变触发watch中的cb
            dep.notify();
        }
    })
}

export default observe;