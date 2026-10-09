<script setup>
import { RouterView } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import CartSidebar from './components/CartSidebar.vue';
</script>

<template>
  <AppHeader />
  <CartSidebar />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>
