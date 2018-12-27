export default (ValidatePlugin, _Vue) => ({
  inserted(el, binding, vNode) {
    ValidatePlugin.validators instanceof Array || (ValidatePlugin.validators = [])
    ValidatePlugin.createValidator(ValidatePlugin, el, binding, vNode, _Vue)
    vNode.context.isFormComponent = true
  },
  unbind(el, binding, { context }) {
    // 解绑事件
    ValidatePlugin.validators[context._uid].unbindEvent(el)
    // 通过组件的 id 来区分不同的表单
    ValidatePlugin.validators[context._uid] = null
  }
})
