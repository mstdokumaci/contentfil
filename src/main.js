import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App.vue'
import client from './client'

Vue.config.productionTip = false
Vue.use(VueRouter)

Object.defineProperty(
  Vue.prototype,
  '$client',
  {
    value: client,
    configurable: true
  }
)

const app = new Vue({
  render: h => h(App)
})
app.$mount('#app')
