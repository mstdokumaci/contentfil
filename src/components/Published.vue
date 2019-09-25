<template>
  <ul class="collection">
    <router-link
      class="collection-item"
      v-for="item in publishedList"
      :key="item.key"
      :to="`/story/${item.key}`"
    >
      {{item.title}}
      <span class="secondary-content">
        {{item.date}}
        <i class="material-icons right">access_time</i>
      </span>
    </router-link>
  </ul>
</template>

<script>
export default {
  props: ['publishedList']
}
</script>
