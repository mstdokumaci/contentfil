<template>
  <div class="section">
    <div class="row">
      <span><b>Public Author Name:</b> {{author.name}}</span>
    </div>
  </div>
</template>

<script>
  let authorSubscription

  export default {
    data() {
      return {

      }
    },
    props: ['id'],
    created() {
      let loadTimeout = setTimeout(() => {
        this.$router.push('/')
      }, 500)

      authorSubscription = this.$client
        .get('author', {})
        .subscribe({ keys: [this.id] }, authors => {
          const author = authors.get(this.id)
          if (author) {
            this.author = author.serialize()
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }
          }
        })
    },
    beforeDestroy: () => authorSubscription && authorSubscription.unsubscribe()
  }
</script>