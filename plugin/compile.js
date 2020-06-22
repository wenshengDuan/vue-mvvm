class Compile {
  constructor(vm, el) {
    console.log('compile')
    this.$vm = vm
    this.$el = document.querySelector(el)

    // 创建文档片段
    this.$fragment = this.node2fragment(this.$el)

    // 编译文档片段
    this.compileFragment(this.$fragment)

    // 挂载文档片段
    this.$el.appendChild(this.$fragment)
  }

  node2fragment(el) {
    // 创建片段
    const fragment = document.createDocumentFragment()

    let child

    while((child = el.firstChild)) {
      fragment.appendChild(child)
    }
    
    return fragment
  }

  compileFragment(el) {
    let nodes = el.childNodes
    console.log(nodes)
    Array.from(nodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        console.log('编译元素');
        this.compileElement(node)
      } else if (this.isInter(node)) {
        console.log('编译插值表达式');
        this.compileText(node)
      }

      // console.log(node.hasCildNodes)
      if (node.hasChildNodes()) {
        this.compileFragment(node)
      }
    })
    
  }

  isInter(node) {
    return node.nodeType === Node.TEXT_NODE && /\{\{(.*)\}\}/.test(node.textContent) 
  }

  compileText(node) {
    const exp = RegExp.$1
    this.update(node, exp, 'text') // v-text

    // let value = this.$vm;
    // // console.log(props);
    // props.forEach(key => {
    //   value = value[key]
    // })
    // node.textContent = value
    // new Watcher(this.$vm, props, value => {
    //   node.textContent = value
    // })

  }
  
  update(node, exp, dir) {
    const updator = this[dir+'Updator'] 
    updator && updator.call(this, node, exp) // 初始化
    // 注册watcher
    new Watcher(this.$vm, exp, ()=>{
      updator && updator(node, exp)
    })
  }

  textUpdator(node, exp) {
    // console.log(this)
    const keys = exp.split('.')
    let value = this.$vm
    keys.forEach(key => {
      value = value[key]
    })
    node.textContent = value
  }

  // 编译元素 
  compileElement(node) {
    // 关心元素
    console.log('compileElement', node)
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name 
      const attrValue = attr.value

      if (attrName.startsWith('s-')) {
        const dir = attrName.substring(2)
        console.log('dir', dir, attrValue)
        this.update(node, attrValue, dir)
      }
    })
  }
}