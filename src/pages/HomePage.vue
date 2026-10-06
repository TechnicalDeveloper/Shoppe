<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import HeroSlider from '../components/HeroSlider.vue';
import { getProducts } from '../services/api';

const latestProducts = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    // For homepage latest products, let's fetch first 6
    latestProducts.value = await getProducts(6);
  } catch (error) {
    console.error('Failed to load products:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="hero">
    <div class="container">
      <HeroSlider />
    </div>
  </section>

  <section class="shop-latest">
    <div class="container">
      <div class="shop-latest__header">
        <h2 class="shop-latest__title">Shop The Latest</h2>
        <RouterLink to="/shop" class="shop-latest__view-all"
          >View All</RouterLink
        >
      </div>
      <div v-if="isLoading" class="shop-latest__loading">Loading...</div>
      <div v-else class="shop-latest__grid">
        <ProductCard
          v-for="product in latestProducts"
          :key="product.documentId"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.shop-latest__loading {
  text-align: center;
  padding: 40px 0;
  color: var(--color-gray-dark);
}
</style>
