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
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0;
}

.app {
    color: #444;
    margin-top: 100px;
    max-width: 600px;
    font-family: Helvetica, sans-serif;
    text-align: center;
    display: flex;
    align-items: center;
}
</style>
