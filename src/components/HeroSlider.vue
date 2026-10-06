<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getPromos } from '../services/api';

const modules = [Pagination, Autoplay];
const promos = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    promos.value = await getPromos();
  } catch (error) {
    console.error('Failed to load promos:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="hero__loading">Loading...</div>
  <Swiper
    v-else
    :modules="modules"
    :pagination="{ clickable: true, el: '.hero__pagination' }"
    :autoplay="{ delay: 5000, disableOnInteraction: false }"
    class="hero__slider"
  >
    <SwiperSlide v-for="promo in promos" :key="promo.documentId">
      <div class="hero__slide-wrapper">
        <img :src="promo.desktopImage" alt="Promo" class="hero__image" />
        <div class="hero__content">
          <h2 class="hero__title">{{ promo.product?.title }}</h2>
          <div class="hero__price">
            $ {{ promo.product?.price?.toFixed(2) }}
          </div>
          <RouterLink
            :to="`/products/${promo.product?.documentId}`"
            class="hero__btn"
          >
            View Product
          </RouterLink>
        </div>
      </div>
    </SwiperSlide>
    <!-- Pagination container inside the Swiper component to match old design -->
    <div class="hero__pagination"></div>
  </Swiper>
</template>

<style scoped>
.hero__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 646px; /* Matches old CSS height */
  background-color: var(--color-gray-light, #efefef);
  border-radius: 16px;
}

.hero__slider {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.hero__slide-wrapper {
  position: relative;
  width: 100%;
  height: 646px;
  display: flex;
  align-items: center;
}

.hero__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.hero__content {
  position: relative;
  z-index: 2;
  margin-left: 39px; /* Matches old layout spacing */
  max-width: 500px;
}

.hero__title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 33px;
  line-height: 43px;
  color: #ffffff;
  margin-bottom: 16px;
}

.hero__price {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 30px;
  line-height: 39px;
  color: #ffffff;
  margin-bottom: 48px;
}

.hero__btn {
  display: inline-block;
  padding: 12px 24px;
  border: 2px solid #ffffff;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
  color: #ffffff;
  text-decoration: none;
  background-color: transparent;
  transition: all 0.3s ease;
}

.hero__btn:hover {
  background-color: #ffffff;
  color: #000000;
}

.hero__pagination {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}

/* Custom Swiper pagination bullets to match old design */
:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background-color: transparent;
  border: 2px solid #ffffff;
  opacity: 1;
  border-radius: 50%;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #ffffff;
}
</style>
