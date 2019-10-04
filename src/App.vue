<template>
  <div class="container">
    <navigation-menu :user="user" :anonymous-id="anonymousId" />
    <router-view :user="user"></router-view>
  </div>
</template>

<script>
  import VueRouter from 'vue-router'
  import client from './client'
  import Menu from './components/Menu'
  import Home from './components/Home'
  import Login from './components/Login'
  import Signup from './components/Signup'
  import Profile from './components/Profile'
  import ProfileIndex from './components/profile/Index'
  import Draft from './components/profile/Draft'
  import Editor from './components/profile/Editor'
  import Published from './components/profile/Published'
  import Story from './components/Story'

  const router = new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: Home },
      { path: '/login', component: Login },
      { path: '/signup', component: Signup },
      {
        path: '/me',
        component: Profile,
        children: [
          {
            path: '',
            component: ProfileIndex
          },
          {
            path: 'draft',
            component: Draft
          },
          {
            path: 'draft/:id',
            component: Editor,
            props: true
          },
          {
            path: 'published',
            component: Published
          }
        ]
      },
      {
        path: '/story/:id',
        component: Story,
        props: true
      }
    ]
  })

  const route = client.get('route', '')

  let offlineRoute

  route.subscribe(to => {
    to = to.compute()
    if (to !== '' && router.currentRoute.path !== to) {
      router.push(to)
    }
  })

  router.beforeEach((to, _, next) => {
    let type = client.get(['user', 'type'])
    if (!type) {
      offlineRoute = to.path
      return next()
    }

    type = type.compute()

    if (type === 'real' && ['/login', '/signup'].includes(to.path)) {
      return next('/me')
    } else if (type !== 'real' && ['/me'].includes(to.path)) {
      return next('/login')
    }

    route.set(to.path)
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
    components: {
      navigationMenu: Menu
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
            if (this.$client.get(['user', 'type']).compute() !== 'real') {
              this.timeout = setTimeout(() => {
                this.$client.switchBranch(JSON.stringify({
                  type: 'anonymous',
                  id: this.anonymousId
                }))
              }, 1000)
            }
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
          const author = user.get(['author'])
          user = user.serialize()
          if (author) {
            user.name = author.get('name').compute()
          }
          if (offlineRoute) {
            route.set(offlineRoute)
            offlineRoute = null
          }
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

<style lang="scss">
  .editor__content {
    max-width: 40rem;
    margin: 2rem auto;

    * {
      font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
      color: #000;
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

    :after,
    :before {
      -webkit-box-sizing: border-box;
      box-sizing: border-box
    }

    a {
      color: inherit
    }

    blockquote,
    h1,
    h2,
    h3,
    ol,
    p,
    pre,
    ul {
      margin: 1rem 0
    }

    blockquote:first-child,
    h1:first-child,
    h2:first-child,
    h3:first-child,
    ol:first-child,
    p:first-child,
    pre:first-child,
    ul:first-child {
      margin-top: 0
    }

    blockquote:last-child,
    h1:last-child,
    h2:last-child,
    h3:last-child,
    ol:last-child,
    p:last-child,
    pre:last-child,
    ul:last-child {
      margin-bottom: 0
    }

    h1,
    h2,
    h3 {
      opacity: 0.75;
      line-height: 1.3
    }

    h1 {
      font-size: 3.5rem;
    }

    h2 {
      opacity: 0.8;
      font-size: 2.8rem;
    }

    h3 {
      opacity: 0.85;
      font-size: 2rem;
    }

    p {
      font-size: 1.5rem;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: #000;
      color: #fff;
      font-size: 0.8rem;
      overflow-x: auto;
    }

    pre code {
      display: block;
    }

    p code {
      display: inline-block;
      padding: 0 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 700;
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.8);
    }

    ol,
    ul {
      padding-left: 1rem;
    }

    li>ol,
    li>p,
    li>ul {
      margin: 0;
    }

    a {
      color: inherit;
    }

    blockquote {
      border-left: 3px solid rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.8);
      padding-left: 0.8rem;
      font-style: italic;
    }

    blockquote p {
      margin: 0;
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;
    }

    table td,
    table th {
      min-width: 1em;
      border: 2px solid #ddd;
      padding: 3px 5px;
      vertical-align: top;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      position: relative;
    }

    table td>*,
    table th>* {
      margin-bottom: 0;
    }

    table th {
      font-weight: 700;
      text-align: left;
    }

    table .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    table .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: #adf;
      pointer-events: none;
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }

    p.is-empty:first-child::before {
      content: attr(data-empty-text);
      float: left;
      color: #aaa;
      pointer-events: none;
      height: 0;
      font-style: italic;
    }
  }

  .fixed-action-btn {
    position: fixed;
    right: auto;
    bottom: auto;
    left: 50%;
    top: 110px;
    padding-left: 30%;
  }
</style>