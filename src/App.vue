<template>
  <router-view :user="user" :anonymous-id="anonymousId"></router-view>
</template>

<script>
import VueRouter from 'vue-router'
import client from './client'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import Profile from './components/Profile.vue'
import Editor from './components/Editor.vue'
import Story from './components/Story.vue'

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/me', component: Profile },
    {
      path: '/draft/:id',
      component: Editor,
      props: true
    },
    {
      path: '/story/:id',
      component: Story,
      props: true
    }
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

let subscription

export default {
  data() {
    return {
      anonymousId: 0,
      user: {},
      timeout: null
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
          this.timeout = setTimeout(() => {
            this.$client.switchBranch(JSON.stringify({
              type: 'anonymous',
              id: this.anonymousId
            }))
          }, 1000)
        } else {
          this.$client.switchBranch(JSON.stringify({
            type: 'anonymous',
            id: this.anonymousId
          }))
        }
      }
    })

    subscription = this.$client.get('user', { type: 'none' }).subscribe(user => {
      if (user.get('type').compute() !== 'none') {
        user = user.serialize()
        this.user = user
        if (user.tokenExpiresAt) {
          if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
          }
          window.localStorage.setItem('user', JSON.stringify({
            email: user.email,
            token: user.token,
            tokenExpiresAt: user.tokenExpiresAt
          }))
        }
      }
    })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe(),
  router
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-touch-callout: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility
}

:focus {
    outline: none
}

:after, :before {
    -webkit-box-sizing: border-box;
    box-sizing: border-box
}

html {
    font-family: -apple-system, BlinkMacSystemFont, San Francisco, Roboto, Segoe UI, Helvetica Neue, sans-serif;
    font-size: 18px;
    color: #000;
    line-height: 1.5
}

body {
    margin: 2rem;
}

a {
    color: inherit
}
</style>