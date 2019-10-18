<template>
  <div class="row">
    <div class="col s6 offset-s3">
      <div class="card brown lighten-5">
        <div class="card-content">
          <p v-if="token">
            Your e-mail address is being confirmed now, you will be redirected to your profile once it is done.
            If you are seeing this longer than a few seconds, your confirmation link might have expired.
            Please use the button below to receive a fresh link.
          </p>
          <p v-else>
            Please check your e-mail and click the confirmation link.
            If you didn't receive any e-mail yet, please use the button below, so we send a new e-mail.
          </p>
        </div>
        <div class="card-action">
          <button class="btn waves-effect brown lighten-3" :class="{disabled: coolDown}" @click="resend">
            <i class="material-icons left">repeat</i>
            Resend Confirmation Link
          </button>
          <p v-if="coolDown">Please wait {{coolDown}} seconds before resend.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  let storySubscription, draftSubscription

  export default {
    data() {
      return {
        coolDown: 31
      }
    },
    props: ['token'],
    created() {
      if (this.token) {
        setTimeout(() => {
          this.$client.switchBranch(JSON.stringify({
            type: 'confirm',
            token: this.token
          }))
        }, 2000)
        this.coolDown = 0
      } else {
        this.reduceCoolDown()
      }
    },
    methods: {
      resend() {
        this.$client.get('user').emit('resend')
        this.coolDown = 31
        this.reduceCoolDown()
      },
      reduceCoolDown() {
        if (--this.coolDown > 0) {
          setTimeout(() => this.reduceCoolDown(), 1000)
        }
      }
    }
  }
</script>