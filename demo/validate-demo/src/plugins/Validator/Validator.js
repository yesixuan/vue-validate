import defaultRules from '../Rules/Rules' // 默认名改成具名导出
import { partial } from "../utils/functional"

export default class Validator {
  constructor(el, { arg, value, value: { fields, rules }, modifiers }, { context }, _Vue) {
    this.vm = context
    this._Vue = _Vue
    // this.inputValue = value
    this.ref = context.$refs[value.ref]
    this.ref.validator = this.checkAll.bind(this) // 让 vue 组件本身可以校验所有数据
    this.formData = context[value.formData]
    this.fields = fields
    this.rules = rules
    // this.validateData = {} // 存放校验信息的对象
    this.autoCatch = !!modifiers.autoCatch
    this.submitMethod = this.vm[arg]
    this.prevTarget = null
    this.listeners = [] // 所有绑定事件的监听者
    this.createReactiveData()
    // this.initEvent(el)
    this.initEachEvent(el)
  }

  /* 初始化响应式对象 */
  createReactiveData() {
    const data = this.fields.reduce((res, key) => ({ ...res, [key]: { pass: true } }), {})
    this._Vue.util.defineReactive(this.vm._data, '$vec', data)
  }

  get $vec() {
    return this.vm._data.$vec
  }

  /**
   * 将形如："min:5""max:8""min:5 max:8" 的字符串解析成校验字符串长度的校验函数
   * @param rule: string
   * @returns {function({length: number}): boolean}
   */
  createLengthValidate(rule) {
    const reg = /^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/
    const [ , , p2, p3, p4, p5, p6 ] = rule.match(reg)
    let min, max
    p2 === 'in' ? min = p3 : max = p3
    if (p4 && p2 !== p5) {
      p5 === 'ax' ? max = p6 : min = p6
    }
    if ((min && max) && (~~min > ~~max)) throw '最小长度不能大于最大长度'
    return ({length}) => !((min && ~~min > length) || (max && ~~max < length))
  }

  /**
   * 验证 validator 的值类型，将其统一包装成函数
   * @param validator
   * @returns Function
   */
  createValidator(validator) {
    if (typeof validator === 'string') {
      if (defaultRules.rules[validator]) {
        return defaultRules.rules[validator]
      } else if (validator === 'required') {
        return val => !!val
      } else if (/^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/.test(validator)) {
        return this.createLengthValidate(validator)
      } else {
        throw `您还未定义 ${validator} 这条规则`
      }
    } else if (validator instanceof RegExp) {
      return val => validator.test(val)
    } else if (typeof validator === 'function') {
      return validator
    } else {
      throw 'validator 的值只能为函数或正则表达式'
    }
  }

  createValidateData(res, name, target) {
    if (!res.pass && target.pass && res.validator !== target.validator) return
    Object.assign(res, target)
    this.vm.$set(this.$vec, name, target)
  }

  /**
   * 检验某个字段的校验是否通过
   * @param val
   * @param rules
   * @param name
   * @returns {*}
   */
  verifySingle(val, rules, name) {
    let res = {}
    const required = rules.some(rule => rule.validator === 'required')
    // 创建偏函数，接收部分参数
    const saveRes = partial(this.createValidateData.bind(this), res, name)
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i]
      if (val === '' && !required) {
        saveRes({ pass: true, msg: '' })
        return res
      }
      if (required && val === '') {
        saveRes({ pass: false, msg: '必填' })
        return res
      }
      if (val !== '' && rule.validator !== 'required' && !this.createValidator(rule.validator)(val)) {
        saveRes({ pass: false, msg: rule.msg || '默认校验不通过消息' })
        return res
      }
    }
    saveRes({ pass: true, msg: '' })
    return res
  }

  verifySingle2(val, rule, name) {
    let res = this.$vec[name]
    // 创建偏函数，接收部分参数
    const saveRes = partial(this.createValidateData.bind(this), res, name)
    // 第一个条件用来排除 值为空，并且非必填 的情况（该情况无需校验其他规则）
    if (!(val === '' && !this.ref[name].required) && !this.createValidator(rule.validator)(val)) {
      saveRes({ pass: false, msg: rule.msg || '默认校验不通过消息', validator: rule.validator })
      return res
    }
    saveRes({ pass: true, msg: '', validator: rule.validator })
    return res
  }

  /**
   * 提交的时候校验所有表单
   * @returns {{pass: boolean}}
   */
  checkAll() {
    let res = {
      pass: true
    }
    this.fields.forEach(item => {
      const checkOne = this.verifySingle(this.formData[item], this.rules[item], item)
      if (!checkOne.pass && res.pass) {
        res = { ...checkOne, name: item }
      }
    })
    this.vm.$forceUpdate()
    return res
  }

  /**
   * 这样定义方法才能保证该方法被添作事件监听者的时候 this 的指向符合预期
   * @param e
   */
  // changeListener = ({ target: { value, name } }) => {
  //   this.verifySingle(value, this.rules[name], name)
  // }

  focusListener = ({ target: { nodeName, name } }) => {
    if (nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA') {
      this.$vec[name] && this.vm.$set(this.$vec, name, { pass: true })
      // this.prevTarget = target
    }
  }

  // blurListener = e => {
  //   if (e.target !== this.prevTarget && this.prevTarget !== null) {
  //     this.verifySingle(this.prevTarget.value, this.rules[this.prevTarget.name], this.prevTarget.name)
  //     this.vm.$forceUpdate()
  //   }
  // }

  submitListener = e => {
    e.preventDefault()
    if (this.autoCatch) {
      const { pass } = this.checkAll()
      if (pass) {
        this.submitMethod()
      }
    } else {
      this.submitMethod()
    }
  }

  // initEvent(el) {
  //   this.ref.addEventListener('change', this.changeListener)
  //   // 当鼠标聚焦时，这个表单元素需要正常
  //   this.ref.addEventListener('click', this.focusListener, true)
  //   // 模拟 blur 事件
  //   window.addEventListener('click', this.blurListener, true)
  //   // 绑定提交事件
  //   el.addEventListener('click', this.submitListener)
  // }

  bindEvent(domName, rules) {
    const cloneRules = [ ...rules ]
    // 将是否必填的信息保存起来
    this.ref[domName].required = cloneRules.some(rule => rule.validator === 'required')
    cloneRules.reverse().forEach(rule => {
      const listener = ({ target }) => {
        this.verifySingle2(target.value, rule, domName)
        this.vm.$forceUpdate()
      }
      this.ref[domName].addEventListener(rule.trigger || 'blur', listener)
      // 将解绑事件，添加到解绑列表中
      this.listeners.push(() => {
        this.ref[domName].removeEventListener(rule.trigger || 'blur', listener)
      })
    })
  }

  initEachEvent(el) {
    Object.keys(this.rules).forEach(item => {
      this.bindEvent(item, this.rules[item])
    })
    // 当鼠标聚焦时，这个表单元素需要正常
    this.ref.addEventListener('click', this.focusListener, true)
    // 绑定提交事件
    el.addEventListener('click', this.submitListener)
  }

  unbindEvent(el) {
    // this.ref.removeEventListener('change', this.changeListener)
    this.ref.removeEventListener('click', this.focusListener, true)
    el.removeEventListener('click', this.submitListener)
    // window.removeEventListener('click', this.blurListener, true)
    this.listeners.forEach(fn => fn())
  }
}

export const rules = defaultRules