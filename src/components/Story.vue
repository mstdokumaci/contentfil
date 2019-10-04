<template>
  <div class="row">
    <div class="fixed-action-btn" v-if="hasDraft">
      <router-link class="btn btn-floating btn-large waves-effect" :to='`/me/draft/${id}`' tag="button">
        <i class="material-icons">edit</i>
      </router-link>
    </div>
    <div v-html="content" class="editor__content">
    </div>
  </div>
</template>
<script>
  let storySubscription, draftSubscription

  export default {
    data() {
      return {
        content: '',
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
          const content = published.get([this.id, 'content'])
          if (content) {
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }
            this.content = content.compute()
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