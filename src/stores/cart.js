import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref([]);
    const isOpen = ref(false);

    const toggleCart = () => {
      isOpen.value = !isOpen.value;
    };

    const closeCart = () => {
      isOpen.value = false;
    };

    const openCart = () => {
      isOpen.value = true;
    };

    const addToCart = (product, qty = 1) => {
      const existing = items.value.find((p) => p.documentId === product.documentId);
      if (existing) {
        if (existing.quantity + qty <= product.itemsInStock) {
          existing.quantity += qty;
        } else {
          existing.quantity = product.itemsInStock;
        }
      } else {
        if (product.itemsInStock > 0) {
          items.value.push({ ...product, quantity: Math.min(qty, product.itemsInStock) });
        }
      }
    };

    const removeFromCart = (documentId) => {
      items.value = items.value.filter((p) => p.documentId !== documentId);
    };

    const updateQuantity = (documentId, qty) => {
      const item = items.value.find((p) => p.documentId === documentId);
      if (item) {
        if (qty > 0 && qty <= item.itemsInStock) {
          item.quantity = qty;
        } else if (qty <= 0) {
          removeFromCart(documentId);
        }
      }
    };

    const getQuantity = (documentId) => {
      const existing = items.value.find((p) => p.documentId === documentId);
      return existing ? existing.quantity : 0;
    };

    const cartTotalCount = computed(() => {
      return items.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    const cartTotalPrice = computed(() => {
      return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    return {
      items,
      isOpen,
      toggleCart,
      closeCart,
      openCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      getQuantity,
      cartTotalCount,
      cartTotalPrice
    };
  },
  {
    persist: {
      paths: ['items'] 
    },
  }
);
