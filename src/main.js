import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App'
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

Object.defineProperty(
  Vue.prototype,
  '$formatDate',
  {
    value: timestamp => (new Date(timestamp)).toISOString().slice(0, 16).replace(/T/, ' '),
    configurable: true
  }
)

const app = new Vue({
  render: h => h(App)
})
app.$mount('#app')
