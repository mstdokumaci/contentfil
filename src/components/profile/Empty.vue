<template>
  <div class="col s6 offset-s3">
    <div class="card brown lighten-5">
      <div class="card-content">
        <slot></slot>
        <p>Would you like to tell us a story? Use the button below and start writing.</p>
      </div>
      <div class="card-action">
        <button class="btn waves-effect brown lighten-3" @click="newStory">
          <i class="material-icons left">note_add</i>
          Create new story
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      newStory() {
        this.$client.get('draft').emit('create')
      }
    }
  }
</script>

<style scoped>
  .card-action {
    text-align: center;
  }
</style>