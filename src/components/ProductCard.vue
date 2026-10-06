<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// TODO: When connecting to API, compute the display price appropriately
</script>

<template>
  <div class="shop-latest__card">
    <div class="shop-latest__image">
      <img :src="product.image" :alt="product.name" />
      <span v-if="product.badge" class="shop-latest__badge">{{
        product.badge
      }}</span>
      <div class="shop-latest__actions">
        <button class="shop-latest__icon-btn" aria-label="Add to cart">
          <img src="/icons/cart.svg" alt="Add to cart" />
        </button>
        <button class="shop-latest__icon-btn" aria-label="View">
          <img src="/icons/eye-svgrepo-mini.svg" alt="View" />
        </button>
        <button class="shop-latest__icon-btn" aria-label="Wishlist">
          <img src="/icons/heart-svgrepo-mini.svg" alt="Wishlist" />
        </button>
      </div>
      <div class="shop-latest__cta--mobile">
        <button class="shop-latest__add-to-cart">ADD TO CART</button>
      </div>
    </div>
    <div class="shop-latest__info">
      <div class="shop-latest__name">{{ product.name }}</div>
      <div class="shop-latest__prices">
        <span
          v-if="product.oldPrice"
          class="shop-latest__price shop-latest__price--old"
          >$ {{ product.oldPrice }}</span
        >
        <span class="shop-latest__price shop-latest__price--new"
          >$ {{ product.price }}</span
        >
      </div>
    </div>
  </div>
</template>
