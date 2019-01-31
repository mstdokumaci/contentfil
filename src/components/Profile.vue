<template>
  <div>
    <div>
      <router-link to="/">Home</router-link>
    </div>
    <div>
      <span>{{user.email}}</span>
      <button @click="logout">Logout</button>
    </div>
    <div>
      <button @click="newStory">New Story</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      draft: {}
    }
  },
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
    },
    newStory() {
      this.$once('new', id => {
        this.$router.push(`/draft/${id}`)
      })

      this.$client.get('draft').emit('create')
    }
  },
  created() {
    if (this.user.type !== 'real') {
      return this.$router.replace('/login')
    }
    
    this.$client.get('draft', {}).subscribe({ depth: 2 }, draft => {
      draft.forEach((_, id) => {
        if (!this.draft[id]) {
          this.$emit('new', id)
          this.draft[id] = {}
        }
      })
    })
  }
}
</script>
