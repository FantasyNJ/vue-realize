import { def, isObject, hasOwn } from './common.js'
import Dep from './dep.js'

export class Observer {
    constructor(value){
        // 当前遍历的obj或arr
        this.value = value;

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

export function observe(val) {

    // 如果不是obj或arr不执行
    if( !isObject(val) ){
        return
    }

    // 开始观察数据
    let ob = new Observer(val);

    return ob;
}

window.ss = defineReactive

// 监听属性
export function defineReactive(obj, key, val) {

    // 每个属性新建一个dep实例，管理这个属性的依赖
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

    // 向下监听(只监听obj和arr)
    var childOb = observe(val);

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,   // alpha版本是false，正式版变为true了，不知是处于什么考虑？？？？
        get(){
            // 该属性存在watch监听, 添加watch实例化对象
            if( Dep.target ){
                dep.addSub( Dep.target );
            }

            // 在第一次监听数据是get和set都是undefined，getter !== 当前的get，所以不会陷入死循环
            const value = getter ? getter.call(obj) : val;

            return val;

            // 解开注释后会触发死循环
            // return obj[key];
        },
        set(newVal){
            const value = getter ? getter.call(obj) : val;
            // 指没有发生变化时不触发
            if(val === newVal){
                return;
            }

            // 在此执行当值改变的时候执行watch的cb并且更新视图

            // 重新赋值
            val = newVal;

            // 如果新的值为obj或arr（observe中有判断），对得到的新值进行observe
            childOb = observe(newVal)

            // 值改变触发watch中的cb
            dep.notify();
        }
    })
}

// $set
export function set (obj, key, val) {

    // 如果key是存在的，触发obj[key]的set(),更新value
    if ( hasOwn(obj, key) ) {
        obj[key] = val
        return
    }

    // 如果key不存在
    const ob = obj.__ob__

    // 如果obj不是对象（简单数据类型），直接赋值，触发set
    if (!ob) {
        obj[key] = val
        return
    }

    // 如果obj是对象并且key不存在, ob.value===obj ???为什么不直接用obj
    defineReactive(ob.value, key, val)

    return val
}