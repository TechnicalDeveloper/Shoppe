<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProductById, getProducts, addReview } from '../transport/api';
import { useFavoritesStore } from '../stores/favorites';
import { useCartStore } from '../stores/cart';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();
const favoritesStore = useFavoritesStore();
const cartStore = useCartStore();

const product = ref(null);
const similarProducts = ref([]);
const isLoading = ref(true);

const activeImage = ref('');
const activeTab = ref('Description'); 

const selectedQty = ref(1);

const newReview = ref({ author: '', text: '', rate: 5 });
const isSubmittingReview = ref(false);
const showCartNotification = ref(false);

const fetchProductData = async (documentId) => {
  isLoading.value = true;
  try {
    const fetchedProduct = await getProductById(documentId);
    product.value = fetchedProduct;
    activeImage.value = fetchedProduct.image || '/src/assets/placeholder.png';
    selectedQty.value = 1;
    similarProducts.value = (await getProducts(3)).data;
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

const submitReview = async () => {
  if (!newReview.value.author || !newReview.value.text) return;
  isSubmittingReview.value = true;
  try {
    await addReview(product.value.documentId, newReview.value);
    await fetchProductData(product.value.documentId);
    newReview.value = { author: '', text: '', rate: 5 };
  } catch (error) {
    console.error(error);
  } finally {
    isSubmittingReview.value = false;
  }
};

const cartQuantity = computed(() => cartStore.getQuantity(product.value?.documentId));
const isOutOfStock = computed(() => {
  if (!product.value) return true;
  return product.value.itemsInStock <= 0 || cartQuantity.value >= product.value.itemsInStock;
});

const availableToAdd = computed(() => {
  if (!product.value) return 0;
  return Math.max(0, product.value.itemsInStock - cartQuantity.value);
});

const increaseQty = () => {
  if (selectedQty.value < availableToAdd.value) {
    selectedQty.value++;
  }
};

const decreaseQty = () => {
  if (selectedQty.value > 1) {
    selectedQty.value--;
  }
};

const handleAddToCart = () => {
  if (isOutOfStock.value || selectedQty.value < 1) return;
  cartStore.addToCart(product.value, selectedQty.value);
  showCartNotification.value = true;
  setTimeout(() => {
    showCartNotification.value = false;
  }, 3000);
  selectedQty.value = 1;
};

const productCategories = computed(() => {
  if (!product.value?.categories) return '';
  return product.value.categories.map(c => c.name).join(', ') || 'Fashion, Style';
});

</script>

<template>
  <div class="product-page container">
    
    <div v-if="showCartNotification" class="toast-banner">
      <span class="toast-banner__icon">✓</span>
      <span>{{ selectedQty }} "{{ product?.title }}" added to your Shopping bag.</span>
      <button class="toast-banner__view-cart" @click="cartStore.openCart()">VIEW CART</button>
    </div>

    <div v-if="isLoading" class="product-page__loading">Loading...</div>

    <div v-else-if="product" class="product-page__wrapper">
      <div class="product-page__gallery">
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
        <div class="product-page__gallery-main">
          <img :src="activeImage" :alt="product.title" />
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
          <div class="quantity-input" :class="{ 'is-disabled': isOutOfStock }">
            <button @click="decreaseQty">-</button>
            <input type="number" v-model.number="selectedQty" readonly />
            <button @click="increaseQty">+</button>
          </div>
          <button 
            class="btn btn-add-cart" 
            :disabled="isOutOfStock"
            @click="handleAddToCart"
          >
            {{ isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART' }}
          </button>
        </div>
        
        <div class="product-page__wishlist">
          <button class="btn-icon btn-wishlist" @click="toggleFavorite">
            <svg
              width="20"
              height="20"
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

        <div class="product-page__meta">
          <div class="meta-row"><strong>SKU:</strong> {{ product.id }}</div>
          <div class="meta-row"><strong>Categories:</strong> {{ productCategories }}</div>
        </div>
      </div>
    </div>

    <section v-if="product" class="product-tabs">
      <div class="tabs-header">
        <button 
          :class="{ active: activeTab === 'Description' }" 
          @click="activeTab = 'Description'">Description</button>
        <button 
          :class="{ active: activeTab === 'Additional information' }" 
          @click="activeTab = 'Additional information'">Additional information</button>
        <button 
          :class="{ active: activeTab === 'Reviews' }" 
          @click="activeTab = 'Reviews'">Reviews({{ product.reviews?.length || 0 }})</button>
      </div>

      <div class="tabs-content">
        <div v-if="activeTab === 'Description'">
          <p>{{ product.description || 'No description available.' }}</p>
        </div>

        <div v-if="activeTab === 'Additional information'">
          <p>{{ product.additionalInformation || 'Weight: 0.3 kg\nDimensions: 15 x 10 x 1 cm\nColours: Black, Browns, White\nMaterial: Metal' }}</p>
        </div>

        <div v-if="activeTab === 'Reviews'" class="reviews-tab">
          <div class="reviews-list-col">
            <h3>{{ product.reviews?.length || 0 }} Reviews for {{ product.title }}</h3>
            <div class="reviews-list">
              <div v-for="review in product.reviews" :key="review.id" class="review-item">
                <strong>{{ review.author }}</strong>
                <div class="stars small">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="i <= review.rate ? 'full' : 'empty'"
                    >★</span
                  >
                </div>
                <p>{{ review.text }}</p>
              </div>
              <p v-if="!product.reviews || product.reviews.length === 0">No reviews yet.</p>
            </div>
          </div>

          <div class="add-review-form-col">
            <h3>Add a Review</h3>
            <p class="form-hint">Required fields are marked *</p>
            <form @submit.prevent="submitReview">
              <div class="form-group">
                <label>Your Review*</label>
                <textarea v-model="newReview.text" required></textarea>
              </div>
              <div class="form-group">
                <label>Enter your name*</label>
                <input type="text" v-model="newReview.author" required />
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" /> Save my name, email, and website in this browser for the next time I comment
                </label>
              </div>

              <div class="form-group">
                <label>Your Rating*</label>
                <div class="rating-select">
                  <span v-for="i in 5" :key="i" class="star-select" @click="newReview.rate = i" :class="{ 'selected': i <= newReview.rate }">★</span>
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isSubmittingReview">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section class="shop-latest">
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
  padding-top: 20px;
  padding-bottom: 80px;
  position: relative;
}
.toast-banner {
  background: #f7f7f7;
  border-top: 2px solid #000;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
}
.toast-banner__icon {
  color: #fff;
  background: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.toast-banner__view-cart {
  margin-left: auto;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}
.product-page__wrapper {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
  margin-bottom: 80px;
}
.product-page__gallery {
  flex: 1.2;
  min-width: 300px;
  display: flex;
  gap: 20px;
}
.product-page__gallery-thumbs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.product-page__gallery-thumbs img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}
.product-page__gallery-thumbs img.is-active {
  border-color: #000;
}
.product-page__gallery-main {
  flex: 1;
}
.product-page__gallery-main img {
  width: 100%;
  object-fit: cover;
}
.product-page__details {
  flex: 1;
  min-width: 300px;
}
.product-page__title {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 500;
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
  margin-bottom: 32px;
}
.stars {
  color: #ccc;
  display: flex;
  gap: 2px;
  font-size: 16px;
}
.stars .full { color: #000; }
.stars .half { color: #000; position: relative; }
.stars .half::after {
  content: '★';
  position: absolute;
  left: 0; top: 0;
  color: #ccc;
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}
.stars.small { font-size: 14px; }
.reviews-count {
  font-size: 14px;
  color: #707070;
}
.product-page__description {
  color: var(--color-gray-dark, #707070);
  line-height: 1.6;
  margin-bottom: 40px;
}
.product-page__actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
}
.quantity-input {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 4px;
  padding: 4px 8px;
}
.quantity-input.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.quantity-input button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 12px;
  color: #707070;
}
.quantity-input input {
  width: 40px;
  text-align: center;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 16px;
}
.btn-add-cart {
  background: #000;
  color: #fff;
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}
.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.product-page__wishlist {
  margin-bottom: 40px;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 0;
}
.product-page__meta {
  border-top: 1px solid #eee;
  padding-top: 24px;
  color: #707070;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-row strong {
  color: #000;
  font-weight: 500;
  margin-right: 8px;
}

.product-tabs {
  margin-bottom: 80px;
}
.tabs-header {
  display: flex;
  gap: 40px;
  border-bottom: 1px solid #eee;
  margin-bottom: 32px;
}
.tabs-header button {
  background: none;
  border: none;
  font-size: 18px;
  padding-bottom: 16px;
  cursor: pointer;
  color: #707070;
  font-weight: 500;
}
.tabs-header button.active {
  color: #000;
  border-bottom: 2px solid #000;
}
.tabs-content {
  line-height: 1.8;
  color: #707070;
}
.reviews-tab {
  display: flex;
  gap: 80px;
  flex-wrap: wrap;
}
.reviews-list-col {
  flex: 1;
  min-width: 300px;
}
.reviews-list-col h3 {
  color: #000;
  margin-bottom: 24px;
  font-weight: 500;
}
.review-item {
  margin-bottom: 24px;
}
.review-item strong {
  display: block;
  color: #000;
  margin-bottom: 4px;
}
.review-item p {
  margin-top: 8px;
}
.add-review-form-col {
  flex: 1;
  min-width: 300px;
}
.add-review-form-col h3 {
  color: #000;
  margin-bottom: 8px;
  font-weight: 500;
}
.form-hint {
  font-size: 13px;
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #707070;
}
.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #ccc;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}
.form-group textarea {
  min-height: 60px;
  resize: vertical;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}
.rating-select {
  display: flex;
  gap: 4px;
  cursor: pointer;
}
.star-select {
  font-size: 20px;
  color: #ccc;
}
.star-select.selected {
  color: #000;
}
.submit-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}
.shop-latest {
  margin-bottom: 40px;
}
</style>
