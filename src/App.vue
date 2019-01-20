<template>
  <router-view></router-view>
</template>

<script>
import VueRouter from 'vue-router'
import Editor from './components/Editor.vue';

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Editor }
  ]
})

export default {
  name: 'app',
  router
}
</script>
