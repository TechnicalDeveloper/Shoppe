<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const favoritesStore = useFavoritesStore();

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.product);
};

const isFavorite = computed(() =>
  favoritesStore.isFavorite(props.product.documentId)
);

const productImage = computed(() => {
  return props.product.image || '/src/assets/placeholder.png';
});

const displayPrice = computed(() => {
  return `$ ${props.product.price?.toFixed(2) || '0.00'}`;
});
</script>

<template>
  <div class="shop-latest__card">
    <div class="shop-latest__image">
      <img :src="productImage" :alt="product.title" />
      <span v-if="product.discountPercent" class="shop-latest__badge"
        >-{{ product.discountPercent }}%</span
      >
      <div class="shop-latest__actions">
        <button class="shop-latest__icon-btn" aria-label="Add to cart">
          <img src="/icons/cart.svg" alt="Add to cart" />
        </button>
        <RouterLink
          :to="`/products/${product.documentId}`"
          class="shop-latest__icon-btn"
          aria-label="View"
        >
          <img src="/icons/eye-svgrepo-mini.svg" alt="View" />
        </RouterLink>
        <button
          class="shop-latest__icon-btn"
          aria-label="Wishlist"
          @click="toggleFavorite"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            :fill="isFavorite ? '#ff4d4f' : 'none'"
            :stroke="isFavorite ? '#ff4d4f' : 'currentColor'"
            stroke-width="2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>
      <div class="shop-latest__cta--mobile">
        <button class="shop-latest__add-to-cart">ADD TO CART</button>
      </div>
    </div>
    <div class="shop-latest__info">
      <div class="shop-latest__name">{{ product.title }}</div>
      <div class="shop-latest__prices">
        <span class="shop-latest__price shop-latest__price--new">{{
          displayPrice
        }}</span>
      </div>
    </div>
  </div>
</template>
