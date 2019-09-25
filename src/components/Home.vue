<template>
    <div>
      <ul class="story-list">
        <li v-for="item in list" :key="item.key">
          <router-link :to="`/story/${item.key}`">
            {{item.title}}
          </router-link>
          by {{item.author}}, published at: {{item.date}}
        </li>
      </ul>
  </div>
</template>

<script>
let subscription

export default {
  data() {
    return {
      list: []
    }
  },
  created() {
    subscription = this.$client.get('published', {}).subscribe(list => {
      this.list = list.map((item, key) => {
        const el = document.createElement('div')
        el.innerHTML = item.get('content').compute()
        return {
          key: key,
          title: el.firstChild && el.firstChild.textContent.length
            ? el.firstChild.textContent : `Untitled ${key.slice(0, 3)}`,
          date: (new Date(item.get('date').compute())).toUTCString(),
          author: item.get('author').compute()
        }
      })
    })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe()
}
</script>
