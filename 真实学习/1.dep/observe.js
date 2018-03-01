import { isObject } from './common'

class Observe {
    constructor(value){
        // 当前遍历的obj或arr
        this.value = value;
        this._vmCount = 0;

        // ?????
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

function observe(val) {
    // 如果不是obj或arr不执行
    if( isObject(val) ){
        return
    }

    // 开始观察数据
    let ob = new Observe(val);

    return ob;
}

//
function defineReactive() {

}

export default observe;