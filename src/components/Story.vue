<template>
  <div>
    <div v-html="content" class="content">
    </div>
  </div>
</template>
<script>
let subscription

export default {
  data() {
    return {
      content: ''
    }
  },
  props: [ 'id' ],
  created() {
    subscription = this.$client
      .get([ 'published', this.id ], {})
      .subscribe(story => {
        this.content = story.get('content').compute()
      })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe()
}
</script>
<style scoped>
div.content {
  position: relative;
  max-width: 30rem;
  margin: 0 auto 5rem;
}
</style>
