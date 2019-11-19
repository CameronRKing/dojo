<script>
import j from 'jscodeshift';
import posthtml from 'posthtml';
import postcss from 'postcss';

export default {
    path: __filename
};
</script>

<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.list {
  @apply text-left bg-blue-800 border-l-2 border-blue-900 text-white
}

.list-item {
  @apply py-1 px-2
}

.list-item.highlighted {
  @apply bg-blue-700
}

.list-item.selected {
  @apply bg-blue-900
}

.mode-input {
  @apply w-full rounded-lg my-2 border border-gray-400 px-2
}

.mode-input:focus {
  @apply outline-none shadow-outline
}

.header {
  @apply text-sm font-bold tracking-wider uppercase text-center
}
</style>
