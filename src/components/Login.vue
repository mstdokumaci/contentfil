<template>
  <div>
    <div>
      <span style="color:red">{{error}}</span>
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
      <button @click="login">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
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
    login() {
      if (this.email.length < 5) {
        this.error = 'Minimum email length is 5'
      } else {
        this.error = ''

        const listener = this.$client
          .get([ 'user', 'status' ], {})
          .on((_, stamp, status) => {
            status = status.compute()
            if (status === 'error') {
              this.error = this.$client.get(['user', 'error']).compute()
              listener.off()
            }
          })

        this.$client.switchBranch(JSON.stringify({
          type: 'password',
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
