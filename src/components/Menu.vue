<template>
  <nav class="nav-extended">
    <div class="nav-wrapper blue-grey lighten-1">
      <router-link to="/" class="brand-logo">Foraa</router-link>
      <ul class="right">
        <template v-if="authenticated">
          <li :class="{active: $route.path.startsWith('/me')}">
            <router-link to="/me">
              <i class="material-icons">person</i>
            </router-link>
          </li>
          <li>
            <a class="btn waves-effect" @click="logout">
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
    <div v-if="$route.path.startsWith('/me')" class="nav-content blue-grey lighten-2">
      <ul class="tabs tabs-transparent">
        <li class="tab">
          <router-link to="/me" :class="{active: $route.path === '/me'}">Profile</router-link>
        </li>
        <li class="tab">
          <router-link to="/me/draft" :class="{active: $route.path === '/me/draft'}">Drafts</router-link>
        </li>
        <li class="tab">
          <router-link to="/me/published" :class="{active: $route.path === '/me/published'}">Published</router-link>
        </li>
        <li>
          <button class="btn waves-effect" @click="newStory">
            <i class="material-icons">note_add</i>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
  export default {
    props: ['user', 'anonymousId'],
    computed: {
      authenticated() {
        return this.user.type === 'real'
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
    },
  }
</script>

<style scoped>
  .brand-logo {
    margin-left: 1rem;
  }

  .tabs .btn {
    margin: 5px 0;
  }

  .tabs .btn i {
    height: 0;
    line-height: 0;
  }
</style>