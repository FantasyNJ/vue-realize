# Object.defineProperty

顾名思义，为对象定义属性。在js中我们可以通过下面这几种方法定义属性


3种定义对象属性的方法
```
// (1) define someOne property name
someOne.name = 'cover';
//or use (2) 
someOne['name'] = 'cover';
// or use (3) defineProperty
Object.defineProperty(someOne, 'name', {
    value : 'cover'
})
```
使用Object.defineProperty定义对象属性看起来很麻烦，但是这种方式是十分强大的

我们可以通过Object.defineProperty这个方法，直接在一个对象上定义一个新的属性，或者是修改已存在的属性。最终这个方法会返回该对象。

# 语法
Object.defineProperty(obj, prop, descriptor)

参数说明：
- obj：必需。目标对象 
- prop：必需。需定义或修改的属性的名字
- descriptor：必需。目标属性所拥有的特性

返回值：
- 传入函数的对象。即第一个参数obj

针对属性，我们可以给这个属性设置一些特性，比如是否只读不可以写；是否可以被for..in或Object.keys()遍历。

给对象的属性添加特性描述，目前提供两种形式：数据描述和存取器描述。

# 数据描述

### value
属性对应的值,可以使任意类型的值，默认为undefined

```
var obj = {}
//第一种情况：不设置value属性
Object.defineProperty(obj,"newKey",{

});
console.log( obj.newKey );  //undefined
------------------------------
//第二种情况：设置value属性
Object.defineProperty(obj,"newKey",{
    value:"hello"
});
console.log( obj.newKey );  //hello
```

### writable

属性的值是否可以被重写。设置为true可以被重写；设置为false，不能被重写。默认为false。

```
var obj = {}
//第一种情况：writable设置为false，不能重写。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false
});
//更改newKey的值
obj.newKey = "change value";
console.log( obj.newKey );  //hello

//第二种情况：writable设置为true，可以重写
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true
});
//更改newKey的值
obj.newKey = "change value";
console.log( obj.newKey );  //change value
```

### enumerable

此属性是否可以被枚举（使用for...in或Object.keys()）。设置为true可以被枚举；设置为false，不能被枚举。默认为false。

```
var obj = {}
//第一种情况：enumerable设置为false，不能被枚举。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false
});

//枚举对象的属性
for( var attr in obj ){
    console.log( attr );  
}
//第二种情况：enumerable设置为true，可以被枚举。
Object.defineProperty(obj,"haha",{
    value:"xixi",
    writable:false,
    enumerable:true
});

//枚举对象的属性
for( var attr in obj ){
    console.log( attr );  //xixi
}
```

### configurable

是否可以删除目标属性或是否可以再次修改属性的特性（writable, configurable, enumerable）。设置为true可以被删除或可以重新设置特性；设置为false，不能被可以被删除或不可以重新设置特性。默认为false。


这个属性起到两个作用：
1. 目标属性是否可以使用delete删除
2. 目标属性是否可以再次设置特性

```
//-----------------测试目标属性是否能被删除------------------------
var obj = {}
//第一种情况：configurable设置为false，不能被删除。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:false
});
//删除属性
delete obj.newKey;
console.log( obj.newKey ); //hello

//第二种情况：configurable设置为true，可以被删除。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:true
});
//删除属性
delete obj.newKey;
console.log( obj.newKey ); //undefined

//-----------------测试是否可以再次修改特性------------------------
var obj = {}
//第一种情况：configurable设置为false，不能再次修改特性。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:false
});

//重新修改特性
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true,
    enumerable:true,
    configurable:true
});
console.log( obj.newKey ); //报错：Uncaught TypeError: Cannot redefine property: newKey

//第二种情况：configurable设置为true，可以再次修改特性。
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:false,
    enumerable:false,
    configurable:true
});

//重新修改特性
Object.defineProperty(obj,"newKey",{
    value:"hello",
    writable:true,
    enumerable:true,
    configurable:true
});
console.log( obj.newKey ); //hello
```

除了可以给新定义的属性设置特性，也可以给已有的属性设置特性（非Object.defineProperty定义的）

```
//定义对象的时候添加的属性，是可删除、可重写、可枚举的。
var obj = {
    test:"hello"
}

//改写值
obj.test = 'change value';

console.log( obj.test ); //'change value'

Object.defineProperty(obj,"test",{
    writable:false
})


//再次改写值
obj.test = 'change value again';

console.log( obj.test ); //依然是：'change value'
```

提示：一旦使用Object.defineProperty给对象添加属性，那么如果不设置属性的特性，那么configurable、enumerable、writable这些值都为默认的false

```
var obj = {};
//定义的新属性后，这个属性的特性中configurable，enumerable，writable都为默认的值false
//这就导致了neykey这个是不能重写、不能枚举、不能再次设置特性
//
Object.defineProperty(obj,'newKey',{

});

//设置值
obj.newKey = 'hello';
console.log(obj.newKey);  //undefined

//枚举
for( var attr in obj ){
    console.log(attr);
}
```

**注意 在调用Object.defineProperty()方法时，如果不指定， configurable， enumerable， writable特性的默认值都是false,这跟之前所 说的对于像前面例子中直接在对象上定义的属性，这个特性默认值为为 true。并不冲突，如下代码所示：**

```
//调用Object.defineProperty()方法时，如果不指定
var someOne = { };
someOne.name = 'coverguo';
console.log(Object.getOwnPropertyDescriptor(someOne, 'name'));
//输出 Object {value: "coverguo", writable: true, enumerable: true, configurable: true}

//直接在对象上定义的属性，这个特性默认值为为 true
var otherOne = {};
Object.defineProperty(otherOne, "name", {
    value:"coverguo" 
});  
console.log(Object.getOwnPropertyDescriptor(otherOne, 'name'));
//输出 Object {value: "coverguo", writable: false, enumerable: false, configurable: false}
```

设置的特性总结：

> value: 设置属性的值  
> writable: 值是否可以重写。true | false  
> enumerable: 目标属性是否可以被枚举。true | false  
> configurable: 目标属性是否可以被删除或是否可以再次修改特性 true | false

# 存取器描述

当使用存取器描述属性的特性的时候，允许设置以下特性属性：

```
var obj = {};
Object.defineProperty(obj,"newKey",{
    get:function (){} | undefined,
    set:function (value){} | undefined
    configurable: true | false
    enumerable: true | false
});
```

**注意：当使用了getter或setter方法，不允许使用writable和value这两个属性**

### getter/setter

当设置或获取对象的某个属性的值的时候，可以提供getter/setter方法。

- getter 是一种获得属性值的方法
- setter 是一种设置属性值的方法

在特性中使用get/set属性来定义对应的方法。

```
var obj = {};
var initValue = 'hello';
Object.defineProperty(obj,"newKey",{
    get:function (){
        //当获取值的时候触发的函数
        return initValue;    
    },
    set:function (value){
        //当设置值的时候触发的函数,设置的新值通过参数value拿到
        initValue = value;
    }
});
//获取值
console.log( obj.newKey );  //hello

//设置值
obj.newKey = 'change value';

console.log( obj.newKey ); //change value
```

使用set更改属性的值时，其实对象属性的值并没有发生修改，只有在访问这个属性的时候才被修改

```
var obj = {};
    var initValue = 'hello';
    Object.defineProperty(obj,"newKey",{
        get:function (){
            console.log('get')
            //当获取值的时候触发的函数
            return initValue;
        },
        set:function (value){
            console.log('set')
            //当设置值的时候触发的函数,设置的新值通过参数value拿到
            initValue = value;
        }
    });
    obj.newKey = 1;  // set 1
    obj.newKey = 1;  // get 1
```

**注意：get或set不是必须成对出现，任写其一就可以。如果不设置方法，则get和set的默认值为undefined**

# 总结

### 数据描述
> value  
> writable  

### 存取器描述
> get  
> set  

### 两者通用
> configurable  
> enumerable

# 实际运用
在一些框架，如vue、express、avalon.js

### 增加属性获取和修改时的信息
```
[
  'json',
  'urlencoded',
  'bodyParser',
  'compress',
  'cookieSession',
  'session',
  'logger',
  'cookieParser',
  'favicon',
  'responseTime',
  'errorHandler',
  'timeout',
  'methodOverride',
  'vhost',
  'csrf',
  'directory',
  'limit',
  'multipart',
  'staticCache',
].forEach(function (name) {
  Object.defineProperty(exports, name, {
    get: function () {
      throw new Error('Most middleware (like ' + name + ') is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.');
    },
    configurable: true
  });
});

```

# 兼容
Object.defineProperty是ES5的属性

