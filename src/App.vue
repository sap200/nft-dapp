<template>
  <FrontPage/>
</template>

<script>
import FrontPage from './components/FrontPage.vue';

export default {
  name: 'App',
  components: {
      FrontPage,
  }
}
</script>

<style>
#app {
  font-family: 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
