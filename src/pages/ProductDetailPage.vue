<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProductById, getProducts } from '../transport/api';
import { useFavoritesStore } from '../stores/favorites';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();
const favoritesStore = useFavoritesStore();

const product = ref(null);
const similarProducts = ref([]);
const isLoading = ref(true);

const activeImage = ref('');

const fetchProductData = async (documentId) => {
  isLoading.value = true;
  try {
    const fetchedProduct = await getProductById(documentId);
    product.value = fetchedProduct;
    activeImage.value = fetchedProduct.image || '/src/assets/placeholder.png';
    similarProducts.value = await getProducts(3);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchProductData(route.params.id));
watch(
  () => route.params.id,
  (newId) => fetchProductData(newId)
);

const additionalImages = computed(() => {
  const images = product.value?.additionalImages?.additionalImages?.[0] || {};
  return Object.values(images).filter((url) => url);
});

const allImages = computed(() => {
  const main = product.value?.image ? [product.value.image] : [];
  return [...main, ...additionalImages.value];
});

const swapImage = (url) => {
  activeImage.value = url;
};

const isFavorite = computed(() => {
  if (!product.value) return false;
  return favoritesStore.isFavorite(product.value.documentId);
});

const toggleFavorite = () => {
  if (product.value) {
    favoritesStore.toggleFavorite(product.value);
  }
};

const displayPrice = computed(() => {
  return `$ ${product.value?.price?.toFixed(2) || '0.00'}`;
});

const averageRating = computed(() => {
  const reviews = product.value?.reviews || [];
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return Math.round((total / reviews.length) * 2) / 2;
});

const renderStars = computed(() => {
  const stars = [];
  const rating = averageRating.value;
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
});
</script>

<template>
  <div class="product-page container">
    <div v-if="isLoading" class="product-page__loading"></div>

    <div v-else-if="product" class="product-page__wrapper">
      <div class="product-page__gallery">
        <div class="product-page__gallery-main">
          <img :src="activeImage" :alt="product.title" />
        </div>
        <div class="product-page__gallery-thumbs">
          <img
            v-for="(imgUrl, idx) in allImages"
            :key="idx"
            :src="imgUrl"
            alt="Thumbnail"
            @click="swapImage(imgUrl)"
            :class="{ 'is-active': activeImage === imgUrl }"
          />
        </div>
      </div>

      <div class="product-page__details">
        <h1 class="product-page__title">{{ product.title }}</h1>
        <div class="product-page__price">{{ displayPrice }}</div>

        <div class="product-page__rating">
          <div class="stars">
            <span
              v-for="(star, index) in renderStars"
              :key="index"
              class="star"
              :class="star"
              >★</span
            >
          </div>
          <span class="reviews-count"
            >{{ product.reviews?.length || 0 }} customer review{{
              product.reviews?.length !== 1 ? 's' : ''
            }}</span
          >
        </div>

        <p class="product-page__description">{{ product.description }}</p>

        <div class="product-page__actions">
          <button class="btn btn-add-cart">Add to Cart</button>
          <button class="btn btn-icon btn-wishlist" @click="toggleFavorite">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              :fill="isFavorite ? '#ff4d4f' : 'none'"
              :stroke="isFavorite ? '#ff4d4f' : 'currentColor'"
              stroke-width="2"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <section class="shop-latest" style="margin-top: 80px">
      <div class="shop-latest__header">
        <h2 class="shop-latest__title">Similar Items</h2>
      </div>
      <div class="shop-latest__grid">
        <ProductCard
          v-for="item in similarProducts"
          :key="item.documentId"
          :product="item"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.product-page {
  padding-top: 40px;
  padding-bottom: 80px;
}

.product-page__wrapper {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.product-page__gallery {
  flex: 1;
  min-width: 300px;
}

.product-page__gallery-main img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.product-page__gallery-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.product-page__gallery-thumbs img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.product-page__gallery-thumbs img.is-active {
  border-color: var(--color-accent, #000);
}

.product-page__details {
  flex: 1;
  min-width: 300px;
}

.product-page__title {
  font-size: 28px;
  margin-bottom: 16px;
}

.product-page__price {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--color-accent, #a18a68);
}

.product-page__rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.stars {
  color: #ccc;
  display: flex;
  gap: 2px;
  font-size: 20px;
}

.stars .full {
  color: #000;
}

.stars .half {
  color: #000;
  position: relative;
}

.stars .half::after {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  color: #ccc;
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.product-page__description {
  color: var(--color-gray-dark, #707070);
  line-height: 1.6;
  margin-bottom: 32px;
}

.product-page__actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.btn-add-cart {
  background: #000;
  color: #fff;
  flex: 1;
}

.btn-icon {
  background: transparent;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
</style>
