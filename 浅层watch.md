# 任务描述

这是“动态数据绑定”系列的第二题。在第一题的基础上，我们继续考虑以下难点：

考虑传递回调函数。在实际应用中，当特定数据发生改变的时候，我们是希望做一些特定的事情的，而不是每一次都只能打印出一些信息。所以，我们需要支持传入回调函数的功能。举个例子。

```javascript
let app1 = new Observer({
        name: 'youngwind',
        age: 25
});

// 你需要实现 $watch 这个 API
app1.$watch('age', function(age) {
    console.log(`我的年纪变了，现在已经是：${age}岁了`)
});

app1.data.age = 100; // 输出：'我的年纪变了，现在已经是100岁了'
```

## $watch
```javascript
vm.$watch( expOrFn, callback, [options] )
参数：

{string | Function} expOrFn
{Function | Object} callback
{Object} [options]
{boolean} deep
{boolean} immediate
返回值：{Function} unwatch

用法：

观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。
```

- 示例
```javascript
// 键路径
vm.$watch('a.b.c', function (newVal, oldVal) {
  // 做点什么
})
```

- 思路

`当特定数据发生改变的时候，我们是希望做一些特定的事情的，而不是每一次都只能打印出一些信息。`在此引入watch函数，watch中传入数据改变时想要做的事情。之前数据改变打印的数据是写在Observer构造函数中的，实际使用使我们不能对Observer函数内部进行修改，引入watch函数就可以解决这个问题。

数据监听的这种模式很像DOM中的事件模型。
DOM事件模型中，先给一个元素绑定一个事件函数，当我们触发这个元素的事件时会执行绑定的事件函数。
在这里，我们data对象中的属性 ≈ DOM中的元素，watch中监听元素改变所触发的函数 ≈ 事件绑定的函数，数据改变 ≈ 触发DOM事件

```javascript
// 元素绑定事件
elem.addEventListener('click', function(){
    console.log('点击');
})
// 监听数据变化
vm.$watch('a.b.c', function (newVal, oldVal) {
    console.log('我的值被改变');
})
```

DOM事件模型只存在于DOM中，然而我们要在数据中实现这样的一个事件模型，这时就要用到**发布-订阅模式**




## 浅层watch实现

1. 方法1
```javascript
function Observer(data) {
    this.data = data;
    this.event = {};
    this.walk(this.data);
}

var pt = Observer.prototype;

pt.$on = function(key, fn){
    var t = this;

    if(!t.event[key]){
        t.event[key] = [fn];
    } else {
        t.event[key].push(fn);
    }
}

pt.$emit = function(key, newVal, oldVal){
    var t = this;
    // 触发冒泡
    t.event[key].forEach(function (fn) {
        // 注意this指向，不加call指向window
        fn.call(t, newVal, oldVal);
    })
}

pt.walk = function(data, parent){
    var t = this;
    // 父级
    var newParent = parent ? parent : '';
    for(var attr in data){
        // 当前对象路径
        var path = newParent ? newParent +  '.' + attr : attr;
        if(typeof data[attr] == 'object'){
            t.walk(data[attr], path);
        }
        t.convert(data, attr, path);
    }
}


pt.$watch = function (key, fn) {
    this.$on(key, fn)
}

pt.convert = function(data, attr, path){
    var t = this;
    var value = data[attr];

    Object.defineProperty(data, attr, {
        enumerable: true,
        configurable: true,
        get: function(){
            console.log(`读取了${attr},值为${value}`);
            return value;
        },
        set: function(val){
            if(val !== value){
                // 触发属性的watch函数，在value赋值之前触发
                console.log(path, 'path');
                t.$emit(path, val, value);

                value = val;
                if(typeof val === 'object'){
                    t.walk(val);
                }
                console.log(`设置了${attr},值为${value}`);
            }
        }
    })
}

let app1 = new Observer({
    name: 'youngwind',
    age: 25,
    list: {
        haha: 'oh',
        lala: 'ff',
        dist: {
            xixi: 123456
        }
    }
});

app1.$watch('list', function(newVal,oldVal){
    console.log(this);
    console.log(newVal, oldVal)
    console.log('list中的值变了');
});
```
2. 方法2
```javascript
function Observer(data) {
    this.data = data;
    this.event = {};
    this.walk(this.data);
    // 父级属性
    this.parent = '';
}

var pt = Observer.prototype;

pt.$on = function(key, fn){
    var t = this;

    if(!t.event[key]){
        t.event[key] = [fn];
    } else {
        t.event[key].push(fn);
    }
}

pt.$emit = function(key, newVal, oldVal){
    var t = this;
    // 触发冒泡
    t.event[key].forEach(function (fn) {
        // 注意this指向，不加call指向window
        fn.call(t, newVal, oldVal);
    })
}

pt.walk = function(data){
    var t = this;
    for(var attr in data){
        if(typeof data[attr] == 'object'){
            var obs = new Observer(data[attr]);
            obs.parent = ;
        }
        t.convert(data, attr, path);
    }
}


pt.$watch = function (key, fn) {
    this.$on(key, fn)
}

pt.convert = function(data, attr, path){
    var t = this;
    var value = data[attr];

    Object.defineProperty(data, attr, {
        enumerable: true,
        configurable: true,
        get: function(){
            console.log(`读取了${attr},值为${value}`);
            return value;
        },
        set: function(val){
            if(val !== value){
                // 触发属性的watch函数，在value赋值之前触发
                console.log(path, 'path');
                t.$emit(path, val, value);

                value = val;
                if(typeof val === 'object'){
                    t.walk(val);
                }
                console.log(`设置了${attr},值为${value}`);
            }
        }
    })
}

let app1 = new Observer({
    name: 'youngwind',
    age: 25,
    list: {
        haha: 'oh',
        lala: 'ff',
        dist: {
            xixi: 123456
        }
    }
});

app1.$watch('list', function(newVal,oldVal){
    console.log(this);
    console.log(newVal, oldVal)
    console.log('list中的值变了');
});
```