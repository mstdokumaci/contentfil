<template>
  <div class="row section">
    <ul v-if="publishedList.length" class="collection">
      <li class="collection-item" v-for="item in publishedList" :key="item.key">
        <router-link class="title truncate" :to="`/story/${item.key}`">
          {{item.title}}
        </router-link>
        <span class="stats" title="Viewed">
          <i class="material-icons left">visibility</i>
          {{item.viewed}}
        </span>
        <span class="stats" title="Read">
          <i class="material-icons left">visibility</i>
          <i class="material-icons left">file_download</i>
          {{item.read}}
        </span>
        <span class="stats" title="Flied">
          <i class="material-icons left">flight_takeoff</i>
          {{item.voted}}
        </span>
        <span class="secondary-content">
          {{item.date}}
          <i class="material-icons right">access_time</i>
        </span>
      </li>
    </ul>
    <empty v-if="!publishedList.length">
      <p>Seems like you have nothing published yet.</p>
    </empty>
  </div>
</template>

<script>
  import Empty from './Empty'

  export default {
    props: ['publishedList'],
    components: {
      empty: Empty
    }
  }
</script>

<style scoped>
  .collection-item a {
    font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
    font-size: 1.5rem;
    line-height: 2.5rem;
    color: #aa9;
  }

  .collection-item a:hover {
    color: #887
  }

  .collection-item .stats {
    display: inline-block;
    margin-right: 2rem;
    color: #bba;
  }

  .stats i {
    margin: 0;
  }

  .stats i:last-of-type {
    margin-right: 0.5rem;
  }
</style>