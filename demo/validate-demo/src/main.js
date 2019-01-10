import Vue from 'vue'
// import validator, { rules }  from './plugins'
import validator, { rules } from '@ignorance/vue-validator'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(validator)
rules.extendRegexp({
  onlyNumber: /^\d+$/
})

new Vue({
  render: h => h(App),
}).$mount('#app')
