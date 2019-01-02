<template>
  <div class="wrapper">
    <label>{{ label }}</label>
    <input
      type="text"
      :value="value"
      @input="({ target: { value: val } }) => this.$emit('input', val)"
    >
  </div>
</template>

<script>
  export default {
    props: {
      label: {
        type: String,
        required: true
      },
      value: {
        required: true
      }
    }
  }
</script>

<style scoped>

</style>