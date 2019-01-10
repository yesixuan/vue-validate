import {
  throttle,
  defineReactive,
  verifySingle,
  verifyAll
} from '../utils'

export default class Vily {
  constructor(data, ruleConfig, reactive = true) {
    this.data = data
    this.ruleConfig = ruleConfig
    this.vRes = {} // 校验结果集中营
    this.initVRes()
    reactive && this.initReactive()
  }

  /**
   * 初始化校验结果
   */
  initVRes() {
    this.vRes = Object.keys(this.ruleConfig).reduce((result, key) => ({
      ...result,
      [key]: {
      name: key,
      dirty: false,
      valid: true,
      msg: '',
      validator: ''
    }}), {})
    return this.vRes
  }

  initReactive() {
    for (let key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        defineReactive(this.data, key, throttle(() => {
          const prevRes = this.vRes[key]
          let dirty = true
          // 当之前结果不脏，并且此时的值为空时，才变脏
          if (!prevRes.dirty && !this.data[key]) {
            dirty = false
          }
          const verifyResult = verifySingle(key, this.data[key], this.ruleConfig[key])
          this.vRes[key] = { ...prevRes, ...verifyResult, dirty }
        }))
      }
    }
  }

  verify(name) {
    // 没有传入要校验的字段则校验整个表单
    if (!name) return this.verifyAll()
    const target = this.vRes[name]
    if (!target) return null
    return target
  }

  isError(name) {
    const verifyResult = this.verify(name)
    // 如果值没有脏，直接返回校验通过
    if (!(verifyResult || {}).dirty) return true
    return verifyResult.valid
  }

  verifyAll() {
    const res = verifyAll(this.data, this.ruleConfig)
    for (let key in res) {
      if (res.hasOwnProperty(key)) {
        if (!res[key].valid) {
          return res[key]
        }
      }
    }
    return { valid: true, msg: '' }
  }
}

