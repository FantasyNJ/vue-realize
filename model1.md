# 任务目的

1. 了解 getter 和 setter
2. 了解 new

# 任务描述

```javascript

let app1 = new Observer({
  name: 'youngwind',
  age: 25
});

let app2 = new Observer({
  university: 'bupt',
  major: 'computer'
});

// 要实现的结果如下：
app1.data.name // 你访问了 name
app.data.age = 100;  // 你设置了 age，新的值为100
app2.data.university // 你访问了 university
app2.data.major = 'science'  // 你设置了 major，新的值为 science

```
请实现这样的一个 Observer，要求如下：

1. 传入参数只考虑对象，不考虑数组。
2. new Observer返回一个对象，其 data 属性要能够访问到传递进去的对象。
3. 通过 data 访问属性和设置属性的时候，均能打印出右侧对应的信息。



```javascript

// 构造函数
function Observer(obj){
    this.data = obj;
    this.walk(obj);
}

// 循环遍历对象中的每项
Observer.prototype.walk = function(obj){
    var t = this;
    for(var attr in obj){
        var item = obj[attr];
        // 如果是对象，则递归重复遍历
        if(typeof item === 'object'){
            t.walk(item);
        }
        // 如果不是对象，则进行数据绑定
        else{  // 检测不到key为对象的属性
            t.convert(obj, attr)
        }
    }
}

// 数据绑定（监听）
Observer.prototype.convert = function(obj, attr){
    // 此处的value值就是obj.attr对应的值
    var value = obj[attr];
    Object.defineProperty(obj, attr, {
        enumerable: true,  // 当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。
        configurable: true,  // 当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。
        get() {
            console.log(`你访问了${attr}`);
            return value
        },
        set(newval) {
            console.log(newval)
            if (newval !== value) {
                console.log(`你设置了${attr}，新的值为${newval}`);
                value = val
            }
        }
    })
}

let app1 = new Observer({
    name: 'youngwind',
    age: 25,
    list: {
        haha: 'oh',
        lala: 'ff'
    }
});

```

# 问题
1. 改变key为对象的属性无法监听


