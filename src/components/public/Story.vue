<template>
  <div>
    <div class="row">
      <div class="fixed-action-btn" v-if="hasDraft">
        <a class="btn-floating btn-large waves-effect">
          <i class="large material-icons">menu</i>
        </a>
        <ul>
          <li>
            <button class="btn btn-floating waves-effect" @click="unpublish">
              <i class="material-icons">delete</i>
            </button>
          </li>
          <li>
            <router-link class="btn btn-floating waves-effect" :to="`/me/draft/${id}`">
              <i class="material-icons">edit</i>
            </router-link>
          </li>
        </ul>
      </div>
      <div v-html="content" class="editor__content" />
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
        content: '',
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
          if (draft.get(this.id)) {
            this.hasDraft = true
            setTimeout(() => {
              draftSubscription.unsubscribe()
              draftSubscription = null
              M.FloatingActionButton.init(
                document.querySelectorAll('.fixed-action-btn'),
                { direction: 'bottom' }
              )
            })
          }
        })
    },
    methods: {
      unpublish() {
        this.$client.get('draft').emit('unpublish', this.id)
      }
    },
    beforeDestroy: () => {
      storySubscription && storySubscription.unsubscribe()
      storySubscription = null
      draftSubscription && draftSubscription.unsubscribe()
      draftSubscription = null
    }
  }
</script>