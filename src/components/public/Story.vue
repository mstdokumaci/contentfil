<template>
  <div>
    <div class="row">
      <div class="fixed-action-btn" v-if="hasDraft">
        <router-link class="btn btn-floating btn-large waves-effect" :to="`/me/draft/${id}`" tag="button">
          <i class="material-icons">edit</i>
        </router-link>
      </div>
      <div v-html="content" class="editor__content">
      </div>
    </div>
    <div class="row">
      by
      <router-link :to="`/author/${authorId}`">
        {{authorName}}
      </router-link>
    </div>
  </div>
</template>

<script>
  let storySubscription, draftSubscription

  export default {
    data() {
      return {
        story: '',
        authorId: '',
        authorName: '',
        hasDraft: false
      }
    },
    props: ['id'],
    created() {
      let loadTimeout = setTimeout(() => {
        this.$router.push('/')
      }, 500)
      storySubscription = this.$client
        .get('published', {})
        .subscribe({ keys: [this.id] }, published => {
          const story = published.get(this.id)
          if (story) {
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }
            this.content = story.get('content').compute()
            this.authorId = story.get('author').serialize().pop()
            this.authorName = story.get(['author', 'name']).compute()
          }
        })
      draftSubscription = this.$client
        .get('draft', {})
        .subscribe({ keys: [this.id] }, draft => {
          if (draft && draft.get([this.id, 'content'])) {
            this.hasDraft = true
            setTimeout(() => {
              draftSubscription.unsubscribe()
              draftSubscription = null
            })
          }
        })
    },
    beforeDestroy: () => {
      storySubscription && storySubscription.unsubscribe()
      draftSubscription && draftSubscription.unsubscribe()
    }
  }
</script>