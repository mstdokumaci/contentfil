import Vue from 'vue';
import ContentEditor from 'vue2-content-editor'
import App from './App.vue';

Vue.component('content-editor', ContentEditor)

Vue.config.productionTip = false;

const app = new Vue({
  render: h => h(App)
}).$mount('#app');
