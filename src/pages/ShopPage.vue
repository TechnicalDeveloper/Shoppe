<script setup>
import { ref, watch, onMounted } from 'vue';
import { getProducts } from '../transport/api';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const meta = ref(null);
const isLoading = ref(true);

const search = ref('');
const sortBy = ref(''); 
const onSale = ref(false);
const inStock = ref(false);
const page = ref(1);

const fetchFilteredProducts = async () => {
  isLoading.value = true;
  try {
    const response = await getProducts({
      search: search.value,
      sortBy: sortBy.value,
      onSale: onSale.value,
      inStock: inStock.value,
      page: page.value,
      limit: 6
    });
    products.value = response.data;
    meta.value = response.meta;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

let searchTimeout = null;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchFilteredProducts();
  }, 500);
});

watch([sortBy, onSale, inStock], () => {
  page.value = 1;
  fetchFilteredProducts();
});

watch(page, () => {
  fetchFilteredProducts();
});

const prevPage = () => {
  if (page.value > 1) page.value--;
};

const nextPage = () => {
  if (meta.value && page.value < meta.value.pagination.pageCount) page.value++;
};

onMounted(() => {
  fetchFilteredProducts();
});
</script>

<template>
  <div class="shop-page container">
    <h1 class="shop-page__title">Shop The Latest</h1>
    <div class="shop-page__content">
      <aside id="shop-filters" class="shop-page__sidebar">
        
        <div class="filter-group search-group">
          <input 
            type="text" 
            v-model="search" 
            placeholder="Search..." 
            class="filter-search"
          />
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <div class="filter-group">
          <select v-model="sortBy" class="filter-select">
            <option value="">Sort By</option>
            <option value="price">Price</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div class="filter-group filter-toggles">
          <label class="toggle-row">
            <span>On sale</span>
            <div class="toggle-switch" :class="{ active: onSale }">
              <input type="checkbox" v-model="onSale" />
              <div class="toggle-slider"></div>
            </div>
          </label>
          <label class="toggle-row">
            <span>In stock</span>
            <div class="toggle-switch" :class="{ active: inStock }">
              <input type="checkbox" v-model="inStock" />
              <div class="toggle-slider"></div>
            </div>
          </label>
        </div>

      </aside>
      <div class="shop-page__main">
        <div v-if="isLoading" class="loading-state">Loading products...</div>
        <div v-else-if="products.length === 0" class="empty-state">No products found.</div>
        <div v-else>
          <div class="shop-latest__grid">
            <ProductCard
              v-for="product in products"
              :key="product.documentId"
              :product="product"
            />
          </div>
          
          <nav class="shop-page__pagination" aria-label="Pagination" v-if="meta && meta.pagination.pageCount > 1">
            <button :disabled="page === 1" @click="prevPage" class="shop-page__page shop-page__page--prev">Prev</button>
            <button 
              v-for="p in meta.pagination.pageCount" 
              :key="p" 
              @click="page = p"
              :class="['shop-page__page', { 'shop-page__page--active': page === p }]"
            >
              {{ p }}
            </button>
            <button :disabled="page === meta.pagination.pageCount" @click="nextPage" class="shop-page__page shop-page__page--next">Next</button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.filter-search, .filter-select, .toggle-row span {
  font-family: "DM Sans", sans-serif !important;
  color: #000;
}

.filter-search {
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #d8d8d8;
  font-size: 14px;
}
.filter-select {
  padding: 12px 16px;
  border: 1px solid #d8d8d8;
  border-radius: 4px;
  font-size: 14px;
}



.shop-page__title {
  font-family: "DM Sans", sans-serif;
  font-size: 33px;
  font-weight: 500;
  line-height: 43px;
  color: #000;
  margin-top: 0;
  margin-bottom: 0;
  padding-bottom: 37px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding-top: 20px;
}

.shop-page {
  --sticky-top: 100px;
  padding-top: 104px;
  padding-bottom: 6px;
}

.shop-page__content {
  display: flex;
  gap: 39px;
}
.shop-page__sidebar {
  width: 250px;
  flex-shrink: 0;
}
.shop-page__main {
  flex: 1;
  min-width: 0;
}

.filter-group {
  margin-bottom: 32px;
}
.search-group {
  position: relative;
}
.filter-search {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #ccc;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  background: transparent;
}
.search-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #707070;
}
.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  background: #fff;
  appearance: none;
  outline: none;
  cursor: pointer;
  background-image: url('data:image/svg+xml;utf8,<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="%23000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 16px center;
}
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 14px;
}
.toggle-switch {
  position: relative;
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 20px;
  transition: 0.3s;
}
.toggle-switch.active {
  background: #000;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-gray-dark, #707070);
}

</style>
