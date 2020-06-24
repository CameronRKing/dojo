<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/dojos">Dojo List</router-link> |
      <a v-if="$store.state.user" href="#" @click="logout">Logout</a>
      <router-link v-else to="/login">Sign up or Login</router-link>
    </div>
    <router-view/>
  </div>
</template>


<script>
import firebase from 'firebase/app';

export default {
    created() {
        firebase.auth().onAuthStateChanged(user => {
            this.$store.commit('updateUser', user);
        });
    },
    methods: {
        logout() {
            firebase.auth().signOut().then(() => this.$router.push('/'));
        }
    }
}
</script>

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
</style>
