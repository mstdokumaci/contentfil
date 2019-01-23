<template>
  <router-view></router-view>
</template>

<script>
import VueRouter from 'vue-router'
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import Profile from './components/Profile.vue';
import Editor from './components/Editor.vue';

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/me', component: Profile },
    { path: '/editor', component: Editor },
  ]
})

export default {
  name: 'app',
  router
}
</script>
