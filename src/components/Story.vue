<template>
  <div>
    <router-link v-if="hasDraft" :to='`/me/draft/${id}`'>Edit</router-link>
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
  props: [ 'id' ],
  created() {
    storySubscription = this.$client
      .get([ 'published', this.id ], {})
      .subscribe(story => {
        if (story.get('content')) {
          this.content = story.get('content').compute()
        }
      })
    draftSubscription = this.$client
      .get([ 'draft', this.id ], {})
      .subscribe(story => {
        if (story && story.get('content')) {
          this.hasDraft = true
          setTimeout(() => {
            draftSubscription.unsubscribe()
            draftSubscription = null
          })
        }
      })
  },
  beforeDestroy: () =>  {
    storySubscription && storySubscription.unsubscribe()
    draftSubscription && draftSubscription.unsubscribe()
  }
}
</script>
