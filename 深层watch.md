# 任务描述

这是“动态数据绑定”的第三题。在第二题的基础上，我们再多考虑一个问题："深层次数据变化如何逐层往上传播"。举个例子。

```javascript
let app2 = new Observer({
    name: {
        firstName: 'shaofeng',
        lastName: 'liang'
    },
    age: 25
});

app2.$watch('name', function (newName) {
    console.log('我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。')
});

app2.data.name.firstName = 'hahaha';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
app2.data.name.lastName = 'blablabla';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
```

firstName 和 lastName 作为 name 的属性，其中任意一个发生变化，都会得出以下结论："name 发生了变化。"这种机制符合”事件传播“机制，方向是从底层往上逐层传播到顶层。
这现象想必你们也见过，比如：“点击某一个DOM元素，相当于也其父元素和其所有祖先元素。”（当然，你可以手动禁止事件传播） 所以，这里的本质是："浏览器内部实现了一个事件传播的机制"


## 实现

```javascript
function Observer(data) {
    this.data = data;
    this.event = {};
    this.walk(this.data);
}

var pt = Observer.prototype;

// 注册事件
pt.$on = function(key, fn){
    var t = this;

    if(!t.event[key]){
        t.event[key] = [fn];
    } else {
        t.event[key].push(fn);
    }
}

// 触发事件
pt.$emit = function(key, newVal, oldVal){
    var t = this;
    // 触发冒泡
    var attrs = key.split('.');  // 分割属性
    var keys = [];  // 所有数据层

    attrs.forEach(function(itemAttr, index){
        keys.unshift( attrs.slice(0,index+1).join('.') );
    })

    keys.forEach( function (attr) {
        if(!t.event[attr]){
            return;
        }
        t.event[attr].forEach(function (fn) {
            // 注意this指向，不加call指向window
            fn.call(t, newVal, oldVal);
        })
    } )
}

// 绑定监听事件
pt.$watch = function (key, fn) {
    this.$on(key, fn);
}

pt.walk = function(data, parent){
    var t = this;
    // 父级
    var newParent = parent ? parent : '';
    for(var attr in data){
        // 当前对象路径
        var path = newParent ? newParent +  '.' + attr : attr;
        if(typeof data[attr] == 'object'){
            // path路径传入当做下一层数据的父级
            t.walk(data[attr], path);
        }
        // 监听属性
        t.convert(data, attr, path);
    }
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
            // 值改变时才触发重新赋值
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
    console.log(newVal, oldVal);
    console.log('list中的值变了');
});
```