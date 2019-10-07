<template>
  <router-view :user="user" :author="author" :draft-list="draftList" :published-list="publishedList" />
</template>

<script>
  let draftSubscription, authorSubscription, publishedSubscription

  export default {
    data() {
      return {
        draftList: [],
        publishedList: [],
        author: {}
      }
    },
    props: ['user'],
    created() {
      draftSubscription = this.$client.get('draft', {}).subscribe(list => {
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
        .subscribe({ keys: ['author'], depth: 1 }, user => {
          const author = user.get('author')
          if (author) {
            this.author = {
              id: author.serialize().pop(),
              name: author.get('name').compute(),
            }

            if (!publishedSubscription) {
              publishedSubscription = author.get('published')
                .subscribe({ depth: 2 }, list => {
                  this.publishedList = list.map((item, key) => {
                    const el = document.createElement('div')
                    const content = item.get('content').compute()
                    el.innerHTML = content
                    return {
                      key: key,
                      title: el.firstChild && el.firstChild.textContent.length
                        ? el.firstChild.textContent.trim() : `Untitled ${key.slice(0, 3)}`,
                      date: (new Date(item.get('date').compute())).toUTCString()
                    }
                  })
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