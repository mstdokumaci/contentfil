<template>
  <div class="section">
    <div class="row">
      <span><b>Email address:</b> {{user.email}}</span>
    </div>
    <div class="row">
      <span>
        <b>Public Author Profile:</b>
        <router-link :to="`/author/${user.author}`">{{authorName}}</router-link>
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['user', 'authorName']
  }
</script>