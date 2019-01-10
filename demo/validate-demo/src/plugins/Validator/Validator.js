import CommonValidator, {
  rules as defaultRules,
  verifySingle,
  createValidator
} from '@ignorance/validator'
import { partial } from '../utils/functional'

export default class Validator {
  constructor(el, { arg, value, value: { fields, rules, trigger = 'blur' }, modifiers }, { context }, _Vue) {
    this.vm = context
    this._Vue = _Vue
    this.ref = context.$refs[value.ref]
    this.ref.validator = this.checkAll.bind(this) // 让 vue 组件本身可以校验所有数据
    this.formData = context[value.formData]
    this.fields = fields
    this.rules = rules
    this.trigger = trigger
    this.autoCatch = !!modifiers.autoCatch
    this.submitMethod = this.vm[arg]
    this.listeners = [] // 所有绑定事件的监听者
    this.commonValidator = new CommonValidator(this.formData, this.rules, false)
    this.createReactiveData()
    this.initEachEvent(el)
  }

  /* 初始化响应式对象 */
  createReactiveData() {
    // const data = this.fields.reduce((res, key) => ({ ...res, [key]: { valid: true, msg: '' } }), {})
    const data = this.commonValidator.initVRes()
    this._Vue.util.defineReactive(this.vm._data, '$vec', data)
  }

  get $vec() {
    return this.vm._data.$vec
  }

  createValidateData(res, name, target) {
    // 由不通过变成通过，需要判断是否是同一条规则导致的，否则不予修改
    if (!res.valid && target.valid && res.validator !== target.validator) return
    Object.assign(res, target)
    this.vm.$set(this.$vec, name, res)
  }

  /**
   * 检验某个字段的校验是否通过
   * @param val
   * @param rules
   * @param name
   * @returns {*}
   */
  verifySingle(val, rules, name) {
    const res = { ...this.$vec[name], ...verifySingle(name, val, rules), dirty: true } // 整体校验时，全部变脏
    this.vm.$set(this.$vec, name, res)
    return res
  }

  verifyRule(val, rule, name) {
    let res = { ...this.$vec[name], dirty: true }
    // 创建偏函数，接收部分参数
    const saveRes = partial(this.createValidateData.bind(this), res, name)
    // 第一个条件用来排除 值为空，并且非必填 的情况（该情况无需校验其他规则）
    if (!(val === '' && !this.ref[name].required) && !createValidator(rule.validator)(val)) {
      saveRes({ valid: false, msg: rule.msg || '默认校验不通过消息', validator: rule.validator })
      return res
    }
    saveRes({ valid: true, msg: '', validator: rule.validator })
    return res
  }

  /**
   * 提交的时候校验所有表单
   * @returns {{valid: boolean}}
   */
  checkAll() {
    let res = {
      valid: true
    }
    this.fields.forEach(item => {
      const checkOne = this.verifySingle(this.formData[item], this.rules[item], item)
      if (!checkOne.valid && res.valid) {
        res = { ...checkOne, name: item }
      }
    })
    this.vm.$forceUpdate()
    return res
  }

  focusListener = ({ target: { nodeName, name } }) => {
    if (nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA') {
      this.$vec[name] && this.vm.$set(this.$vec, name, { valid: true, msg: '' })
    }
  }

  submitListener = e => {
    e.preventDefault()
    if (this.autoCatch) {
      const { valid } = this.checkAll()
      if (valid) {
        this.submitMethod()
      }
    } else {
      this.submitMethod()
    }
  }

  bindEvent(domName, rules) {
    const cloneRules = [ ...rules ]
    // 将是否必填的信息保存起来
    this.ref[domName].required = cloneRules.some(rule => rule.validator === 'required')
    cloneRules.reverse().forEach(rule => {
      const listener = ({ target }) => {
        this.verifyRule(target.value, rule, domName)
        this.vm.$forceUpdate()
      }
      const trigger = rule.trigger || this.trigger
      this.ref[domName].addEventListener(trigger, listener)
      // 将解绑事件，添加到解绑列表中
      this.listeners.push(() => {
        this.ref[domName].removeEventListener(trigger, listener)
      })
    })
  }

  initEachEvent(el) {
    Object.keys(this.rules).forEach(item => {
      this.bindEvent(item, this.rules[item])
    })
    // 当鼠标聚焦时，这个表单元素需要正常
    this.ref.addEventListener('click', this.focusListener)
    // 绑定提交事件
    el.addEventListener('click', this.submitListener)
  }

  unbindEvent(el) {
    this.ref.removeEventListener('click', this.focusListener)
    el.removeEventListener('click', this.submitListener)
    this.listeners.forEach(fn => fn())
  }
}

export const rules = defaultRules
