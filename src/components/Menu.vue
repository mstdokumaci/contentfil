<template>
  <ul id ="menu">
    <li v-for="page in visiblePages" :key="page.path">
      <router-link :to="page.path" :tag="$route.path === page.path ? 'span' : 'a'">
        {{page.title}}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      pages: [
        {
          title: 'Home',
          path: '/',
          anonymous: true,
          real: true
        },
        {
          title: 'My Profile',
          path: '/me',
          real: true
        },
        {
          title: 'Login',
          path: '/login',
          anonymous: true
        },
        {
          title: 'Signup',
          path: '/signup',
          anonymous: true
        }
      ]
    }
  },
  props: ['user'],
  computed: {
    visiblePages() {
      return this.pages.filter(
        page => (this.user.type === 'real' && page.real) || (this.user.type !== 'real' && page.anonymous)
      )
    }
  }
}
</script>

<style scoped>
ul#menu {
  list-style-type: none;
  margin-bottom: 0.5rem;
}
ul#menu > li {
  display: inline;
}
ul#menu > li > * {
  padding: 0.3rem;
}
</style>
