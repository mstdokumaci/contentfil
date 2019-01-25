<template>
  <div>
    <div>
      <label for="email">E-mail</label>
      <input type="text" id="email" v-model="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="password" />
    </div>
    <div>
      <button @click="login">Login</button>
      <router-link to="/signup">Sign up</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  props: [ 'user' ],
  watch: {
    'user.type': function (type) {
      if (type === 'real') {
        this.$router.replace('/me')
      }
    }
  },
  methods: {
    login() {

    }
  },
  created() {
    if (this.user.type === 'real') {
        this.$router.replace('/me')
    }
  }
}
</script>
