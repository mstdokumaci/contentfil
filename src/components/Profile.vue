<template>
  <router-view :user="user" :authorName="authorName" :draft-list="draftList" :published-list="publishedList" />
</template>

<script>
  let draftSubscription, authorSubscription, publishedSubscription

  export default {
    data() {
      return {
        draftList: [],
        publishedList: [],
        authorName: ''
      }
    },
    props: ['user'],
    created() {
      draftSubscription = this.$client.get('draft', {}).subscribe({ depth: 3 }, list => {
        this.draftList = list.map((item, key) => {
          const content = item.get('content').compute()
          const publishedContent = item.get(['published', 'content'])
          if (publishedContent && content === publishedContent.compute()) {
            return
          }
          const el = document.createElement('div')
          el.innerHTML = content
          return {
            key: key,
            title: el.firstChild && el.firstChild.textContent.length
              ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`
          }
        }).filter(item => item)
      })

      authorSubscription = this.$client.get('user')
        .subscribe({ keys: ['author'], depth: 2 }, user => {
          const authorName = user.get(['author', 'name'])
          if (authorName) {
            this.authorName = authorName.compute()

            const published = user.get(['author', 'published'])
            if (published && !publishedSubscription) {
              publishedSubscription = published
                .subscribe({ depth: 2 }, list => {
                  const publishedList = list.map((item, key) => {
                    const el = document.createElement('div')
                    const content = item.get('content').compute()
                    el.innerHTML = content
                    const timestamp = item.get('date').compute()
                    return {
                      key: key,
                      title: el.firstChild && el.firstChild.textContent.length
                        ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`,
                      timestamp,
                      date: this.$formatDate(timestamp),
                      viewed: item.get('viewerCount', 0).compute(),
                      read: item.get('readerCount', 0).compute(),
                      voted: item.get('voterCount', 0).compute(),
                      vote: item.get('totalVote', 0).compute()
                    }
                  })
                  publishedList.sort((a, b) => b.timestamp - a.timestamp)
                  this.publishedList = publishedList
                })
            }
          }
        })
    },
    beforeDestroy: () => {
      draftSubscription && draftSubscription.unsubscribe()
      draftSubscription = null
      authorSubscription && authorSubscription.unsubscribe()
      authorSubscription = null
      publishedSubscription && publishedSubscription.unsubscribe()
      publishedSubscription = null
    }
  }
</script>