<template>
  <div class="section">
    <div class="row">
      <span><b>Email address:</b> {{user.email}}</span>
    </div>
    <div class="row">
      <span>
        <b>Public Author Profile:</b>
        <router-link :to="`/author/${author.id}`">{{author.name}}</router-link>
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['user', 'author']
  }
</script>