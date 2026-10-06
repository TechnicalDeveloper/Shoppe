<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';

// Temporary mock data until we connect the API
const latestProducts = ref([
  {
    id: 1,
    name: 'Lira Earrings',
    price: '20,00',
    oldPrice: '29,00',
    badge: '-31%',
    image: '/src/assets/Lira-Earrings_shop.png',
  },
  {
    id: 2,
    name: 'Hal Earrings',
    price: '30,00',
    image: '/src/assets/Hal-Earrings_shop.png',
  },
  {
    id: 3,
    name: 'Kaede Hair Pin',
    price: '30,00',
    image: '/src/assets/Kaede-Hair_shop.png',
  },
  {
    id: 4,
    name: 'Yuki Hair Pin',
    price: '25,00',
    oldPrice: '29,00',
    badge: '-10%',
    image: '/src/assets/Yuki-Hair_shop.png',
  },
  {
    id: 5,
    name: 'Plaine Necklace',
    price: '19,00',
    image: '/src/assets/Plaine-Necklace_shop.png',
  },
  {
    id: 6,
    name: 'Hair Pin Set of 3',
    price: '29,00',
    image: '/src/assets/Hair-Pin_shop.png',
  },
]);
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero__slider">
        <!-- Hero content will be dynamic later based on Swiper and API -->
        <div class="hero__content">
          <h2 class="hero__title">Gold big hoops</h2>
          <div class="hero__price">$ 68,00</div>
          <RouterLink to="/shop" class="hero__btn">View Product</RouterLink>
        </div>
        <div class="hero__pagination"></div>
      </div>
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
      <div class="shop-latest__grid">
        <ProductCard
          v-for="product in latestProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>
