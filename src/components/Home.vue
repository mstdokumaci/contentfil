<template>
    <div class="row">
      <div class="col s6" v-for="item in list" :key="item.key">
        <router-link :to="`/story/${item.key}`" tag="div" class="card blue-grey lighten-5">
          <div class="card-content">
              <span class="card-title">
                {{item.title}}
              </span>
              <p>{{item.firstParagraph}}</p>
              <span class="author">
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

export default {
  data() {
    return {
      list: []
    }
  },
  created() {
    subscription = this.$client.get('published', {}).subscribe(list => {
      this.list = list.map((item, key) => {
        const el = document.createElement('div')
        el.innerHTML = item.get('content').compute()
        return {
          key: key,
          title: el.firstChild && el.firstChild.textContent.length
            ? el.firstChild.textContent : `Untitled ${key.slice(0, 3)}`,
          firstParagraph: el.childNodes && el.childNodes[1] && el.childNodes[1].textContent,
          date: (new Date(item.get('date').compute())).toUTCString(),
          author: item.get('author').compute()
        }
      })
    })
  },
  beforeDestroy: () => subscription && subscription.unsubscribe()
}
</script>

<style scoped>
.card {
  cursor: pointer;
}
.card-content {
  font-family:medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
}
.card-content p {
  font-size: 1.1rem;
  margin: 1rem 0;
  opacity: 0.8;
}
</style>
