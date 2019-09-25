<template>
  <div>
    <div class="row">
      <span class="col s6 offset-s3" style="color:red">{{error}}</span>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">email</i>
        <input type="text" id="email" v-model="email" class="validate">
        <label for="email">E-mail</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">lock_open</i>
        <input type="password" id="password" v-model="password" class="validate">
        <label for="password">Password</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">lock_open</i>
        <input type="password" id="password2" v-model="password2" class="validate">
        <label for="password2">Repeat Password</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <button class="btn right waves-effect" @click="signup">Sign up</button>
      </div>
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
            this.error = user.get('error').compute()
            listener.off()
          }
        })

        user.emit('create', JSON.stringify({
          email: this.email,
          password: this.password
        }))
      }
    }
  }
}
</script>
