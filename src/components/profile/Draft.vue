<template>
  <div class="row section">
    <div v-if="draftList.length" class="collection">
      <router-link class="collection-item truncate" v-for="item in draftList" :key="item.key"
        :to="`/me/draft/${item.key}`">
        {{item.title}}
      </router-link>
    </div>
    <empty v-else>
      <p>Seems like you have no drafts yet.</p>
    </empty>
  </div>
</template>

<script>
  import Empty from './Empty'

  export default {
    props: ['draftList'],
    components: {
      empty: Empty
    }
  }
</script>