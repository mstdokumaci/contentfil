<template>
  <div class="row section">
    <div class="col s6" v-for="item in list" :key="item.key">
      <router-link :to="`/story/${item.key}`" tag="div" class="card grey lighten-5">
        <div class="card-content">
          <span class="card-title truncate">
            {{item.title}}
          </span>
          <p>{{item.firstParagraph}}</p>
          <span class="author truncate">
            by {{item.author}}
          </span>
          <span class="date right">
            {{item.date}}
            <i class="material-icons right">access_time</i>
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
  let subscription

  const truncate = str => {
    if (str.length < 135) {
      return str
    }
    const found = str.slice(120).match(/[\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF]/)
    if (!found || found.index > 25) {
      return str.slice(0, 125) + '...'
    } else {
      return str.slice(0, 120 + found.index) + '...'
    }
  }

  export default {
    data() {
      return {
        list: []
      }
    },
    created() {
      subscription = this.$client.get('published', {}).subscribe({
        sort: { path: ['date'], type: Number, desc: true },
        limit: 6
      }, list => {
        list = list.map((item, key) => {
          const el = document.createElement('div')
          el.innerHTML = item.get('content').compute()
          const timestamp = item.get('date').compute()
          return {
            key: key,
            title: el.firstChild && el.firstChild.textContent.length
              ? el.firstChild.textContent : `Untitled ${key.slice(0, 3)}`,
            firstParagraph: el.childNodes && el.childNodes[1] && truncate(el.childNodes[1].textContent),
            timestamp,
            date: (new Date(timestamp)).toISOString(),
            author: item.get(['author', 'name']).compute()
          }
        })
        list.sort((a, b) => b.timestamp - a.timestamp)
        this.list = list
      })
    },
    beforeDestroy: () => {
      subscription && subscription.unsubscribe()
      subscription = null
    }
  }
</script>

<style scoped>
  .card {
    cursor: pointer;
  }

  .card-content {
    font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
  }

  .card-content p {
    font-size: 1.1rem;
    margin: 1rem 0;
    opacity: 0.8;
    height: 5.1rem;
  }

  .card-content .author {
    display: inline-block;
    max-width: 60%;
  }

  .date {
    line-height: 24px;
  }
</style>