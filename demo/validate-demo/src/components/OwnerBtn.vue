<template>
  <div class="wrapper">
    <button>{{ text }}</button>
  </div>
</template>

<script>
  export default {
    name: 'OwnerBtn',
    props: {
      text: {
        required: true,
        type: String
      }
    }
  }
</script>

<style scoped>
.wrapper {
  display: inline-block;
}
</style>