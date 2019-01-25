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
      <label for="password2">Repeat Password</label>
      <input type="password" id="password2" v-model="password2" />
    </div>
    <div>
      <button @click="signup">Sign up</button>
      <router-link to="/login">Login</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      password2: ''
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
    signup() {

    }
  },
  created() {
    if (this.user.type === 'real') {
        this.$router.replace('/me')
    }
  }
}
</script>
