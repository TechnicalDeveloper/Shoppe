<script setup>
import { computed } from 'vue';
import { useCartStore } from '../stores/cart';
import { RouterLink } from 'vue-router';

const cartStore = useCartStore();

const cartItems = computed(() => cartStore.items);
const isOpen = computed(() => cartStore.isOpen);
const totalCount = computed(() => cartStore.cartTotalCount);
const totalPrice = computed(() => cartStore.cartTotalPrice);

const closeCart = () => cartStore.closeCart();
const increaseQty = (item) => cartStore.updateQuantity(item.documentId, item.quantity + 1);
const decreaseQty = (item) => cartStore.updateQuantity(item.documentId, item.quantity - 1);
const removeItem = (item) => cartStore.removeFromCart(item.documentId);

const formatPrice = (price) => {
  return `$ ${Number(price).toFixed(2)}`;
};

</script>

<template>
  <div>
    
    <div 
      class="cart-overlay" 
      :class="{ 'is-open': isOpen }" 
      @click="closeCart"
    ></div>

    <div class="cart-sidebar" :class="{ 'is-open': isOpen }">
      <div class="cart-sidebar__header">
        <h2 class="cart-sidebar__title">Shopping bag</h2>
        <button class="cart-sidebar__close" @click="closeCart">✕</button>
      </div>

      <div class="cart-sidebar__body">
        <p v-if="cartItems.length > 0" class="cart-sidebar__empty" style="margin-bottom: 16px;">
          {{ totalCount }} items
        </p>

        <div v-if="cartItems.length === 0" class="cart-sidebar__empty">
          Your shopping bag is empty.
        </div>

        <div v-else class="cart-sidebar__items">
          <div v-for="item in cartItems" :key="item.documentId" class="cart-item">
            <div class="cart-item__img-wrapper">
              <img :src="item.image || '/src/assets/placeholder.png'" :alt="item.title" class="cart-item__img" />
            </div>
            
            <div class="cart-item__info">
              <div class="cart-item__title">{{ item.title }}</div>
              <div class="cart-item__meta">
                <div class="cart-item__meta-item">Black / Medium</div>
              </div>
              <div class="cart-item__price">{{ formatPrice(item.price) }}</div>
              
              <div class="cart-item__controls">
                <button class="cart-item__btn" @click="decreaseQty(item)">-</button>
                <span class="cart-item__qty">{{ item.quantity }}</span>
                <button class="cart-item__btn" @click="increaseQty(item)" :disabled="item.quantity >= item.itemsInStock">+</button>
              </div>
            </div>

            <button class="cart-item__remove" @click="removeItem(item)">✕</button>
          </div>
        </div>
      </div>

      <div class="cart-sidebar__footer" v-if="cartItems.length > 0">
        <div class="cart-sidebar__summary">
          <span>Subtotal ({{ totalCount }} items)</span>
        </div>
        <div class="cart-sidebar__checkout-wrap" style="display: flex; align-items: center; gap: 16px;">
          <span style="font-weight: 600;">{{ formatPrice(totalPrice) }}</span>
          
          <RouterLink to="/cart" class="cart-sidebar__checkout" @click="closeCart" style="background: white; color: black; border: 1px solid black; text-decoration: none;">
            VIEW CART
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.cart-sidebar__checkout {
  background: #fff;
  color: #000;
  border: 1px solid #000;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font: 600 14px/18px "DM Sans", Arial, sans-serif;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.cart-sidebar__checkout:hover {
  background: #f5f5f5;
}
</style>
