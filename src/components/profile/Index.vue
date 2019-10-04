<template>
  <div class="section">
    <div class="row">
      <span><b>Email address:</b> {{user.email}}</span>
    </div>
    <div class="row">
      <span><b>Public Author Name:</b> {{user.name}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['user']
  }
</script>