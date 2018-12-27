import Validator from './Validator/Validator'
import validate from './directives/validate'
import isError from './methods/isError'
import verify from './methods/verify'
import { rules } from './Validator/Validator'

export default  class ValidatePlugin {
  constructor() {
    throw new Error('不允许实例化 ValidatePlugin')
  }
  static createValidator(ValidatePlugin, el, binding, vNode, _Vue) {
    ValidatePlugin.validators[vNode.context._uid] = new Validator(el, binding, vNode, _Vue)
  }
  static install(_Vue, options = {}) {
    if (!ValidatePlugin.validation) {
      ValidatePlugin.validation = {} // 存放所有校验实例的容器
      options.regexpMap && rules.extendRegexp(options.regexpMap)
      options.validatorMap && rules.extendValidator(options.validatorMap)
    }
    _Vue.directive('validate', validate(ValidatePlugin, _Vue))
    // 可供组件直接调用的校验方法
    _Vue.prototype.$isError = isError
    _Vue.prototype.$verify = verify
  }
}

export { rules }
