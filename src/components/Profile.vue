<template>
  <div>
    <span>{{user.email}}</span>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  props: [ 'user', 'anonymousId' ],
  watch: {
    'user.type': function (type) {
      if (type !== 'real') {
        this.$router.replace('/login')
      }
    }
  },
  methods: {
    logout() {
      this.$client.switchBranch(JSON.stringify({
        type: 'anonymous',
        id: this.anonymousId
      }))
      window.localStorage.removeItem('user')
    }
  },
  created() {
    if (this.user.type !== 'real') {
      this.$router.replace('/login')
    }
  }
}
</script>
