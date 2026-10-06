<script setup>
import { ref, onMounted } from 'vue';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    products.value = await getProducts();
  } catch (error) {
    console.error('Failed to load shop products:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="shop-page container">
    <h1 class="shop-page__title">Shop</h1>
    <div class="shop-page__content">
      <aside id="shop-filters" class="shop-page__sidebar">
        <!-- Temporary placeholders for filters -->
        <div class="filter-group">
          <h3>Categories</h3>
          <ul>
            <li>Earrings</li>
            <li>Necklaces</li>
            <li>Hair Pins</li>
          </ul>
        </div>
      </aside>
      <div class="shop-page__main">
        <div v-if="isLoading">Loading products...</div>
        <div v-else class="shop-latest__grid">
          <ProductCard
            v-for="product in products"
            :key="product.documentId"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  padding-top: 40px;
  padding-bottom: 80px;
}
.shop-page__title {
  font-size: 32px;
  margin-bottom: 40px;
}
.shop-page__content {
  display: flex;
  gap: 32px;
}
.shop-page__sidebar {
  width: 250px;
  flex-shrink: 0;
}
.shop-page__main {
  flex: 1;
}
.filter-group h3 {
  margin-bottom: 16px;
}
.filter-group li {
  margin-bottom: 8px;
  color: var(--color-gray-dark);
  cursor: pointer;
}
</style>
