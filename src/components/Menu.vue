<template>
  <div>
    <nav class="nav-extended" v-if="navigationVisible">
      <div class="nav-wrapper brown lighten-4">
        <router-link to="/" class="brand-logo">
          <img src="/assets/media/logo.png">
        </router-link>
        <ul class="right">
          <template v-if="authenticated">
            <li :class="{active: $route.path.startsWith('/me')}">
              <router-link to="/me" title="My Profile">
                <i class="material-icons">person</i>
              </router-link>
            </li>
            <li>
              <a class="btn waves-effect brown lighten-3" title="Logout" @click="logout">
                <i class="material-icons">exit_to_app</i>
              </a>
            </li>
          </template>
          <template v-else>
            <li :class="{active: $route.path === '/login'}">
              <router-link to="/login">Login</router-link>
            </li>
            <li :class="{active: $route.path === '/signup'}">
              <router-link to="/signup">Sign up</router-link>
            </li>
          </template>
        </ul>
      </div>
      <div v-if="$route.path.startsWith('/me')" class="nav-content brown lighten-5">
        <ul class="tabs tabs-transparent">
          <li class="tab">
            <router-link to="/me" :class="{active: $route.path === '/me'}">Profile
            </router-link>
          </li>
          <li class="tab">
            <router-link to="/me/draft" :class="{active: $route.path.startsWith('/me/draft')}">Drafts</router-link>
          </li>
          <li class="tab">
            <router-link to="/me/published" :class="{active: $route.path === '/me/published'}">Published</router-link>
          </li>
          <li>
            <button class="btn waves-effect brown lighten-3" title="New Story" @click="newStory">
              <i class="material-icons">note_add</i>
            </button>
          </li>
          <li class="right" v-if="$route.path.startsWith('/me/draft/') && navigationVisible === true">
            <button class="btn waves-effect brown lighten-3" title="Hide navigation" @click="navigationVisible = false">
              <i class="material-icons">expand_less</i>
            </button>
          </li>
        </ul>
      </div>
    </nav>
    <div class="fixed-action-btn" v-if="navigationVisible === false">
      <button class="btn-floating btn-large waves-effect brown lighten-3" title="Show navigation"
        @click="navigationVisible = true">
        <i class="material-icons">expand_more</i>
      </button>
    </div>
  </div>
</template>

<script>
  let tabInstance

  export default {
    data() {
      return {
        navigationVisible: true
      }
    },
    props: ['user', 'anonymousId'],
    updated() {
      const el = document.getElementsByClassName('tabs')[0]
      if (el) {
        if (!tabInstance) {
          tabInstance = M.Tabs.init(el)
        } else if (tabInstance.el !== el) {
          tabInstance.destroy()
          tabInstance = M.Tabs.init(el)
        }
      }
    },
    computed: {
      authenticated() {
        return ['real', 'unconfirmed'].includes(this.user.type)
      }
    },
    methods: {
      logout() {
        this.$client.switchBranch(JSON.stringify({
          type: 'anonymous',
          id: this.anonymousId
        }))
        window.localStorage.removeItem('user')
      },
      newStory() {
        this.$client.get('draft').emit('create')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .brand-logo {
    margin-left: 1rem;
  }

  .brand-logo>img {
    height: 38px;
    margin: 13px 0;
  }

  .tabs {
    .tab a {
      color: #998;
    }

    .tab a:hover,
    .tab a.active {
      color: #776;
    }

    .btn {
      margin: 5px 15px;
    }

    .btn i {
      height: 0;
      line-height: 0;
    }
  }

  .fixed-action-btn {
    top: 45px;
  }
</style>
<style>
  .tabs.tabs-transparent .indicator {
    background-color: #89a;
  }
</style>