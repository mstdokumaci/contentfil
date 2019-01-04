<template>
  <div class="app" id="app">
    <content-editor :onChange="onChange" :options='options' />
  </div>
</template>

<script>
  import Editor from 'vue2-medium-editor'

  export default {
    name: 'app',
    data() {
      return {
        options: {}
      }
    },
    methods: {
      onChange(content) {
        clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(
          () => this.$client.get('content').set(content),
          200
        )
      }
    },
    created () {
      this.$client.on('connected', val => {
        if (val) {
          this.$client.switchBranch('A')
        }
      })
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
    width: 700px;
    margin: auto;
    font-family: Helvetica, sans-serif;
    display: flex;
}
</style>
