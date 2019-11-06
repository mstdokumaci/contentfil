<template>
  <div v-scroll="scroll">
    <div class="row">
      <div class="fixed-action-btn" v-if="hasDraft">
        <a class="btn-floating btn-large waves-effect brown lighten-3">
          <i class="large material-icons">menu</i>
        </a>
        <ul>
          <li>
            <router-link class="btn btn-floating waves-effect brown lighten-3" title="Edit story"
              :to="`/me/draft/${id}`">
              <i class="material-icons">edit</i>
            </router-link>
          </li>
        </ul>
      </div>
      <div v-html="content" class="editor__content" />
    </div>
    <div id="author-date" class="row">
      <div class="col s6">
        by <router-link :to="`/author/${authorId}`">{{authorName}}</router-link>
      </div>
      <div class="col s6">
        <span class="date right">
          <i class="material-icons right">access_time</i>
          {{date}}
        </span>
      </div>
    </div>
    <div class="row">
      <button :disabled="canNotVote" :class="{'deep-orange': vote === 1, brown: vote !== 1}"
        class="btn-floating btn-large waves-effect lighten-3" title="Go fly high" @click="castVote(1)">
        <i class="material-icons right vote-1">flight_takeoff</i>
      </button>
      <button :disabled="canNotVote" :class="{'deep-orange': vote === 3, brown: vote !== 3}"
        class="btn-floating btn-large waves-effect lighten-3" title="Go fly higher" @click="castVote(3)">
        <i class="material-icons right vote-3">flight_takeoff</i>
      </button>
      <button :disabled="canNotVote" :class="{'deep-orange': vote === 5, brown: vote !== 5}"
        class="btn-floating btn-large waves-effect lighten-3" title="Go fly the highest" @click="castVote(5)">
        <i class="material-icons right vote-5">flight_takeoff</i>
      </button>
    </div>
  </div>
</template>

<script>
  let storySubscription, userTypeListener, draftSubscription

  export default {
    data() {
      return {
        content: '',
        authorId: '',
        authorName: '',
        date: '',
        hasDraft: false,
        read: false,
        vote: 0
      }
    },
    props: ['user', 'id'],
    created() {
      let loadTimeout = setTimeout(() => {
        this.$router.push('/')
      }, 500)

      const isReal = (viewed, read) => {
        if (!viewed.compute()) {
          viewed.set(true)
        }
        if (!read.compute()) {
          this.read = false
          setTimeout(() => this.scroll(), 2000)
        }
      }

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
            this.date = this.$formatDate(story.get('date').compute())
            this.authorId = story.get('author').serialize().pop()
            this.authorName = story.get(['author', 'name']).compute()
            this.vote = story.get('vote').compute()
            const viewed = story.get('viewed')
            const read = story.get('read')
            if (this.user.type === 'real') {
              isReal(viewed, read)
            } else {
              userTypeListener = this.$client.get(['user', 'type']).on((_, __, type) => {
                if (type === 'real') {
                  isReal(viewed, read)
                  userTypeListener.off()
                  userTypeListener = null
                }
              })
            }
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
    computed: {
      canNotVote() {
        return this.user.type !== 'real' || this.authorId === this.user.author
      }
    },
    methods: {
      castVote(vote) {
        if (this.vote === vote) {
          vote = 0
        }
        this.$client.get(['published', this.id, 'vote']).set(vote)
      },
      scroll() {
        if (
          !this.read
          && window.innerHeight - document.getElementById('author-date').getBoundingClientRect().top > -50
        ) {
          this.$client.get(['published', this.id, 'read']).set(true)
          this.read = true
        }
      }
    },
    beforeDestroy: () => {
      storySubscription && storySubscription.unsubscribe()
      storySubscription = null
      userTypeListener && userTypeListener.off()
      userTypeListener = null
      draftSubscription && draftSubscription.unsubscribe()
      draftSubscription = null
    }
  }
</script>

<style scoped>
  .date {
    line-height: 24px;
  }

  .vote .voted {
    color: red;
  }

  .btn-large .vote-1 {
    font-size: 1.4rem;
  }

  .btn-large .vote-3 {
    font-size: 1.8rem;
  }

  .btn-large .vote-5 {
    font-size: 2.1rem;
  }
</style>