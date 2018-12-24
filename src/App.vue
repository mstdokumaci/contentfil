<template>
  <div class="app" id="app">
    <content-editor :content='content' :options='options' />
  </div>
</template>

<script>
  import Editor from 'vue2-medium-editor'

  export default {
    name: 'app',
    data() {
      return {
        content: "",
        options: {

        }
      }
    },
    components: { Editor }
  }
</script>

<style>
body {
    display: flex;
    height: 100%;
    margin: 1%;
}

.app {
    color: #444;
    max-width: 600px;
    font-family: Helvetica, sans-serif;
    display: flex;
}
</style>
