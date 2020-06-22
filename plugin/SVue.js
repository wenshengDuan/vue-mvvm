class Vue {
  constructor(options){
    console.log('constructor');
    
    // 保存配置
    this.$options = options
    // this.$vm = this
    this.$data = options.data

    this.keys = []

    // 数据劫持
    this.observe(this.$data)
    // new Watcher(this, 'title')
    
    // 数据代理
    this.proxy(this.$data, this.keys)

    // 编译模板
    new Compile(this, options.el)
    

  }

  observe(obj){
    if (!obj || typeof obj !== 'object' ) {
      return 
    }

    // currentKey && keys.push(currentKey)
    // 遍历data对象属性
    Object.keys(obj).forEach(key => {
      
      this.defineReactive(obj, key, obj[key])
    })
  }

  defineReactive(obj, key, value) {
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      get() {
        console.log(`获取属性：${key}: ${value}`);
        Dep.target && dep.add(Dep.target)
        return value
      },
      set(newVal) {
        if (newVal !== value) {
          value = newVal
          console.log(`更新了${key}属性：${newVal}`);
          dep.notify()
        }
      }
    })

    // 递归劫持数据
    this.observe(obj[key])
  }

  proxy(obj, keys) {
    if (!obj || typeof obj !== 'object') {
      return
    }

    Object.keys(obj).forEach((key,index) => {
      if (index === 0) {
        keys.push(key)
      } else {
        keys.pop()
        keys.push(key)
      } 

      this.proxyData(keys, obj[key])
    })
  }

  proxyData(keys, value) {
    console.log('keys', keys)
    let proxyObj  = this // 代理目标对象  obj为代理data对象（obj如果是嵌套，则是最近一层对象）
    let key = keys[keys.length-1]
    if (keys.length > 1 ) {
      //嵌套对象 
      keys.forEach( (key,index) => {
        if (index <= keys.length - 2)
        proxyObj = proxyObj[key]
      })
    } 

    // console.log('proxyObj:',  proxyObj);
    // console.log(obj[key])
    Object.defineProperty(proxyObj, key, {
      get() {
        // return obj[key]
        return keys.length === 1 ? this.$data[key] : value
      },
      set(newVal) {
        // let val = this
        // keys.forEach((key,index) => {
        //   if (index = keys.length-1){
        //     val[key] = newVal
        //   } else {
        //     val = val[key]
        //   }
        // })
        keys.length === 1 && typeof this.$data[key] !== 'object' ? 
        this.$data[key] = newVal 
        :
        value = newVal
      }
    })
  }
}

class Dep {
  constructor() {
    this.deps = []
  }
  add(watcher) {
    this.deps.push(watcher)
    console.log(`添加watcher`);
    
  }
  notify() {
    this.deps.forEach(dep => {
      dep.update()
    })
  }
}

class Watcher {
  constructor(vm, keys, cb) {
    Dep.target = this
    this.vm = vm
    this.keys = keys.split('.')
    this.cb = cb
    console.log('创建watchter');

    let value = this.vm
    this.keys.forEach(key => {
      value = value[key]
    })

    Dep.target  = null 
  }

  update() {
    console.log('watcher 更新');
    // let value = this.vm
    // this.keys.forEach(key => {
    //   value = value[key]
    // })
    this.cb.call(this.vm)
  }
}