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
      <div
        class="hero__slide-bg"
        :style="{ backgroundImage: `url(${promo.desktopImage})` }"
      >
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
    <div class="hero__pagination"></div>
  </Swiper>
</template>

<style scoped>
.hero__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background-color: var(--color-gray-light, #efefef);
  border-radius: 16px;
}
.hero__slide-bg {
  height: 500px;
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  display: flex;
  align-items: center;
}
.hero__slider {
  position: relative;
}
</style>
