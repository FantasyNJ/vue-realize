# 任务描述

这是“动态数据绑定”的第四题。有了前面的充分准备，相信你能搞定这一题。`请实现如下的这样一个 Vue，传入参数是一个 Selector 和一个数据对象，程序需要将 HTML 模板片段渲染成正确的模样。 `
首次渲染的静态数据绑定与数据变动渲染的动态数据绑定。

```javascript
let app = new Vue({
  el: '#app',
  data: {
    user: {
      name: 'youngwind',
      age: 25
    }
  }
});
```

```html
<!-- 页面中原本的 html 模板片段 -->
<div id="app">
    <p>姓名：{{user.name}}</p>
    <p>年龄：{{user.age}}</p>
</div>

<!-- 最终在页面中渲染出来的结果 -->
<div id="app">
    <p>姓名：youngwind</p>
    <p>年龄：25</p>
</div>
```

# 实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <p>
        在上面的基础上，我们再多考虑一个问题："深层次数据变化如何逐层往上传播"
    </p>

    <div id="app">
        <p>姓名：{{ name }}</p>
        <p>年龄：{{ age }}</p>
        <p>xixi: {{ list.dist.xixi }}</p>
    </div>

    <script>
        function Observer(obj){
            this.data = obj.data;
            this.walk(this.data);
            this.event = {};
            this.elem = obj.el;
            this.$el = document.querySelector(this.elem);
            // 克隆数据节点，防止渲染之后节点中没有绑定的data信息
            this.templateClone = this.$el.cloneNode(true);
            // 渲染数据
            this.renderData();
        }

        var pt = Observer.prototype;

        // 渲染数据
        pt.renderData = function(){
            var template = this.templateClone.cloneNode(true);
            // var fragment = document.createDocumentFragment();

            // 替换数据
            var fragment = this.walkDom( template );

            this.$el.parentNode.replaceChild( fragment, this.$el );
            this.$el = document.querySelector(this.elem);
        }

        pt.walkDom = function(template){
            var t = this;
            var childNodes = template.childNodes;
            var fragment = document.createDocumentFragment();

            var i = 0;
            while( childNodes.length > 0 ){
            console.log(childNodes.length, 'length')
            // for( var i = 0; i < childNodes.length; i++ ){  // 删除元素了
                var dom = childNodes[i];

                // 元素类型，继续循环
                if(dom.nodeType === 1){
                    dom = t.walkDom(dom);
                }
                // 文本类型，寻找有无绑定数据，并进行替换
                else if(dom.nodeType === 3){
                    var val = dom.nodeValue;

                    dom.nodeValue = val.replace(/{{(.*)}}/g, function($0, $1){
                        var attrs = $1.trim().split('.');
                        var data = t.data;

                        for(var j = 0; j < attrs.length; j++){
                            data = data[attrs[j]];
                            console.log(data, 'data');
                        }

                        return data;
                    })
                }

                fragment.appendChild(dom);
            }

            template.innerHTML = '';
            template.appendChild(fragment);

            return template;

        }

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

                        value = newVal;

                        t.renderData();
                    }
                }
            })
        }

        pt.$watch = function (attr, fn) {
            this.$on( attr, fn )
        }

        let app1 = new Observer(
            {
                el: '#app',
                data: {
                    name: 'youngwind',
                    age: 25,
                    list: {
                        haha: 'oh',
                        lala: 'ff',
                        dist: {
                            xixi: 123456
                        }
                    }
                }
            }
        );

        app1.$watch('list', function(age) {
            console.log(`list变了`)
        });

        app1.$watch('list.haha', function(age) {
            console.log(`list.haha变了,值为${age}`);
        });
    </script>
</body>
</html>
```