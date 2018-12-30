import Vue from 'vue';
import ContentEditor from 'vue2-content-editor'
import App from './App.vue';
import client from './client'

Vue.component('content-editor', ContentEditor)

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
