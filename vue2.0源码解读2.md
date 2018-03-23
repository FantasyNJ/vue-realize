# Vue2.0源码之数据监听

## Dep对象

每个被监听的属性都有唯一的Dep实例，被监听的属性与Dep实例是一对一的关系
Dep实例中的subs存储着该属性如果发生改变时触发哪些属性的watch回调

```javascript
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

            // watch数据
            initWatch(vm)
        }
    }
    
    function initData(vm) {
        let data = vm.$options.data;

        // 1. 区分data是object还是函数（ data(){ return{a:1} ）, 如果没有data属性则置为{}
        vm._data = typeof data === 'function' ? data.call(vm) : data || {} ;

        // 2. 遍历data中的数据并挂载到Vue实例化对象上以便直接使用this调用
        const keys = Object.keys(data);

        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            proxy(vm, key);
        }

        // 监听数据，observe的data只能为obj或arr（初始的data为obj，然后observe内部会循环遍历每一个值）
        observe(data);
    }

    // 初始化watch函数
    function initWatch(vm){
        const watch = vm.$options.watch;

        // 如果watch存在
        if(watch){
            for(const key in watch){
                const handler = watch[key];
                // ???  还能是数组？文档中没写，带之后确认。。。。。
                if (Array.isArray(handler)) {
                    for (let i = 0; i < handler.length; i++) {
                        createWatcher(vm, key, handler[i])
                    }
                } else {
                    createWatcher(vm, key, handler)
                }
            }
        }
    }

    // 创建watcher
    function createWatcher(vm, key, handler){
        let options
        // 1.如果为obj,证明结构为{handler: xxx,deep: xxx}
        if( isPlainObject(handler) ){
            options = handler
            // handler变成回调函数
            handler = handler.handler
        }
        // 2.如果handler为string，则就是为方法名，handler = vm的methods中的函数
        if (typeof handler === 'string') {
            handler = vm[handler]
        }
        // 3.handler为函数，不做处理

        // 调用$watch
        vm.$watch(key, handler, options)
    }

    // $watch函数挂载到Vue对象
    Vue.prototype.$watch = function(expOrFn, cb, options){
        const vm = this;
        // 选项
        options = options || {};

        const watcher = new Watcher(vm, expOrFn, cb, options)

    }
```

## Watcher对象

Watcher实例中存储着哪些属性（不会重复）改变时会触发该实例中的回调

```javascript
let uid = 0;

// immediate不接收
// expOrFn先不考虑为fn的情况
export default class Watcher {
    constructor(vm, expOrFn, cb, options){
        this.id = ++uid
        // 指向传入的vue实例化对象
        this.vm = vm;
        // 回调函数
        this.cb = cb;

        // 返回fn
        this.getter = parsePath(expOrFn)

        // 当前的value值
        this.value = this.get();
    }
    // 获取属性的值
    get(){
        // 关键点，Dep.target在此处设置为当前Watcher实例
        Dep.target = this;
        const value = this.getter(this.vm);
        Dep.target = null;
        this.cleanupDeps();
        return value;
    }
    update(){
        this.run()
    }
    run(){
        // 新值
        const value = this.get()
        /*
         值改变时
         */
        if(value !== this.value ){
            // 旧值
            const oldVal = this.value
            // 更新value，如果是对象原先指针已经断了
            this.value = value
            // 触发watch回调函数
            this.cb.call(this.vm, value, oldVal)
        }
    }
    // 存储与watch建立联系的dep
    addDep (dep) {
        const id = dep.id
        // newDepIds没有该属性的depId时，在newDepIds存储depId，newDeps存储dep
        if( !this.newDepIds.has(id) ){
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            // 如果depIds中不存在当前depId，dep添加当前watch,防止重复添加
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }
    // 清除newDepIds和newDeps
    cleanupDeps() {
        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            // 新增加的dep中没有当前watch中已存储的dep，则在dep中删除当前watch
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        // 清空newDepIds newDeps
        // newDepIds 赋给 depIds， newDeps 赋给 deps。这些值是数组，不能直接赋值并清除
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }
}
```