<template>
  <div>
    <div>
      <span>{{user.email}}</span>
      <button @click="logout">Logout</button>
    </div>
    <div class="tab-header">
      <h3 @click="activeTab='drafts'" :class="{active:activeTab!=='drafts'}">Drafts</h3>
      <h3 @click="activeTab='published'" :class="{active:activeTab!=='published'}">Published</h3>
    </div>
    <div v-if="activeTab === 'drafts'" class="story-list">
      <button @click="newStory">New Story</button>
      <ul>
        <li v-for="item in draftList" :key="item.key">
          <router-link :to="`/draft/${item.key}`">{{item.title}}</router-link>
        </li>
      </ul>
    </div>
    <div v-if="activeTab === 'published'" class="story-list">
      <ul>
        <li v-for="item in publishedList" :key="item.key">
          <router-link :to="`/story/${item.key}`">{{item.title}}</router-link>
          <span>published at: {{item.date}}</span>
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
      subscription: null,
      activeTab: 'drafts'
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
            ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`,
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
            ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`,
          date: (new Date(published.get('date').compute())).toUTCString()
        }
      })
    })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe()
}
</script>
<style scoped>
div.tab-header {
  padding: 0.5rem 0;
}
div.tab-header > h3 {
  display: inline;
  margin: 0 1rem 0 0;
}
div.tab-header > h3.active {
  cursor: pointer;
  text-decoration: underline;
}
div.story-list {
  margin: 0.5rem 0;
}
div.story-list > * {
  margin-bottom: 1rem
}
div.story-list > ul {
  list-style: none;
}
div.story-list > ul > li > span {
  margin-left: 1rem;
}
</style>
