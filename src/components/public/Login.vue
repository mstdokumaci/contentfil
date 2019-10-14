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
        <button class="btn right waves-effect blue-grey lighten-2" @click="login">Login</button>
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
        error: ''
      }
    },
    props: ['user'],
    methods: {
      login() {
        if (this.email.length < 5) {
          this.error = 'Minimum email length is 5'
        } else {
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