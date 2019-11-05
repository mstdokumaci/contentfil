<template>
  <div class="row section">
    <ul v-if="publishedList.length" class="collection">
      <router-link class="collection-item title truncate" v-for="item in publishedList" :key="item.key"
        :to="`/story/${item.key}`">
        {{item.title}}
        <span class="secondary-content">
          {{item.date}}
          <i class="material-icons right">access_time</i>
        </span>
      </router-link>
    </ul>
  </div>
</template>

<script>
  export default {
    props: ['publishedList']
  }
</script>

<style scoped>
  .collection-item {
    font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
    font-size: 1.5rem;
    line-height: 2.5rem;
    color: #aa9;
  }

  .collection-item:hover {
    color: #887
  }

  .collection-item .secondary-content {
    font-size: 1.2rem;
  }

  .collection-item i {
    line-height: 2.5rem;
  }
</style>