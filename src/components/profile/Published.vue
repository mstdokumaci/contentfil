<template>
  <div class="row section">
    <div v-if="publishedList.length" class="collection">
      <router-link class="collection-item truncate" v-for="item in publishedList" :key="item.key"
        :to="`/story/${item.key}`">
        {{item.title}}
        <span class="secondary-content">
          {{item.date}}
          <i class="material-icons right">access_time</i>
        </span>
      </router-link>
      </ul>
    </div>
    <empty v-if="!publishedList.length && author">
      <p>Seems like you have nothing published yet.</p>
    </empty>
  </div>
</template>

<script>
  import Empty from './Empty'

  export default {
    props: ['author', 'publishedList'],
    components: {
      empty: Empty
    }
  }
</script>