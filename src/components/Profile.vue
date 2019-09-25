<template>
  <router-view :draft-list="draftList" :published-list="publishedList"></router-view>
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
  created() {
    subscription = this.$client.get('draft', {}).subscribe(list => {
      const draftList = list.map((item, key) => {
        const published = item.get('published')
        const el = document.createElement('div')
        const content = item.get('content').compute() 
        el.innerHTML = content
        return {
          key: key,
          title: el.firstChild && el.firstChild.textContent.length
            ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`,
          published: published,
          publishable: !published || content !== published.get('content').compute()
        }
      }).filter(item => item)
      this.draftList = draftList.filter(item => item.publishable)
      this.publishedList = draftList.filter(item => item.published).map(item => {
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
