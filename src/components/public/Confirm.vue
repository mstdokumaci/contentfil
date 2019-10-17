<template>
  <div>
    <div class="row">
      <p v-if="token">
        Your e-mail address is being confirmed now, you will be redirected to your profile once it is done.
      </p>
      <p v-else>
        Please check your e-mail and click the confirmation link
      </p>
    </div>
  </div>
</template>

<script>
  let storySubscription, draftSubscription

  export default {
    props: ['token'],
    created() {
      if (this.token) {
        setTimeout(() => {
          this.$client.switchBranch(JSON.stringify({
            type: 'confirm',
            token: this.token
          }))
        })
      }
    },
    methods: {
      resend() {
        this.$client.get('user').emit('resend')
      }
    }
  }
</script>