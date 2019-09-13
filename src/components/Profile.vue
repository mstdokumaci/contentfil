<template>
  <div>
    <div>
      <span>{{user.email}}</span>
      <button @click="logout">Logout</button>
    </div>
    <div>
      <button @click="newStory">New Story</button>
    </div>
    <div class="story-list">
      <h3>
        Drafts
      </h3>
      <ul>
        <li v-for="item in draftList" :key="item.key">
          <router-link :to="`/draft/${item.key}`">
            {{item.title}}
          </router-link>
        </li>
      </ul>
    </div>
    <div class="story-list">
      <h3>
        Published
      </h3>
      <ul>
        <li v-for="item in publishedList" :key="item.key">
          <router-link :to="`/story/${item.key}`">
            {{item.title}}
          </router-link>
          published at: {{item.date}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
let subscription

export default {
  data() {
    return {
      draftList: [],
      publishedList: [],
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
      this.draftList = list.map((item, key) => {
        const published = item.get('published')
        const el = document.createElement('div')
        el.innerHTML = item.get('content').compute()
        return {
          key: key,
          title: el.firstChild && el.firstChild.textContent.length
            ? el.firstChild.textContent : `Untitled ${key.slice(0, 3)}`,
          published: published
        }
      }).filter(item => item)
      this.publishedList = this.draftList.filter(item => item.published).map(item => {
        const published = item.published
        const el = document.createElement('div')
        el.innerHTML = published.get('content').compute()
        return {
          key: item.key,
          title: el.firstChild && el.firstChild.textContent.length
            ? el.firstChild.textContent : `Untitled ${key.slice(0, 3)}`,
          date: (new Date(published.get('date').compute())).toUTCString()
        }
      })
    })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe()
}
</script>
<style scoped>
div.story-list {
  margin: 1rem 0;
}
</style>
