# Vue2.0源码之数据绑定

## Vue源码学习前期知识

1. Object.defineProperty
2. es6基础知识
3. flow.js
4. webpack(vue2.0源码使用webpack构建)

熟练掌握`Object.defineProperty`中的各个参数的含义

#### 数据描述
>value
>writable

#### 存取器描述
>get
>set

#### 两者通用
>configurable
>enumerable

> Object.defineProperty的详解可以参考一下这篇文章[http://blog.ayabala.com/?p=722]()

## Vue的构造函数

**问题一：我们是如何可以直接通过this.xxx来访问到data中的数据的？**

```javascript
// Vue的构造函数
function Vue(options) {
    this.$options = options;
    this._init();
}

// 初始化状态
initState(Vue)


function initState(Vue){
    Vue.prototype._init = function () {
        // vm => 实例化对象
        const vm = this;
        // 初始化数据
        initData(vm)
    }
}

// 初始化数据函数
function initData(vm) {
    let data = vm.$options.data;

    // 1. 区分data是object还是函数（ data(){ return{a:1} } ）, 如果没有data属性则置为{}
    vm._data = typeof data === 'function' ? data.call(vm) : data || {} ;

    // 2. 遍历data中的数据并挂载到Vue实例化对象上以便直接使用this调用
    const keys = Object.keys(data);

    for(let i = 0; i < keys.length; i++){
        let key = keys[i];
        proxy(vm, key);
    }
}

// 监听绑在this的data
function proxy(vm, key){
    Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get(){
            return vm._data[key];
        },
        set(newVal){
            vm._data[key] = newVal;
        }
    })
}

window.app = new Vue({
    data: {
        haha: 123456,
        list: {
            name: '1234',
            sex: '男',
            xixi: {
                ka: 11
            }
        }
    },
})
```

上述例子中只是data中的第一层属性绑定在this上，而且只是实现了第一层的监听，Vue源码中使用Observe对象来实现data对象的深度监听

## Observe对象

**问题二：如何实现data中每个属性的监听?**

**问题三：为什么有些情况下设置的属性不会触发监听和视图更新，vue中的$set是如何实现的?**

```javascript
export class Observer {
    constructor(value){
        // 当前遍历的obj或arr
        this.value = value;

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
            // 在第一次监听数据是get和set都是undefined，getter !== 当前的get，所以不会陷入死循环
            const value = getter ? getter.call(obj) : val;

            console.log('data')

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

    // 如果obj是对象并且key不存在, ob.value===obj
    defineReactive(ob.value, key, val)

    return val
}
```