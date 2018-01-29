# 任务描述

深层次数据变化如何逐层往上传播?

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

Object.defineProperty属性只是对对象中的单个属性进行监听,我么之前对data数据进行监听使用了递归便利对象中的单个属性并对它们进行单个监听已达到对整个data对象的监听。但是这些个单个属性并没有一个在data对象中的位置关系，Object.defineProperty并不知道所监听的属性的上层属性，也就是说`Object.defineProperty中没有类似DOM事件中的冒泡机制`，这就是我们在这次任务中需要解决的问题。

# 实现

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
            var attrs = key.split('.');
            var keys = [];

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

<!-- ```javascript
function Observer(obj){
    this.data = obj;
    this.walk(obj);
    this.event = {};
}

var pt = Observer.prototype;

// 发布-订阅模式

// 事件绑定，类似DOM中的addEventListener
pt.$on = function (attr, fn) {
    if( this.event[attr] ){
        this.event[attr].push(fn);
    }else{
        this.event[attr] = [fn]
    }
}

// 触发事件
pt.$emit = function (attr, newVal, oldVal) {
    if(this.event[attr] && this.event.hasOwnProperty(attr) ){
        this.event[attr].forEach( ( fn ) => {
            fn(newVal, oldVal)
        } )
    }
}

pt.walk = function(obj, parent){
    var t = this;
    var parent = parent ? parent : '';
    for(var attr in obj){
        var item = obj[attr];
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
                t.$emit(path, newVal, value);
                if( typeof newVal === 'object' ){
                    t.walk( newVal, path );
                }
                value = newVal
            }
        }
    })
}


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

app1.$watch('age', function (age, oldAge) {
    console.log(`我的年纪变了，现在已经是：${age}岁了，原来的年龄是${oldAge}岁。`)
});
```

```javascript
function Observer(obj){
            this.data = obj;
            this.walk(obj);
            this.event = {}
        }

        var pt = Observer.prototype;

        pt.$on = function (attr, fn) {
            if( this.event[attr] ){
                this.event[attr].push(fn);
            }else{
                this.event[attr] = [fn]
            }
        }

        pt.$emit = function (attr, val) {
            if(this.event[attr] && this.event.hasOwnProperty(attr) ){
                var attrs = attr.split('.');
                var flowAttr = []

                attrs.forEach( (attr, index) => {
                    flowAttr.unshift( attrs.slice(0, index+1).join('.') );
                } )

                console.log(attrs, flowAttr)

                flowAttr.forEach( (attr) => {
                    this.event[attr].forEach( ( fn ) => {
                        fn(val)
                    } )
                } )
            }
        }

        pt.walk = function(obj, parent){
            var t = this;
            var parent = parent ? parent : '';
            for(var attr in obj){
                var item = obj[attr];
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
                        t.$emit(path, newVal);
                        if (typeof newVal === 'object') {
                            t.walk(newVal, path);
                        }
                        value = newVal
                    }
                }
            })
        }

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

        app1.$watch('list', function(age) {
            console.log(`list变了`)
        });

        app1.$watch('list.haha', function(age) {
            console.log(`list.haha变了,值为${age}`);
        });
``` -->
