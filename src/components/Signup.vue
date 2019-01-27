<template>
  <div>
    <div>
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
    </div>
    <div>
      <span style="color:red">{{this.error}}</span>
    </div>
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
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      password2: '',
      error: ''
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
      if (this.email.length < 5) {
        this.error = 'Minimum email length is 5'
      } else if (!~this.email.indexOf('@')) {
        this.error = 'Invalid email'
      } else if (this.password.length < 5) {
        this.error = 'Minimum password length is 5'
      } else if (this.password !== this.password2) {
        this.error = 'Passwords should be same'
      } else {
        this.error = ''

        const user = this.$client.get('user')
        const listener = user.get('status', {}).on((_, stamp, status) => {
          status = status.compute()
          if (status === 'created') {
            this.$client.switchBranch(JSON.stringify({
              type: 'password',
              email: this.email,
              password: this.password
            }))
            listener.off()
          } else if (status === 'error') {
            this.error = 'Server error'
            listener.off()
          }
        })

        user.emit('createUser', JSON.stringify({
          email: this.email,
          password: this.password
        }))
      }
    }
  },
  created() {
    if (this.user.type === 'real') {
        this.$router.replace('/me')
    }
  }
}
</script>
