<template>
  <div class="collection">
    <router-link class="collection-item truncate" v-for="item in draftList" :key="item.key"
      :to="`/me/draft/${item.key}`">
      {{item.title}}
    </router-link>
  </div>
</template>

<script>
  export default {
    props: ['draftList']
  }
</script>