import Vue from 'vue';
import App from './App.vue';
import client from './client'

Vue.config.productionTip = false;

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
}).$mount('#app');
