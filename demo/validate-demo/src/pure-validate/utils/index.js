import defaultRules from '../Rules/Rules'

export const throttle = (fn, delay = 300) => () => {
  fn.timer && clearTimeout(fn.timer)
  fn.timer = setTimeout(() => {
    fn()
  }, delay)
}

export const defineReactive = (obj, key, listener) => {
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) return

  let val = obj[key]

  const getter = property && property.get
  const setter = property && property.set

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      return getter ? getter.call(obj) : val
    },
    set(newVal) {
      const value = getter ? getter.call(obj) : val
      // 值没有变，或者新旧值都为 NaN 的时候，什么都不做
      if (newVal === value || (newVal !== newVal && value !== value)) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 值变动后，自动调用监听者
      typeof listener === 'function' && listener()
      Array.isArray(listener) && listener.forEach(fn => fn)
    }
  })
}

/**
 * 将形如："min:5""max:8""min:5 max:8" 的字符串解析成校验字符串长度的校验函数
 * @param rule: string
 * @returns {function({length: number}): boolean}
 */
export const createLengthValidate = rule => {
  const reg = /^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/
  const [ , , p2, p3, p4, p5, p6 ] = rule.match(reg)
  let min, max
  p2 === 'in' ? min = p3 : max = p3
  if (p4 && p2 !== p5) {
    p5 === 'ax' ? max = p6 : min = p6
  }
  if ((min && max) && (~~min > ~~max)) throw new Error('最小长度不能大于最大长度')
  return ({length}) => !((min && ~~min > length) || (max && ~~max < length))
}

/**
 * 验证 validator 的值类型，将其统一包装成函数
 * @param validator
 * @returns Function
 */
export const createValidator = validator => {
  if (typeof validator === 'string') {
    if (defaultRules.rules[validator]) {
      return defaultRules.rules[validator]
    } else if (validator === 'required') {
      return val => !!val
    } else if (/^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/.test(validator)) {
      return createLengthValidate(validator)
    } else {
      throw new Error(`您还未定义 ${validator} 这条规则`)
    }
  } else if (validator instanceof RegExp) {
    return val => validator.test(val)
  } else if (typeof validator === 'function') {
    return validator
  } else {
    throw new Error('validator 的值只能为函数或正则表达式')
  }
}

export const verifySingle = (name, value, rules) => {
  Array.isArray(rules) ? rules = [ ...rules ] : [ rules ]
  const required = rules.some(rule => rule.validator === 'required')
  for (let i = 0; i < rules.length; i++) {
    const { msg, validator } = rules[i]
    if (value === '' && !required) {
      return { name, valid: true, msg: '', validator }
    } else if (!createValidator(validator)(value)) {
      return { name, valid: false, msg: msg || '默认校验不通过消息', validator }
    }
  }
  return { name, valid: true, msg: '' }
}

export const verifyAll = (data, ruleConfig) => {
  return Object.keys(ruleConfig).reduce((res, name) => (res[name] = verifySingle(name, data[name], ruleConfig[name])) && res, {})
}