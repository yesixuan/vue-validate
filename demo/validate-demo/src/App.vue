<template>
  <div id="app">
    <HelloWorld  v-if="show" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  data() {
    return {
      show: true
    }
  },
  mounted() {
    // setTimeout(() => {
    //   console.log(this.show = false)
    // }, 5000)
    // setTimeout(() => {
    //   console.log(this.show = true)
    // }, 7000)
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
