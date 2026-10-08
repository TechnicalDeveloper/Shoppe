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
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="hero__loading"></div>
  <Swiper
    v-else
    :modules="modules"
    :pagination="{
      clickable: true,
      el: '.hero__pagination',
      bulletClass: 'hero__bullet',
      bulletActiveClass: 'hero__bullet--active',
    }"
    :autoplay="{ delay: 5000, disableOnInteraction: false }"
    class="hero__slider"
  >
    <SwiperSlide v-for="promo in promos" :key="promo.documentId">
      <div class="hero-slide">
        <picture class="hero-slide__picture">
          <source media="(width <= 768px)" :srcset="promo.mobileImage" />
          <img :src="promo.desktopImage" alt="Promo" class="hero-slide__img" />
        </picture>
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
  height: 646px;
  background-color: var(--color-gray-light, #efefef);
  border-radius: 8px;
}

.hero__slider {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  height: 646px;
}

.hero-slide {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.hero-slide__picture {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-slide__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 370px;
  margin-left: clamp(16px, 5vw, 48px);
  color: var(--color-white, #fff);
  box-sizing: border-box;
  max-height: 90%;
  overflow: hidden;
}

.hero__title {
  font-family: 'DM Sans', Arial, sans-serif;
  font-size: 33px;
  line-height: 43px;
  font-weight: 500;
  margin-bottom: 16px;
  color: inherit;
}

.hero__price {
  font-family: 'DM Sans', Arial, sans-serif;
  font-size: 30px;
  line-height: 39px;
  font-weight: 500;
  margin-bottom: 48px;
  color: inherit;
}

.hero__btn {
  display: inline-block;
  padding: 12px 24px;
  border: 2px solid #fff;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
  color: #fff;
  text-decoration: none;
  background-color: transparent;
  transition: all 0.3s ease;
}

.hero__btn:hover {
  background-color: #fff;
  color: #000;
}

.hero__pagination {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 5;
  pointer-events: auto;
  justify-content: center;
  align-items: center;
}

:deep(.hero__bullet) {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  display: inline-block;
  cursor: pointer;
  outline: none;
  border: none;
  transition: all 0.25s ease;
  opacity: 1;
}

:deep(.hero__bullet:hover),
:deep(.hero__bullet:focus-visible) {
  transform: scale(1.15);
  box-shadow: 0 0 0 6px rgb(255 255 255 / 20%);
}

:deep(.hero__bullet:active) {
  transform: scale(0.9);
  box-shadow: 0 0 0 3px rgb(255 255 255 / 15%);
}

:deep(.hero__bullet--active) {
  background: transparent;
  border: 1px solid #fff;
  box-shadow: none;
  transform: scale(1.1);
}

@media (width <= 1024px) {
  .hero__slider {
    height: auto;
    aspect-ratio: 16 / 9;
  }
}

@media (width <= 768px) {
  .hero__slider {
    width: 100%;
    max-width: none;
    height: auto;
    aspect-ratio: 288 / 354;
    display: flex;
    margin: 0;
  }

  .hero-slide {
    align-items: flex-end;
  }

  .hero__title {
    font-size: 20px;
    line-height: 26px;
    text-transform: capitalize;
    margin-bottom: 5px;
  }

  .hero__price {
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 10px;
  }

  .hero__btn {
    padding: 7px 13px;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    margin-bottom: 24px;
  }

  .hero__content {
    justify-content: flex-end;
    margin-left: 16px;
    max-width: 90vw;
  }
}

@media (width <= 480px) {
  .hero__slider {
    max-width: 288px;
    height: 354px;
    margin: 0 auto;
  }

  .hero__pagination {
    display: none;
  }
}
</style>
