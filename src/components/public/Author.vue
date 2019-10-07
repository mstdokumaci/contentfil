<template>
  <div>
    <div class="section row">
      <h1>{{author.name}}</h1>
    </div>
    <div class="section row">
      <published :published-list="publishedList" />
    </div>
  </div>
</template>

<script>
  import Published from '../profile/Published'

  let authorSubscription, publishedSubscription

  export default {
    components: {
      published: Published
    },
    data() {
      return {
        author: {},
        publishedList: []
      }
    },
    props: ['id'],
    created() {
      let loadTimeout = setTimeout(() => {
        this.$router.push('/')
      }, 500)

      authorSubscription = this.$client
        .get('author', {})
        .subscribe({ keys: [this.id], depth: 2 }, authors => {
          const author = authors.get(this.id)
          if (author) {
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }
            this.author = {
              name: author.get('name').compute()
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
      authorSubscription && authorSubscription.unsubscribe()
      authorSubscription = null
      publishedSubscription && publishedSubscription.unsubscribe()
      publishedSubscription = null
    }
  }
</script>