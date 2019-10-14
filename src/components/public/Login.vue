<template>
  <form id="loginForm" @submit.prevent>
    <div class="row">
      <span class="col s6 offset-s3" style="color:red">{{error}}</span>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">email</i>
        <input type="email" id="email" v-model="email" required class="validate">
        <label for="email">E-mail</label>
        <span class="helper-text" data-error="Invalid e-mail">
          Your registered e-mail address
        </span>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">lock_open</i>
        <input type="password" id="password" v-model="password" required class="validate">
        <label for="password">Password</label>
        <span class="helper-text" data-error="Please enter your password">
          Your password as you set when on sign up
        </span>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <button class="btn right waves-effect brown lighten-2" @click="login">Login</button>
      </div>
    </div>
  </form>
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
    props: ['user'],
    methods: {
      login() {
        if (document.getElementById('loginForm').checkValidity()) {
          this.error = ''

          const listener = this.$client
            .get(['user', 'status'], {})
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
    }
  }
</script>