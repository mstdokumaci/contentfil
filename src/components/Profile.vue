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
    <ul>
      <li v-for="item in list" :key="item.key">
        <router-link :to="`/draft/${item.key}`">
          {{item.title}}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
let subscription

export default {
  data() {
    return {
      list: [],
      subscription: null
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
      this.$client.get('draft').emit('create')
    }
  },
  created() {
    if (this.user.type !== 'real') {
      return this.$router.replace('/login')
    }

    subscription = this.$client.get('draft', {}).subscribe(list => {
      this.list = list.map((item, key) => {
        if (item.get('content') !== void 0) {
          const el = document.createElement('div')
          el.innerHTML = item.get('content').compute()
          return {
            key: key,
            title: el.firstChild ? el.firstChild.textContent : key
          }
        }
      }).filter(item => item)
    })
  },
  destroyed: () => subscription && subscription.unsubscribe()
}
</script>
