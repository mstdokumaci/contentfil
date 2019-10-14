<template>
  <form id="signupForm" @submit.prevent>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">person</i>
        <input type="text" id="name" v-model="name" required pattern=".{2,}" class="validate">
        <label for="name">Full name</label>
        <span class="helper-text" data-error="At least 2 characters">
          This will be your public author name
        </span>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">email</i>
        <input type="email" id="email" v-model="email" required class="validate" @change="clearEmailError">
        <label for="email">E-mail</label>
        <span class="helper-text" :data-error="emailError">
          This will be your login identifier
        </span>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <i class="material-icons prefix">lock_open</i>
        <input :type="showPassword ? 'text': 'password'" id="password" v-model="password" required pattern=".{6,}"
          class="validate">
        <label for="password">Password</label>
        <span class="helper-text" data-error="At least 6 characters">
          A strong password is adviced
        </span>
        <button type="button" @click.prevent="toogleShowPassword" class="right">
          <i class="material-icons">{{showPassword ? 'visibility_off': 'visibility'}}</i>
        </button>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6 offset-s3">
        <button class="btn right waves-effect blue-grey lighten-2" @click="signup">Sign up</button>
      </div>
    </div>
  </form>
</template>

<script>
  export default {
    data() {
      return {
        name: '',
        email: '',
        emailError: 'Invalid e-mail',
        password: '',
        passType: 'password',
        showPassword: false
      }
    },
    props: ['user'],
    methods: {
      signup() {
        if (document.getElementById('signupForm').checkValidity()) {
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
              const error = user.get('error').compute()
              if (error === 'User exists') {
                const element = document.getElementById('email')
                this.emailError = error
                element.setCustomValidity(error)
                element.classList.add('invalid')
              }
              listener.off()
            }
          })

          user.emit('create', JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          }))
        }
      },
      toogleShowPassword() {
        this.showPassword = !this.showPassword
      },
      clearEmailError() {
        this.emailError = 'Invalid e-mail'
        document.getElementById('email').setCustomValidity('')
      }
    }
  }
</script>