<template>
  <router-view :user="user" :anonymous-id="anonymousId"></router-view>
</template>

<script>
import VueRouter from 'vue-router'
import client from './client'
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

const route = client.get('route', '')

route.subscribe(to => {
  to = to.compute()
  if (to !== '') {
    router.push(to)
  }
})

router.beforeEach((to, _, next) => {
  route.set(to.fullPath)
  next()
})

export default {
  name: 'app',
  data() {
    return {
      anonymousId: 0,
      user: {}
    }
  },
  created() {
    const anonymousId = window.localStorage.getItem('anonymousId')
    if (anonymousId) {
      this.anonymousId = anonymousId
    } else {
      this.anonymousId = Math.round(Math.random() * 9999999999)
      window.localStorage.setItem('anonymousId', this.anonymousId)
    }

    let user = window.localStorage.getItem('user')
    if (user) {
      user = JSON.parse(user)
      if (user.tokenExpiresAt && user.tokenExpiresAt > Date.now() + 30 * 1000) {
        this.user = user
      }
    }

    this.$client.on('connected', isConnected => {
      if (isConnected) {
        if (this.user.email && this.user.token) {
          this.$client.switchBranch(JSON.stringify({
            type: 'token',
            email: this.user.email,
            token: this.user.token
          }))
        } else {
          this.$client.switchBranch(JSON.stringify({
            type: 'anonymous',
            id: this.anonymousId
          }))
        }
      }
    })

    this.$client.get('user', { type: 'none' }).subscribe(user => {
      if (user.get('type').compute() !== 'none') {
        user = user.serialize()
        this.user = user
        if (user.tokenExpiresAt) {
          window.localStorage.setItem('user', JSON.stringify({
            email: user.email,
            token: user.token,
            tokenExpiresAt: user.tokenExpiresAt
          }))
        }
      }
    })
  },
  router
}
</script>
