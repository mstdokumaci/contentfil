<template>
  <div>
    <span>{{user.email}}</span>
  </div>
</template>

<script>
export default {
  props: [ 'user' ],
  watch: {
    'user.type': function (type) {
      if (type !== 'real') {
        this.$router.replace('/login')
      }
    }
  },
  created() {
    if (this.user.type !== 'real') {
      this.$router.replace('/login')
    }
  }
}
</script>
