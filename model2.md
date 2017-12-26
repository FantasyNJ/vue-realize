# 任务描述

1. 如果设置新的值是一个对象的话，新设置的对象的属性是否能能继续响应 getter 和 setter。举个例子。

```javascript

 let app1 = new Observer({
         name: 'youngwind',
         age: 25
 });

 app1.data.name = {
         lastName: 'liang',
         firstName: 'shaofeng'
 };

 app1.data.name.lastName;
 // 这里还需要输出 '你访问了 lastName '
 app1.data.name.firstName = 'lalala';
 // 这里还需要输出 '你设置了firstName, 新的值为 lalala'

```

2. 考虑传递回调函数。在实际应用中，当特定数据发生改变的时候，我们是希望做一些特定的事情的，而不是每一次都只能打印出一些信息。所以，我们需要支持传入回调函数的功能。举个例子。

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

# 实现

```javascript

function Observer(obj){
    this.data = obj;
    this.walk(obj);
    this.event = {};
}

var pt = Observer.prototype;

// 事件模型
// 事件绑定 类似jq中的on...
pt.$on = function (attr, fn) {
    // 如果该属性有事件，添加事件
    if( this.event[attr] ){
        this.event[attr].push(fn);
    }
    // 如果该属性不存在事件，创建新的事件队列
    else{
        this.event[attr] = [fn]
    }
}
// 事件触发 类似jq中的trigger
pt.$emit = function (attr, newVal, oldVal) {
    // 如果该属性已经绑定事件并且该属性是event对象的自有属性（飞原型链属性，按照绑定顺序依次处罚）
    if(this.event[attr] && this.event.hasOwnProperty(attr) ){
        this.event[attr].forEach( ( fn ) => {
            fn(newVal, oldVal)
        } )
    }
}

pt.walk = function(obj, parent){
    var t = this;
    // 循环遍历的属性的父属性（实现事件冒泡）
    var parent = parent ? parent : '';
    for(var attr in obj){
        var item = obj[attr];
        // 记录属性的路径以实现事件绑定
        var path = parent ? parent + '.' + attr : attr;
        if(typeof item === 'object'){
            t.walk(item, path);
        }
        // 不论对象还是简单类型的值都监听
        t.convert(obj, attr, path)
    }
}

pt.convert = function(obj, attr, path){
    var value = obj[attr];
    var t = this;
    Object.defineProperty(obj, attr, {
        enumerable: true,  // 当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。
        configurable: true,  // 当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。
        get() {
            console.log(`你访问了${attr}`);
            return value
        },
        set(newVal) {
            console.log(newVal)
            if (value !== newVal) {
                // 当属性值发生改变时，触发watch中绑定的事件
                t.$emit(path, newVal, value);
                // 如果属性值修改为对象类型（此处判断为对象类型用typeof不严谨）则监听新设置的对象
                if( typeof newVal === 'object' ){
                    t.walk( newVal, path );
                }
                value = newVal；
            }
        }
    })
}

// 监听函数，相当于绑定事件
pt.$watch = function (attr, fn) {
    this.$on( attr, fn )
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

app1.$watch('age', function(age, oldAge) {
    console.log(`我的年纪变了，现在已经是：${age}岁了，元来的年龄是${oldAge}岁。`)
});

```